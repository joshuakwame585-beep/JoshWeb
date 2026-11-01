const { authorized, response } = require("./_auth");

exports.handler = async (event) => {
  if (!authorized(event)) return response(401, { error: "Please log in again." });
  if (event.httpMethod !== "POST") return response(405, { error: "Method not allowed." });

  const apiKey = process.env.SASUSYNC_API_KEY;
  const sender = "JWDACADEMY";

  if (!apiKey) {
    return response(500, { error: "SASUSYNC_API_KEY is missing from Netlify environment variables." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid request." });
  }

  const name = String(body.name || "").trim();
  const message = String(body.message || "").trim();
  let phone = String(body.phone || "").replace(/[\s()+-]/g, "");

  if (phone.startsWith("0")) phone = "233" + phone.slice(1);

  if (!/^233\d{9}$/.test(phone) || !name || !message || message.length > 650) {
    return response(400, {
      error: "Enter a valid Ghana number (e.g. 0241234567) and a message up to 650 characters."
    });
  }

  try {
    const result = await fetch("https://sms.sasusync.com/api/v1/send", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender,
        recipients: [phone],
        message
      })
    });

    const data = await result.json().catch(() => ({}));

    if (!result.ok || data.success !== true) {
      return response(502, {
        error: data.detail || data.message || "SasuSync sandbox rejected the SMS. Check the API key and request details."
      });
    }

    return response(200, {
      ok: true,
      sandbox: true,
      message: "Sandbox test accepted. No SMS was delivered and no credits were used.",
      result: data
    });
  } catch {
    return response(502, { error: "Could not reach SasuSync. Please try again." });
  }
};
