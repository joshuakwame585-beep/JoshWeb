const { authorized, response } = require("./_auth");
const base = () => process.env.SUPABASE_URL;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY;
async function db(path, options={}) {
  const url = base(), secret = key();
  if (!url || !secret) throw new Error("Supabase is not configured. Follow SETUP.md.");
  const r = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: secret, Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json", Prefer: "return=representation",
      ...(options.headers || {})
    }
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Database error (${r.status}): ${text.slice(0,250)}`);
  return text ? JSON.parse(text) : [];
}
exports.handler = async (event) => {
  if (!authorized(event)) return response(401, { error: "Please log in again." });
  try {
    if (event.httpMethod === "GET") {
      const rows = await db("students?select=*&order=created_at.desc");
      return response(200, { students: rows });
    }
    if (event.httpMethod === "POST") {
      const b = JSON.parse(event.body || "{}");
      const name = String(b.name || "").trim();
      const phone = String(b.phone || "").trim();
      const amount = Number(b.amount);
      const dueDate = String(b.dueDate || "").trim();
      if (!name || !phone || !Number.isFinite(amount) || amount < 0 || !dueDate)
        return response(400, { error: "Enter a name, phone number, valid amount and due date." });
      const rows = await db("students", { method: "POST", body: JSON.stringify([{ name, phone, amount, due_date: dueDate, status: "Pending" }]) });
      return response(200, { student: rows[0] });
    }
    if (event.httpMethod === "DELETE") {
      const id = String((JSON.parse(event.body || "{}")).id || "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) return response(400, { error: "Invalid student ID." });
      await db(`students?id=eq.${id}`, { method: "DELETE" });
      return response(200, { ok: true });
    }
    return response(405, { error: "Method not allowed." });
  } catch (e) { return response(500, { error: e.message }); }
};
