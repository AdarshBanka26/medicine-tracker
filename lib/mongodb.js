import mongoose from 'mongoose';
import { Resolver } from 'dns/promises';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Resolve the mongodb+srv:// SRV records using a custom Resolver pointed at
// Google DNS (8.8.8.8). The system DNS on this machine refuses SRV queries.
// Returns a standard mongodb:// URI with the resolved hosts.
async function resolveMongoURI(srvUri) {
  // Only patch SRV URIs
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;

  const url = new URL(srvUri);
  const hostname = url.hostname; // e.g. medicine-tracker.wbrn4mv.mongodb.net

  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${hostname}`),
    resolver.resolveTxt(hostname).catch(() => []),
  ]);

  // Build host list from SRV records
  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');

  // Extract replicaSet and authSource from TXT record
  const txtOptions = {};
  for (const record of txtRecords.flat()) {
    for (const pair of record.split('&')) {
      const [k, v] = pair.split('=');
      if (k && v) txtOptions[k] = v;
    }
  }

  // Reconstruct as a standard mongodb:// URI (URL constructor rejects multi-host strings)
  const user   = encodeURIComponent(decodeURIComponent(url.username));
  const pass   = encodeURIComponent(decodeURIComponent(url.password));
  const auth   = txtOptions.authSource  || 'admin';
  const rsOpt  = txtOptions.replicaSet  ? `&replicaSet=${txtOptions.replicaSet}` : '';

  return `mongodb://${user}:${pass}@${hosts}/?ssl=true&authSource=${auth}${rsOpt}`;
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = resolveMongoURI(MONGODB_URI)
      .then((resolvedUri) =>
        mongoose.connect(resolvedUri, {
          dbName: 'grimoire',
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 20000,
        })
      )
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
