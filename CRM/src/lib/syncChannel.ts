// Broadcast channel helper to signal catalog updates across tabs and apps
export function broadcastCrmUpdate(target: string, id?: string): void {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel('tdp_catalog_sync');
      bc.postMessage({ type: 'CATALOG_UPDATED', target, id, timestamp: Date.now() });
      bc.close();
    } catch {}
  }
}
