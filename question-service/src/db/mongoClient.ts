import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import * as dotenv from 'dotenv';
// configure env variables
dotenv.config({ path: '.env.dev' });

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || '';

let db: Db;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectToDB(): Promise<Db> {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    if (!db) {
      await client.connect();
      db = client.db('Database1');
    }
    return db;
  } catch (err) {
    throw new Error(`Error connecting to the database: ${err}`);
  }
}
