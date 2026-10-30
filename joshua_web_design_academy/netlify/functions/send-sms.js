const { authorized, response } = require("./_auth");
exports.handler = async (event) => {
  if (!authorized(event)) return response(401, { error: "Please log in again." });
  if (event.httpMethod !== "POST") return response(405, { error: "Method not allowed." });
  const apiKey = process.env.ARKESEL_API_KEY;
  const sender = process.env.ARKESEL_SENDER_ID;
  if (!apiKey || !sender) return response(500, { error: "Add ARKESEL_API_KEY and ARKESEL_SENDER_ID in Netlify environment variables." });
  let b;
  try { b = JSON.parse(event.body || "{}"); } catch { return response(400, { error: "Invalid request." }); }
  const name = String(b.name || "").trim();
  const message = String(b.message || "").trim();
  let phone = String(b.phone || "").replace(/[\s()-]/g, "");
  if (phone.startsWith("0")) phone = "+233" + phone.slice(1);
  if (phone.startsWith("233")) phone = "+" + phone;
  if (!/^\+233\d{9}$/.test(phone) || !name || !message || message.length > 600)
    return response(400, { error: "Enter a valid Ghana number (e.g. 0241234567) and a message under 600 characters." });
  try {
    const r = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ sender, message, recipients: [phone] })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || data.status !== "success") return response(502, { error: data.message || "Arkesel did not accept the SMS. Check your credits and sender ID." });
    return response(200, { ok: true, result: data });
  } catch (e) { return response(502, { error: "Could not reach Arkesel. Try again later." }); }
};
