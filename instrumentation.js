// Runs once when the Next.js server process starts, before any request handler.
// Used here to patch DNS so mongodb+srv:// SRV lookups work on networks
// whose default DNS doesn't handle SRV record queries.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: dns } = await import('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
}
