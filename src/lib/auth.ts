// ─────────────────────────────────────────
// Self-contained auth system (localStorage)
// No API keys or external services needed
// ─────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface StoredUser extends User {
    passwordHash: string;
}

const USERS_KEY = "neuramed_users";
const SESSION_KEY = "neuramed_session";

// Simple hash — NOT production-grade, but works without any dependencies
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "neuramed_salt_2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getUsers(): StoredUser[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveUsers(users: StoredUser[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Registration ──────────────────────────

export interface RegisterResult {
    success: boolean;
    error?: string;
    user?: User;
}

export async function register(
    name: string,
    email: string,
    password: string
): Promise<RegisterResult> {
    if (!name.trim()) return { success: false, error: "Name is required" };
    if (!email.trim()) return { success: false, error: "Email is required" };
    if (password.length < 6)
        return { success: false, error: "Password must be at least 6 characters" };

    const users = getUsers();
    const exists = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
        return { success: false, error: "An account with this email already exists" };
    }

    const passwordHash = await hashPassword(password);
    const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const user: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
    };

    // Auto-login after registration
    setSession(user);

    return { success: true, user };
}

// ── Login ─────────────────────────────────

export interface LoginResult {
    success: boolean;
    error?: string;
    user?: User;
}

export async function login(
    email: string,
    password: string
): Promise<LoginResult> {
    if (!email.trim()) return { success: false, error: "Email is required" };
    if (!password) return { success: false, error: "Password is required" };

    const users = getUsers();
    const stored = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!stored) {
        return { success: false, error: "No account found with this email" };
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== stored.passwordHash) {
        return { success: false, error: "Incorrect password" };
    }

    const user: User = {
        id: stored.id,
        name: stored.name,
        email: stored.email,
        createdAt: stored.createdAt,
    };

    setSession(user);

    return { success: true, user };
}

// ── Session ───────────────────────────────

function setSession(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): User | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
}
