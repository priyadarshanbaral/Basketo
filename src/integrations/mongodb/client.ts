// In-memory / browser-compatible mock for MongoDB in client/SSR
interface MockDocument {
  [key: string]: unknown;
}

interface MockCollection {
  insertOne: (doc: MockDocument) => Promise<{ insertedId: string }>;
  find: (filter?: MockDocument) => { toArray: () => Promise<MockDocument[]> };
}

interface MockDb {
  collection: (name: string) => MockCollection;
}

const memoryStore = new Map<string, MockDocument[]>();

export async function getMongoDb(): Promise<MockDb> {
  return {
    collection: (name: string) => ({
      insertOne: async (doc: MockDocument) => {
        const list = memoryStore.get(name) || [];
        const item: MockDocument = { _id: Math.random().toString(36).slice(2), ...doc };
        list.push(item);
        memoryStore.set(name, list);
        if (typeof window !== "undefined") {
          try {
            const raw = JSON.parse(localStorage.getItem(`mock_mongo_${name}`) || "[]");
            raw.push(item);
            localStorage.setItem(`mock_mongo_${name}`, JSON.stringify(raw));
          } catch (err) {
            console.warn("Storage write skipped", err);
          }
        }
        return { insertedId: String(item._id) };
      },
      find: () => ({
        toArray: async () => {
          if (typeof window !== "undefined") {
            try {
              return JSON.parse(localStorage.getItem(`mock_mongo_${name}`) || "[]");
            } catch (err) {
              console.warn("Storage read skipped", err);
            }
          }
          return memoryStore.get(name) || [];
        },
      }),
    }),
  };
}

export async function getMongoClient(): Promise<{
  db: () => Promise<MockDb>;
  close: () => Promise<void>;
}> {
  return {
    db: () => getMongoDb(),
    close: async () => {},
  };
}

export async function closeMongoDb(): Promise<void> {}
