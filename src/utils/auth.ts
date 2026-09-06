"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

/**
 * Requires that the caller is authenticated.
 * Throws an error if there is no active session.
 * @returns The authenticated user from the session.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to perform this action");
  }
  return session.user;
}

/**
 * Requires that the caller is an authenticated admin.
 * Throws an error if the user is not logged in or not an admin.
 * @returns The authenticated admin user from the session.
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

/**
 * Requires that the caller is authenticated and belongs to the specified shop.
 * Admins bypass the shop check (they can access any shop).
 * @param shopId - The shop ID to verify against the user's assigned shop.
 * @returns The authenticated user from the session.
 */
export async function requireShopAccess(shopId: string) {
  const user = await requireAuth();
  if (user.role === "admin") {
    return user; // Admins can access any shop
  }
  if (user.assignedShop?._id !== shopId) {
    throw new Error("Forbidden: You do not have access to this shop");
  }
  return user;
}
