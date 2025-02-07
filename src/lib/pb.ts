// src/lib/pocketbase.ts
import PocketBase, { type RecordModel } from "pocketbase";

const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL);

const AUTH_TIMEOUT = 3600 // Segundos que te mantiene autenticado

// Verificar si el usuario está autenticado
export function isAuthenticated() {
  return pb.authStore.isValid;
}


export function isLoggedIn() {
  let lastLogin = localStorage.getItem("Last Login")
  if (lastLogin) {
    const now = new Date()
    if (Number(lastLogin) + (AUTH_TIMEOUT * 1000) >= now.valueOf()) {
      return true
    }
    logout()
  }
  return false
}

// Obtener usuario actual
export function getUser() {
  return pb.authStore.record;
}

// Iniciar sesión
export async function login(email: string, password: string) {
  try {
    localStorage.setItem("Last Login", `${new Date().valueOf()}`)
    return await pb.collection("users").authWithPassword(email, password);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    localStorage.removeItem("Last Login")
    throw error;
  }
}

// Cerrar sesión
export function logout() {
  localStorage.removeItem("Last Login")
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

export type User = {
  id: string,
  num_cuenta: string,
  email: string,
  nombre: string,
  rol: string,
  password?: string
}

export function recordToUser(record: RecordModel): User {
  return {
    id: record.id,
    num_cuenta: record.account,
    email: record.email,
    nombre: record.name,
    rol: record.role
  }
}

export async function findUser(search: string) {
  const records = await pb.collection('users').getFullList({
    filter: `(name~'${search}' || account~'${search}' || email~'${search}')`
  }
  )
  return records.map((r) => recordToUser(r))
}

export async function listUsers() {
  const records = await pb.collection('users').getFullList({
    sort: '-name',
  });
  return records.map((r) => recordToUser(r))
}

export async function deleteUser(userId: string) {
  return await pb.collection('users').delete(userId);
}

export async function createUser(user: User) {
  const data = {
    password: user.password,
    passwordConfirm: user.password,
    email: user.email,
    emailVisibility: true,
    name: user.nombre,
    role: user.rol,
    account: user.num_cuenta
  }
  return await pb.collection('users').create(data);
}

export async function isInReservationTime() {
  if (!isLoggedIn()) {
    return false
  }

  const now = new Date()
  let limite = new Date()
  limite.setMinutes(now.getMinutes() - 29)
  try {
    const record = await pb.collection('reservations').getFirstListItem(`user="${getUser()?.id}"`, {
      filter: `date>"${limite.toISOString().replace("T", " ")}"`,
      sort: "-date"
    });
    limite = new Date(record.date)
    limite.setMinutes(limite.getMinutes() + 30)
    if (new Date(record.date) <= now && now < limite) {
      return true
    }

  } catch (error) {
    return false
  }

  return false
}