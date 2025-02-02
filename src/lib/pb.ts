// src/lib/pocketbase.ts
import PocketBase from "pocketbase";

const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL);

// Verificar si el usuario está autenticado
export function isAuthenticated() {
  return pb.authStore.isValid;
}

// Obtener usuario actual
export function getUser() {
  return pb.authStore.record;
}

// Iniciar sesión
export async function login(email: string, password: string) {
  try {
    return await pb.collection("users").authWithPassword(email, password);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
}

// Cerrar sesión
export function logout() {
  pb.authStore.clear();
}
