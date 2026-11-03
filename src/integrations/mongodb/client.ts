import { MongoClient, type Db, type Document } from "mongodb";

export type StoreDocument = Document & { _id: string };

const URI = process.env.MONGODB_URI?.trim();
const DB_NAME = URI ? new URL(URI).pathname.replace(/^\/+/, "") || "basketo" : "basketo";

let client: MongoClient | null = null;
let db: Db | null = null;
let connecting: Promise<Db> | null = null;

async function connect(): Promise<Db> {
  if (!URI) {
    throw new Error("MongoDB is not configured. Set MONGODB_URI in your local .env file.");
  }
  if (db) return db;
  if (connecting) return connecting;
  connecting = (async () => {
    const mongoClient = new MongoClient(URI, { serverSelectionTimeoutMS: 10000 });
    try {
      await mongoClient.connect();
      client = mongoClient;
      db = mongoClient.db(DB_NAME);
      return db;
    } catch {
      await mongoClient.close().catch(() => undefined);
      throw new Error("MongoDB connection failed. Check MONGODB_URI, credentials, and network access.");
    }
  })();
  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export async function getMongoDb(): Promise<Db> {
  return connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  await connect();
  if (!client) throw new Error("MongoDB client is not connected.");
  return client;
}

export async function closeMongoDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    connecting = null;
  }
}

/** Cached, lazily-created collections. Safe to call from server + client. */
export function collections() {
  return {
    users: () => getMongoDb().then((d) => d.collection<StoreDocument>("users")),
    addresses: () => getMongoDb().then((d) => d.collection<StoreDocument>("addresses")),
    orders: () => getMongoDb().then((d) => d.collection<StoreDocument>("orders")),
    coupons: () => getMongoDb().then((d) => d.collection<StoreDocument>("coupons")),
    notifications: () =>
      getMongoDb().then((d) => d.collection<StoreDocument>("notifications")),
    wishlist: () => getMongoDb().then((d) => d.collection<StoreDocument>("wishlist")),
    reviews: () => getMongoDb().then((d) => d.collection<StoreDocument>("reviews")),
    cart: () => getMongoDb().then((d) => d.collection<StoreDocument>("cart")),
    userData: () => getMongoDb().then((d) => d.collection<StoreDocument>("user_data")),
    registeredUsers: () =>
      getMongoDb().then((d) => d.collection<StoreDocument>("registered_users")),
  };
}