import { MongoClient } from "mongodb";

const uri = (process.env.MONGODB_URI || process.env.MONGODB_URL) as string;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}
const options = {};

let client: MongoClient;

// Extend the global type so TypeScript knows about our custom property
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

const clientPromise = global._mongoClientPromise as Promise<MongoClient>;

export default clientPromise;