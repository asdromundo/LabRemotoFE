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

export async function updateUser(userId: string, { name, email, password, oldPassword }: any) {
  try {
    const data = {
      name,
      email,
      ...(password ? { password, passwordConfirm: password, oldPassword } : {})
    };

    const updatedUser = await pb.collection('users').update(userId, data);

    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    throw error;
  }
}

export async function getReservationsOn(date: string) {
  return await pb.collection("reservations").getFullList(
    {
      filter: 'date~"' + date + '"',
    }
  )
}

export async function getNextReservation(userId: string) {
  const date = new Date()
  const record = await pb.collection('reservations').getFirstListItem(`user="${userId}"`, {
    filter: `date>"${date.toISOString().replace("T", " ")}"`,
    sort: "-date"
  });
  return {
    id: record.id,
    date: record.date,
  }
}

export async function requestEmailChange(email: string) {
  await pb.collection('users').requestEmailChange(email);
}

export async function removeReservation(reservationId: string) {
  return await pb.collection('reservations').delete(reservationId);
}

export async function createReservation(date: string) {
  const data = {
    "user": getUser()?.id,
    "date": date
  };
  return await pb.collection('reservations').create(data);
}

export async function updateReservation(reservationId: string, date: string) {
  const now = new Date()
  if (now > new Date(date)) {
    date = "2000-01-01 00:00:00.000Z"
  }
  const data = {
    "user": getUser()?.id,
    "date": date
  };
  return await pb.collection('reservations').update(reservationId, data);
}