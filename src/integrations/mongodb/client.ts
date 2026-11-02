import { MongoClient, type Db, type Collection } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/basketo";
const DB_NAME = new URL(URI).pathname.replace("/", "") || "basketo";

let client: MongoClient | null = null;
let db: Db | null = null;
let connecting: Promise<Db> | null = null;

async function connect(): Promise<Db> {
  if (db) return db;
  if (connecting) return connecting;
  connecting = (async () => {
    client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    db = client.db(DB_NAME);
    return db;
  })();
  try {
    return await connecting;
  } catch (err) {
    connecting = null;
    client = null;
    throw err;
  }
}

export async function getMongoDb(): Promise<Db> {
  return connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  await connect();
  // client is guaranteed non-null after a successful connect()
  return client as MongoClient;
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
    users: () => getMongoDb().then((d) => d.collection("users")),
    addresses: () => getMongoDb().then((d) => d.collection("addresses")),
    orders: () => getMongoDb().then((d) => d.collection("orders")),
    coupons: () => getMongoDb().then((d) => d.collection("coupons")),
    notifications: () => getMongoDb().then((d) => d.collection("notifications")),
    wishlist: () => getMongoDb().then((d) => d.collection("wishlist")),
    reviews: () => getMongoDb().then((d) => d.collection("reviews")),
    cart: () => getMongoDb().then((d) => d.collection("cart")),
  };
}