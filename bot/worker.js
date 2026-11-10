// Cloudflare Worker: принимает заказ с сайта «Теплица» и отправляет его в Telegram.
//
// Секреты (Settings → Variables and Secrets в панели Cloudflare):
//   BOT_TOKEN        токен бота от @BotFather            (тип Secret)
//   CHAT_ID          куда слать заказы: id пользователя или чата; можно несколько через запятую
//   ALLOWED_ORIGINS  адреса сайта через запятую, например
//                    https://suvkovivan-cpu.github.io,https://teplica-flowers.ru
//
// Токен хранится только здесь и никогда не попадает на сайт.

const MAX_TEXT = 3500;           // Telegram принимает до 4096 символов
const MIN_TEXT = 40;

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const originOk = allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": originOk ? origin : allowed[0] || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return new Response("Teplica order bot: OK", { headers: cors });
    if (!originOk) return json({ ok: false, error: "origin" }, 403, cors);
    if (!env.BOT_TOKEN || !env.CHAT_ID) return json({ ok: false, error: "not configured" }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "bad json" }, 400, cors); }

    // Ловушка для спам-ботов: настоящий покупатель это поле не видит и не заполняет.
    if (body && body.website) return json({ ok: true, id: "" }, 200, cors);

    const text = String((body && body.text) || "").trim().slice(0, MAX_TEXT);
    const id = String((body && body.id) || "").replace(/[^\w-]/g, "").slice(0, 24);
    if (text.length < MIN_TEXT) return json({ ok: false, error: "empty" }, 400, cors);

    const message = `🌷 Новый заказ${id ? " № " + id : ""}\n\n${text}`;
    const chats = String(env.CHAT_ID).split(",").map((s) => s.trim()).filter(Boolean);

    const results = await Promise.all(chats.map((chat_id) =>
      fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text: message, disable_web_page_preview: true }),
      }).then((r) => r.ok).catch(() => false)
    ));

    if (!results.some(Boolean)) return json({ ok: false, error: "telegram" }, 502, cors);
    return json({ ok: true, id }, 200, cors);
  },
};
