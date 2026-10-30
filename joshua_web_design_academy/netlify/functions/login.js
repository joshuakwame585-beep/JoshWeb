const { sign, response } = require("./_auth");
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return response(405, { error: "Method not allowed" });
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) return response(500, { error: "Admin environment variables are not configured." });
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return response(400, { error: "Invalid request." }); }
  if (typeof body.password !== "string" || body.password !== password) return response(401, { error: "Incorrect password." });
  const token = sign({ exp: Date.now() + 8 * 60 * 60 * 1000 });
  return response(200, { token, expiresIn: 28800 });
};
