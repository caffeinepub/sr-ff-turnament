import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createActorWithConfig } from "../config";

export interface UserRecord {
  username: string;
  ffName: string;
  phone: string;
  passwordHash: string;
  name: string;
  email: string;
}

interface UserAuthContextValue {
  currentUser: UserRecord | null;
  register: (
    phone: string,
    password: string,
    username: string,
    ffName: string,
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    phone: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; username?: string }>;
  logout: () => void;
  resetPassword: (
    phone: string,
    newPassword: string,
  ) => { success: boolean; error?: string };
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

function hashPassword(password: string): string {
  return btoa(password);
}

function getUsers(): UserRecord[] {
  try {
    return JSON.parse(localStorage.getItem("srff_users") || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem("srff_users", JSON.stringify(users));
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(() => {
    try {
      const stored = localStorage.getItem("srff_current_user");
      if (!stored) return null;
      return JSON.parse(stored) as UserRecord;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("srff_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("srff_current_user");
    }
  }, [currentUser]);

  async function register(
    phone: string,
    password: string,
    username: string,
    ffName: string,
  ): Promise<{ success: boolean; error?: string }> {
    const trimmedPhone = phone.trim();

    // Registration MUST succeed on backend — no localStorage-only fallback
    try {
      const actor = await createActorWithConfig();
      const exists = await actor.phoneUserExists(trimmedPhone);
      if (exists) {
        return {
          success: false,
          error: "An account already exists with this mobile number",
        };
      }
      await actor.registerPhoneUser(
        trimmedPhone,
        username.trim(),
        ffName.trim(),
        hashPassword(password),
      );
    } catch (err) {
      console.error("Backend register failed:", err);
      return {
        success: false,
        error:
          "Server se connect nahi ho saka. Internet check karo aur dobara try karo.",
      };
    }

    // Only save locally AFTER successful backend registration
    const newUser: UserRecord = {
      username: username.trim(),
      ffName: ffName.trim(),
      phone: trimmedPhone,
      passwordHash: hashPassword(password),
      name: username.trim(),
      email: "",
    };
    const users = getUsers();
    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  }

  async function login(
    phone: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; username?: string }> {
    const trimmedPhone = phone.trim();
    const hashed = hashPassword(password);

    // Try backend first
    try {
      const actor = await createActorWithConfig();
      const backendUser = await actor.getPhoneUser(trimmedPhone);
      if (backendUser && backendUser.passwordHash === hashed) {
        const userRecord: UserRecord = {
          username: backendUser.username,
          ffName: backendUser.ffName,
          phone: backendUser.phone,
          passwordHash: backendUser.passwordHash,
          name: backendUser.username,
          email: "",
        };
        // Sync to localStorage
        const users = getUsers();
        const idx = users.findIndex((u) => u.phone === trimmedPhone);
        if (idx !== -1) {
          users[idx] = userRecord;
        } else {
          users.push(userRecord);
        }
        saveUsers(users);
        setCurrentUser(userRecord);
        return { success: true, username: userRecord.username };
      }
      // Backend user found but wrong password
      if (backendUser) {
        return { success: false, error: "Mobile number ya password galat hai" };
      }
    } catch (err) {
      console.error("Backend login failed, trying localStorage:", err);
    }

    // Fallback to localStorage (login is safe to fallback — no cross-device write)
    const users = getUsers();
    const user = users.find(
      (u) => u.phone === trimmedPhone && u.passwordHash === hashed,
    );
    if (!user) {
      return { success: false, error: "Mobile number ya password galat hai" };
    }
    setCurrentUser(user);
    return { success: true, username: user.username };
  }

  function logout() {
    localStorage.removeItem("srff_current_user");
    setCurrentUser(null);
  }

  function resetPassword(phone: string, newPassword: string) {
    const users = getUsers();
    const idx = users.findIndex((u) => u.phone === phone.trim());
    if (idx === -1)
      return { success: false, error: "Yeh mobile number registered nahi hai" };
    users[idx] = { ...users[idx], passwordHash: hashPassword(newPassword) };
    saveUsers(users);
    return { success: true };
  }

  return (
    <UserAuthContext.Provider
      value={{ currentUser, register, login, logout, resetPassword }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}
