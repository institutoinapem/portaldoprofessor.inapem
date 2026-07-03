// Simple client-side auth store (demo). Replace with real backend when needed.
export type Teacher = {
  matricula: string;
  nome: string;
  email: string;
  password: string;
};

const USERS_KEY = "inapem:users";
const SESSION_KEY = "inapem:session";

export function getUsers(): Teacher[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUser(t: Teacher) {
  const users = getUsers();
  if (users.some((u) => u.matricula === t.matricula)) {
    throw new Error("Matrícula já cadastrada.");
  }
  users.push(t);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function login(matricula: string, password: string): Teacher {
  const user = getUsers().find(
    (u) => u.matricula === matricula && u.password === password,
  );
  if (!user) throw new Error("Matrícula ou senha inválidas.");
  localStorage.setItem(SESSION_KEY, matricula);
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function currentUser(): Teacher | null {
  if (typeof window === "undefined") return null;
  const m = localStorage.getItem(SESSION_KEY);
  if (!m) return null;
  return getUsers().find((u) => u.matricula === m) || null;
}
