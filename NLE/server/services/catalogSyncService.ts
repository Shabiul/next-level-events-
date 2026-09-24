// Catalog freshness is now pushed via Supabase Realtime (clients subscribe
// directly to Postgres change events), not this server. This module just
// tracks a version counter for the (now-fallback-only) /api/catalog/version
// endpoint and the tdp_catalog_v cache-busting cookie -- both cheap,
// stateless, and safe on serverless. The old in-memory SSE client registry
// held one function invocation open per connected browser tab indefinitely,
// which doesn't work on Vercel: each container is stateless/short-lived, so
// a broadcast from one container's request handler couldn't even reach
// clients connected to a different container, on top of eating concurrency
// slots for the connection's whole lifetime.
let currentCatalogVersion: number = Date.now();

export function getCatalogVersion(): number {
  return currentCatalogVersion;
}

export function bumpCatalogVersion(): number {
  currentCatalogVersion = Date.now();
  return currentCatalogVersion;
}

export function broadcastCatalogUpdate(): void {
  bumpCatalogVersion();
}
