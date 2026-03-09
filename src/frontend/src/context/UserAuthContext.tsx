import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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
  ) => { success: boolean; error?: string };
  login: (
    phone: string,
    password: string,
  ) => { success: boolean; error?: string };
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
      return JSON.parse(localStorage.getItem("srff_current_user") || "null");
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

  function register(
    phone: string,
    password: string,
    username: string,
    ffName: string,
  ) {
    const users = getUsers();
    if (users.find((u) => u.phone === phone.trim())) {
      return {
        success: false,
        error: "An account already exists with this mobile number",
      };
    }
    const newUser: UserRecord = {
      username: username.trim(),
      ffName: ffName.trim(),
      phone: phone.trim(),
      passwordHash: hashPassword(password),
      name: username.trim(),
      email: "",
    };
    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  }

  function login(phone: string, password: string) {
    const users = getUsers();
    const user = users.find(
      (u) =>
        u.phone === phone.trim() && u.passwordHash === hashPassword(password),
    );
    if (!user)
      return { success: false, error: "Mobile number ya password galat hai" };
    setCurrentUser(user);
    return { success: true };
  }

  function logout() {
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
