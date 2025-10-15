import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

// HELO
export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function createUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("User with this email already exists");

  const hashed = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      password: hashed,
      role: data.role || "COACH",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(id, data) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return updated;
}

export async function deleteUser(id) {
  const deleted = await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });
  return deleted;
}
