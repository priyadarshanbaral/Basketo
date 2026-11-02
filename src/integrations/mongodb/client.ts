import { MongoClient, type Db, type Collection } from "mongodb";

const URI = process.env.MONGODB_URI;
const DB_NAME = URI ? new URL(URI).pathname.replace("/", "") || "basketo" : "basketo";

let client: MongoClient | null = null;
let db: Db | null = null;
let connecting: Promise<Db> | null = null;
let useMock = !URI;

function matchesFilter(doc: any, filter?: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    const docVal = doc[key];
    if (val instanceof RegExp) {
      if (!val.test(String(docVal ?? ""))) return false;
    } else if (val && typeof val === "object" && "$not" in (val as any)) {
      const notVal = (val as any).$not;
      if (notVal instanceof RegExp) {
        if (notVal.test(String(docVal ?? ""))) return false;
      } else if (docVal === notVal) {
        return false;
      }
    } else if (docVal !== val) {
      return false;
    }
  }
  return true;
}

class InMemoryCollection {
  private items: any[] = [];
  public collectionName: string;
  constructor(name: string) {
    this.collectionName = name;
  }

  find(filter?: any) {
    const matched = this.items.filter((item) => matchesFilter(item, filter));
    return {
      toArray: async () => [...matched],
    };
  }

  async findOne(filter?: any) {
    return this.items.find((item) => matchesFilter(item, filter)) ?? null;
  }

  async countDocuments(filter?: any) {
    return this.items.filter((item) => matchesFilter(item, filter)).length;
  }

  async insertMany(docs: any[]) {
    this.items.push(...docs.map((d) => ({ ...d })));
    return { acknowledged: true, insertedCount: docs.length };
  }

  async insertOne(doc: any) {
    const copy = { ...doc };
    if (!copy._id) copy._id = Math.random().toString(36).slice(2);
    this.items.push(copy);
    return { acknowledged: true, insertedId: copy._id };
  }

  async deleteMany(filter?: any) {
    if (!filter || Object.keys(filter).length === 0) {
      const count = this.items.length;
      this.items = [];
      return { acknowledged: true, deletedCount: count };
    }
    const prev = this.items.length;
    this.items = this.items.filter((item) => !matchesFilter(item, filter));
    return { acknowledged: true, deletedCount: prev - this.items.length };
  }

  async replaceOne(filter: any, doc: any, options?: { upsert?: boolean }) {
    const idx = this.items.findIndex((item) => matchesFilter(item, filter));
    if (idx >= 0) {
      this.items[idx] = { ...doc };
      return { acknowledged: true, modifiedCount: 1, matchedCount: 1 };
    } else if (options?.upsert) {
      this.items.push({ ...doc });
      return { acknowledged: true, modifiedCount: 0, upsertedCount: 1, upsertedId: doc._id };
    }
    return { acknowledged: true, modifiedCount: 0, matchedCount: 0 };
  }

  async updateOne(filter: any, update: any, options?: { upsert?: boolean }) {
    const item = this.items.find((i) => matchesFilter(i, filter));
    if (item && update?.$set) {
      Object.assign(item, update.$set);
      return { acknowledged: true, modifiedCount: 1 };
    } else if (!item && options?.upsert) {
      const newItem = { ...(update?.$set || {}) };
      this.items.push(newItem);
      return { acknowledged: true, upsertedCount: 1 };
    }
    return { acknowledged: true, modifiedCount: 0 };
  }
}

const inMemoryStores = new Map<string, InMemoryCollection>();
function getInMemoryCollection(name: string): any {
  if (!inMemoryStores.has(name)) {
    inMemoryStores.set(name, new InMemoryCollection(name));
  }
  return inMemoryStores.get(name)!;
}

const mockDb: any = {
  collection: (name: string) => getInMemoryCollection(name),
};

async function connect(): Promise<Db> {
  if (useMock) return mockDb;
  if (db) return db;
  if (!URI) {
    useMock = true;
    return mockDb;
  }
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      client = new MongoClient(URI, { serverSelectionTimeoutMS: 2000 });
      await client.connect();
      db = client.db(DB_NAME);
      return db;
    } catch (err) {
      console.warn("[AI Studio] MongoDB not connected — using in-memory store", err);
      useMock = true;
      return mockDb;
    }
  })();
  try {
    return await connecting;
  } catch {
    useMock = true;
    return mockDb;
  } finally {
    connecting = null;
  }
}

export async function getMongoDb(): Promise<Db> {
  return connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  if (useMock) return client as any;
  await connect();
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