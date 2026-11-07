// Server-side Supabase database client.
// Provides collection-like access backed by Supabase tables, replacing MongoDB.
// All operations use the service-role client (bypasses RLS) — server-only.
import { supabaseAdmin } from "./client.server";

type Json = Record<string, unknown>;

export interface StoreDocument {
  id: string;
  [key: string]: unknown;
}

const TABLES = {
  registeredUsers: "registered_users",
  userData: "user_store_data",
  coupons: "coupons",
  addresses: "addresses",
  orders: "orders",
  notifications: "notifications",
  wishlist: "wishlist",
  reviews: "reviews",
  users: "users",
} as const;

function table(name: string) {
  return supabaseAdmin.from(name);
}

async function requireAdmin() {
  const { data: _ping, error } = await supabaseAdmin.from(TABLES.registeredUsers).select("id");
  if (error) throw new Error(`Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Details: ${error.message}`);
}

export async function getDb() {
  await requireAdmin();
  return {
    collections: () => ({
      users: () => Promise.resolve(table(TABLES.users)),
      addresses: () => Promise.resolve(table(TABLES.addresses)),
      orders: () => Promise.resolve(table(TABLES.orders)),
      coupons: () => Promise.resolve(table(TABLES.coupons)),
      notifications: () => Promise.resolve(table(TABLES.notifications)),
      wishlist: () => Promise.resolve(table(TABLES.wishlist)),
      reviews: () => Promise.resolve(table(TABLES.reviews)),
      cart: () => Promise.resolve(table(TABLES.addresses)),
      userData: () => Promise.resolve(table(TABLES.userData)),
      registeredUsers: () => Promise.resolve(table(TABLES.registeredUsers)),
    }),
    supabaseAdmin,
  };
}

export async function closeDb() {
  // Supabase client is stateless; nothing to close.
}

export async function countDocuments(tableName: string, filter: Json = {}): Promise<number> {
  let query = table(tableName).select("*", { count: "exact", head: true });
  for (const [k, v] of Object.entries(filter)) {
    query = (query as any).eq(k, v);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function findDocuments(tableName: string, filter: Json = {}, limit = 1000): Promise<StoreDocument[]> {
  let query = table(tableName).select("*").limit(limit);
  for (const [k, v] of Object.entries(filter)) {
    query = (query as any).eq(k, v);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StoreDocument[];
}

export async function findOneDocument(tableName: string, filter: Json): Promise<StoreDocument | null> {
  let query = table(tableName).select("*").maybeSingle();
  for (const [k, v] of Object.entries(filter)) {
    query = (query as any).eq(k, v);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? null) as StoreDocument | null;
}

export async function insertDocument(tableName: string, doc: StoreDocument): Promise<void> {
  const { error } = await table(tableName).insert(doc);
  if (error) throw error;
}

export async function upsertDocument(tableName: string, doc: StoreDocument): Promise<void> {
  const { error } = await table(tableName).upsert(doc);
  if (error) throw error;
}

export async function deleteDocument(tableName: string, id: string): Promise<void> {
  const { error } = await table(tableName).delete().eq("id", id);
  if (error) throw error;
}

export async function deleteWhere(tableName: string, filter: Json): Promise<void> {
  let query = table(tableName).delete();
  for (const [k, v] of Object.entries(filter)) {
    query = (query as any).eq(k, v);
  }
  const { error } = await query;
  if (error) throw error;
}
