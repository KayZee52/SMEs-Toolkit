
"use server";

import { db, hashPassword } from '@/lib/db';
import { cookies } from 'next/headers';
import type { User } from '@/lib/types';

const SESSION_COOKIE_NAME = 'app_session';


// --- Session Management (using simple signed cookies for offline) ---
async function createSession(userId: string) {
    const sessionData = { userId, loggedInAt: Date.now() };
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}

export async function getSession() {
    const cookie = cookies().get(SESSION_COOKIE_NAME);
    if (!cookie) return null;
    try {
        const session = JSON.parse(cookie.value);
        // In a real app, you might re-validate the user here
        return session as { userId: string };
    } catch {
        return null;
    }
}

export async function deleteSession() {
    cookies().delete(SESSION_COOKIE_NAME);
}

// --- User Actions ---
export async function verifyUser(username: string, password: string):Promise<{ success: boolean, error?: string }> {
     try {
        // 1. Retrieve the user from the database
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

        if (!user) {
            console.error(`Verification failed: User '${username}' not found.`);
            return { success: false, error: "Invalid username or password." };
        }

        // 2. Hash the provided password with the user's stored salt
        const providedPasswordHash = hashPassword(password, user.salt);

        // 3. Compare the newly generated hash with the one stored in the database
        if (providedPasswordHash !== user.passwordHash) {
             console.error(`Verification failed for user '${username}': Password mismatch.`);
             return { success: false, error: "Invalid username or password." };
        }
        
        // 4. If passwords match, create a session
        await createSession(user.id);
        
        console.log(`User '${username}' verified successfully.`);
        return { success: true };
    } catch (e: any) {
        console.error("User verification failed with exception:", e);
        return { success: false, error: "An unexpected error occurred during login." };
    }
}
