const crypto = require("crypto");
const secret = process.env.SESSION_SECRET || "";
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function verify(token) {
  if (!secret || !token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest();
  let actual;
  try { actual = Buffer.from(sig, "base64url"); } catch { return false; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    return data.exp > Date.now();
  } catch { return false; }
}
function authorized(event) {
  const h = event.headers || {};
  return verify((h.authorization || h.Authorization || "").replace(/^Bearer\s+/i, ""));
}
function response(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}
module.exports = { sign, authorized, response };
