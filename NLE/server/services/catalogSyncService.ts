import { Response } from "express";

let currentCatalogVersion: number = Date.now();
const sseClients = new Set<Response>();

export function getCatalogVersion(): number {
  return currentCatalogVersion;
}

export function bumpCatalogVersion(): number {
  currentCatalogVersion = Date.now();
  return currentCatalogVersion;
}

export function broadcastCatalogUpdate(reason: string = "catalog_updated", details: any = {}): void {
  const version = bumpCatalogVersion();
  const payload = JSON.stringify({
    type: "CATALOG_UPDATED",
    version,
    reason,
    timestamp: Date.now(),
    ...details,
  });

  const deadClients: Response[] = [];
  for (const client of sseClients) {
    try {
      client.write(`event: catalog_updated\ndata: ${payload}\n\n`);
    } catch {
      deadClients.push(client);
    }
  }

  for (const dead of deadClients) {
    sseClients.delete(dead);
  }
}

export function registerSseClient(res: Response): () => void {
  sseClients.add(res);
  return () => {
    sseClients.delete(res);
  };
}

// Keep-alive heartbeat every 20 seconds to prevent proxy / browser timeout
setInterval(() => {
  const deadClients: Response[] = [];
  for (const client of sseClients) {
    try {
      client.write(": keepalive\n\n");
    } catch {
      deadClients.push(client);
    }
  }
  for (const dead of deadClients) {
    sseClients.delete(dead);
  }
}, 20000);
