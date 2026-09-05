let app: any = null;
let initError: any = null;

try {
  // Dynamically import server so any module load error is captured safely
  const mod = await import("../server/server");
  app = mod.default || mod;
} catch (err: any) {
  initError = err;
  console.error("❌ FATAL: Error importing server in Vercel function:", err);
}

export default async function handler(req: any, res: any) {
  if (initError) {
    return res.status(500).json({
      success: false,
      error: "SERVER_INIT_FAILED",
      message: initError?.message || String(initError),
      stack: initError?.stack || null
    });
  }

  try {
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "SERVER_EXEC_FAILED",
      message: err?.message || String(err),
      stack: err?.stack || null
    });
  }
}
