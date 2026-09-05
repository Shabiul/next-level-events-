// Vercel serverless entry point. The Express app itself is a valid
// (req, res) => void handler; server/server.ts already guards app.listen() behind
// `!process.env.VERCEL`, so importing it here just wires up routes/middleware
// without starting a real server.
export { default } from "../server/server";
