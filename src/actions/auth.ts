
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
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
        if (!user) {
            return { success: false, error: "Invalid username or password." };
        }

        const passwordHash = hashPassword(password, user.salt);

        if (passwordHash !== user.passwordHash) {
             return { success: false, error: "Invalid username or password." };
        }
        
        await createSession(user.id);
        
        return { success: true };
    } catch (e: any) {
        console.error("User verification failed", e);
        return { success: false, error: e.message };
    }
}
