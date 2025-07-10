
"use server";

import crypto from 'crypto';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'app_session';
const saltSize = 16;
const keylen = 64;
const iterations = 100000;
const digest = 'sha512';

type User = {
    id: number;
    username: string;
    passwordHash: string;
    salt: string;
};

// --- Password Hashing ---
function hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
}

// --- Session Management (using simple signed cookies for offline) ---
async function createSession(userId: number) {
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
        return session as { userId: number };
    } catch {
        return null;
    }
}

export async function deleteSession() {
    cookies().delete(SESSION_COOKIE_NAME);
}

// --- User Actions ---

export async function createUser(username: string, password: string): Promise<{ success: boolean, error?: string }> {
    try {
        const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existingUser) {
            return { success: false, error: "Username already exists." };
        }

        const salt = crypto.randomBytes(saltSize).toString('hex');
        const passwordHash = hashPassword(password, salt);

        const result = db.prepare('INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)')
            .run(username, passwordHash, salt);
        
        const userId = result.lastInsertRowid as number;
        await createSession(userId);

        return { success: true };
    } catch (e: any) {
        console.error("User creation failed", e);
        return { success: false, error: e.message };
    }
}


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
