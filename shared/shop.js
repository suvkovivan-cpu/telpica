/* Общий модуль магазина: карточка товара, корзина, оформление заказа, отправка в Telegram.
   Сайт задаёт window.SHOP (настройки) и window.ITEMS (каталог) до подключения этого файла.

   ITEMS: [{ id, c, t, p, ph:[фото], d:"описание", s:["состав"], h:"размер", care:["уход"],
            v:[{l:"вариант", p:цена, h:"размер варианта"}] }]
   SHOP: {
     key, name, phone, phoneHref, telegram, email,
     endpoint,                      // адрес функции для заказов в Telegram ("" — ручная отправка)
     zones: [{ v:250, l:"Район", s:"250 ₽", t:"Доставка по району" }],
     pickup: "Самовывоз, адрес",     // текст в заказе
     pickupShort: "ул. Садовая, 1",
     notes: ["<b>Доставка:</b> ..."],
     care: ["совет по уходу"],     // общие советы по уходу (у товара можно задать свои)
     img: (ph, w) => url            // как получить адрес картинки нужной ширины
   } */
(function () {
  const S = window.SHOP, ITEMS = window.ITEMS;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = n => n.toLocaleString("ru-RU") + " ₽";
  const IMG = (p, w) => S.img(p, w || 600);
  window.SHOP_UTIL = { esc, fmt, IMG, price: i => (i.v ? "от " : "") + fmt(i.p) };

  /* ---------- markup ---------- */
  const zones = S.zones.map((z, k) => `<label><input type="radio" name="zone" value="${z.v}" data-z="${esc(z.t)}" ${k ? "" : "checked"}>${esc(z.l)}<small>${esc(z.s)}</small></label>`).join("");
  document.body.insertAdjacentHTML("beforeend", `
<dialog class="dlg pd" id="pd" aria-labelledby="pd-title">
  <button class="x" type="button" aria-label="Закрыть" data-close>×</button>
  <div class="pd-in">
    <div class="gal"><div class="gal-main" id="gal" tabindex="0" aria-label="Фото, листайте"></div><div class="dots" id="dots"></div><div class="thumbs" id="thumbs"></div></div>
    <div class="pd-info">
      <h3 id="pd-title"></h3>
      <div class="pd-price" id="pd-price"></div>
      <fieldset class="vars" id="pd-vars"></fieldset>
      <div class="pd-buy">
        <div class="qty"><button type="button" data-q="-1" aria-label="Меньше">−</button><output id="pd-q">1</output><button type="button" data-q="1" aria-label="Больше">+</button></div>
        <button class="sbtn" type="button" id="pd-add">В корзину</button>
      </div>
      <div class="pd-desc" id="pd-desc"></div>
      <div class="pd-spec" id="pd-spec"></div>
      <ul class="pd-notes">${S.notes.map(n => `<li>${n}</li>`).join("")}</ul>
      <p class="pd-alt">Вопрос по букету? <a href="${S.telegram}">Напишите флористу</a> или <a href="${S.phoneHref}">позвоните</a>.</p>
    </div>
  </div>
</dialog>
<dialog class="dlg cart" id="cart" aria-labelledby="cart-title">
  <button class="x" type="button" aria-label="Закрыть" data-close>×</button>
  <form class="cart-in" id="co" novalidate>
    <h3 id="cart-title">Корзина</h3>
    <div class="cart-body">
      <div id="cart-list"></div>
      <div id="co-form" class="hide">
        <fieldset class="fs"><legend>Открытка в подарок</legend>
          <label class="fld">Текст открытки<textarea name="card" maxlength="125" placeholder="С днём рождения! Обнимаю"></textarea><span class="cnt" data-cnt="card">0/125</span></label></fieldset>
        <fieldset class="fs"><legend>Ваши данные</legend>
          <div class="row2"><label class="fld">Имя*<input name="cname" autocomplete="name"></label><label class="fld">Телефон*<input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+7 900 000-00-00"></label></div>
          <label class="fld">Почта (пришлём чек)<input name="email" type="email" autocomplete="email"></label></fieldset>
        <fieldset class="fs"><legend>Получатель</legend>
          <div class="seg"><label><input type="radio" name="rcp" value="self" checked>Получу сам</label><label><input type="radio" name="rcp" value="other">Получит другой человек</label></div>
          <div class="row2 hide" data-show="rcp:other"><label class="fld">Имя получателя*<input name="rname"></label><label class="fld">Телефон получателя*<input name="rphone" type="tel" inputmode="tel"></label></div></fieldset>
        <fieldset class="fs"><legend>Способ получения</legend>
          <div class="seg"><label><input type="radio" name="how" value="delivery" checked>Доставка</label><label><input type="radio" name="how" value="pickup">Самовывоз<small>${esc(S.pickupShort)}</small></label></div>
          <div data-show="how:delivery" class="fs" style="border:0;padding:4px 0 0">
            <div class="seg">${zones}</div>
            <div class="row3"><label class="fld">Улица*<input name="street" autocomplete="address-line1"></label><label class="fld">Дом*<input name="house"></label><label class="fld">Квартира<input name="flat"></label></div>
            <div class="row2"><label class="fld">Корпус<input name="korp"></label><label class="fld">Город<input name="city" value="Москва"></label></div>
          </div></fieldset>
        <fieldset class="fs"><legend>Дата и время</legend>
          <div class="seg" id="days"></div>
          <label class="fld hide" data-show="day:other">Дата*<input type="date" name="date"></label>
          <label class="fld">Желаемое время*<select name="time" id="times"></select></label></fieldset>
        <fieldset class="fs"><legend>Пожелания</legend>
          <label class="fld">Цвет ленты, упаковка, детали<textarea name="note" maxlength="125"></textarea><span class="cnt" data-cnt="note">0/125</span></label></fieldset>
        <fieldset class="fs"><legend>Оплата</legend>
          <div class="seg"><label><input type="radio" name="pay" value="Онлайн по ссылке" checked>Онлайн<small>пришлём ссылку</small></label><label><input type="radio" name="pay" value="При получении">При получении</label></div></fieldset>
        <div class="fs" style="border:0">
          <label class="chk"><input type="checkbox" name="c1"><span>Я даю согласие на обработку персональных данных</span></label>
          <label class="chk"><input type="checkbox" name="c2"><span>Я даю согласие на передачу данных третьим лицам (курьерской службе)</span></label>
        </div>
        <label class="hp" aria-hidden="true">Сайт<input name="website" tabindex="-1" autocomplete="off"></label>
        <p class="err hide" id="co-err"></p>
      </div>
      <div id="co-sent" class="done hide">
        <h4>Спасибо! Заказ <span id="sent-id"></span> принят</h4>
        <p>Флорист получил заказ и скоро свяжется с вами по номеру <b id="sent-phone"></b>, чтобы подтвердить детали.</p>
        <pre id="sent-text"></pre>
        <button class="sbtn line" type="button" data-close>Вернуться к букетам</button>
      </div>
      <div id="co-done" class="done hide">
        <h4>Заказ почти готов</h4>
        <p class="err hide" id="auto-fail">Не получилось отправить заказ автоматически. Отправьте его вручную — это займёт несколько секунд.</p>
        <p>Отправьте его флористу — мы подтвердим наличие, время и пришлём ссылку на оплату.</p>
        <pre id="co-text"></pre>
        <a class="sbtn" id="send-tg" href="${S.telegram}">Отправить в Telegram</a>
        <a class="sbtn line" id="send-mail" href="#">Отправить на почту</a>
        <button class="sbtn line" type="button" id="copy-order">Скопировать текст заказа</button>
        <a class="sbtn line" href="${S.phoneHref}">Позвонить · ${esc(S.phone)}</a>
      </div>
    </div>
    <div class="cart-foot" id="cart-foot">
      <div class="sum"><span>Товары</span><span id="s-items">0 ₽</span></div>
      <div class="sum" id="s-del-row"><span>Доставка</span><span id="s-del">—</span></div>
      <div class="sum big"><span>К оплате</span><span id="s-total">0 ₽</span></div>
      <button class="sbtn" type="button" id="co-next">Оформить заказ</button>
      <button class="sbtn line hide" type="button" id="co-back">← Назад к корзине</button>
    </div>
  </form>
</dialog>
<div class="toast" id="toast" role="status"></div>`);

  /* ---------- state ---------- */
  function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 3500); }
  const KEY = (S.key || "shop") + "-cart";
  const store = { get() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (_) { return []; } }, set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) {} } };
  const byId = id => ITEMS.find(i => i.id === id);
  let cart = store.get().filter(c => byId(c.id));
  const unit = c => { const i = byId(c.id); return i.v ? i.v[c.v].p : i.p; };
  const label = c => { const i = byId(c.id); return i.v ? i.v[c.v].l : ""; };
  const itemsSum = () => cart.reduce((a, c) => a + unit(c) * c.q, 0);
  function saveCart() { store.set(cart); document.querySelectorAll("[data-count]").forEach(b => { const n = cart.reduce((a, c) => a + c.q, 0); b.textContent = n; b.classList.toggle("zero", !n); }); }
  saveCart();

  /* ---------- product ---------- */
  const pd = $("pd"); let cur = null, curV = 0, curQ = 1;
  function openProduct(i) {
    cur = i; curV = 0; curQ = 1;
    $("pd-title").textContent = i.t;
    $("gal").innerHTML = i.ph.map((p, k) => `<img src="${IMG(p, 1000)}" alt="${esc(i.t)} — фото ${k + 1}" ${k ? 'loading="lazy"' : ""}>`).join("");
    $("gal").scrollLeft = 0;
    $("thumbs").innerHTML = i.ph.length > 1 ? i.ph.map((p, k) => `<button type="button" data-k="${k}" aria-label="Фото ${k + 1}" aria-current="${!k}"><img src="${IMG(p, 160)}" alt=""></button>`).join("") : "";
    $("dots").innerHTML = i.ph.length > 1 ? i.ph.map((_, k) => `<i class="${k ? "" : "on"}"></i>`).join("") : "";
    $("pd-desc").innerHTML = i.d ? i.d.split("\n").filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("") : "";
    $("pd-vars").innerHTML = i.v ? `<legend>Размер</legend>` + i.v.map((v, k) => `<label class="var"><span><input type="radio" name="pv" value="${k}" ${k ? "" : "checked"}>${esc(v.l)}</span><span>${fmt(v.p)}</span></label>`).join("") : "";
    $("pd-vars").classList.toggle("hide", !i.v);
    const care = i.care || S.care;
    $("pd-spec").innerHTML =
      (i.s ? `<div class="spec"><b>Состав</b><ul>${i.s.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "") +
      `<div class="spec hide" id="pd-size-w"><b>Высота × ширина</b><span id="pd-size"></span></div>` +
      (care ? `<details class="spec care"><summary>Как ухаживать</summary><ul>${care.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>` : "");
    updPd();
    if (!pd.open) pd.showModal();
    try { history.replaceState(null, "", "#p-" + i.id); } catch (_) {}
  }
  function updPd() { const p = cur.v ? cur.v[curV].p : cur.p; $("pd-price").textContent = fmt(p * curQ); $("pd-q").textContent = curQ;
    const sz = cur.v ? cur.v[curV].h : cur.h; const w = $("pd-size-w"); if (w) { w.classList.toggle("hide", !sz); $("pd-size").textContent = sz || ""; } }
  $("pd-vars").addEventListener("change", e => { curV = +e.target.value; updPd(); });
  pd.querySelector(".pd-buy .qty").addEventListener("click", e => { const b = e.target.closest("[data-q]"); if (!b) return; curQ = Math.max(1, Math.min(20, curQ + +b.dataset.q)); updPd(); });
  $("thumbs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const g = $("gal"); g.scrollTo({ left: g.clientWidth * +b.dataset.k, behavior: "smooth" }); });
  $("gal").addEventListener("scroll", () => { const g = $("gal"), k = Math.round(g.scrollLeft / g.clientWidth); document.querySelectorAll("#thumbs button").forEach((b, j) => b.setAttribute("aria-current", j === k)); document.querySelectorAll("#dots i").forEach((d, j) => d.classList.toggle("on", j === k)); }, { passive: true });
  $("pd-add").addEventListener("click", () => {
    const ex = cart.find(c => c.id === cur.id && c.v === curV);
    if (ex) ex.q = Math.min(20, ex.q + curQ); else cart.push({ id: cur.id, v: curV, q: curQ });
    saveCart(); pd.close(); toast("Добавлено в корзину"); openCart();
  });
  pd.addEventListener("close", () => { try { if (location.hash.startsWith("#p-")) history.replaceState(null, "", location.pathname + location.search); } catch (_) {} });
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-item]"); if (!a || !pd.showModal) return;
    e.preventDefault(); const i = byId(a.dataset.item); if (i) openProduct(i);
  });
  document.querySelectorAll(".dlg").forEach(d => d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) d.close(); }));
  const fromHash = () => { const m = location.hash.match(/^#p-(.+)$/); const i = m && byId(m[1]); if (i && pd.showModal) openProduct(i); };
  fromHash(); addEventListener("hashchange", fromHash);

  /* ---------- cart ---------- */
  const cartDlg = $("cart"), co = $("co"); let step = "cart";
  function delivery() { if (co.how.value !== "delivery") return { p: 0, t: S.pickup }; const z = co.querySelector('[name="zone"]:checked'); return { p: +z.value, t: z.dataset.z }; }
  function renderCart() {
    $("cart-list").innerHTML = cart.length ? cart.map((c, k) => { const i = byId(c.id); return `
      <div class="ci"><img src="${IMG(i.ph[0], 200)}" alt="">
        <div><b>${esc(i.t)}</b>${label(c) ? `<small>Размер: ${esc(label(c))}</small>` : ""}
          <div class="qty"><button type="button" data-cq="${k}" data-d="-1" aria-label="Меньше">−</button><output>${c.q}</output><button type="button" data-cq="${k}" data-d="1" aria-label="Больше">+</button></div></div>
        <div class="ci-r"><span class="pr">${fmt(unit(c) * c.q)}</span><button type="button" class="rm" data-rm="${k}">Удалить</button></div>
      </div>`; }).join("") : `<p class="empty-cart">В корзине пока пусто. <a href="#catalog" data-close>Выбрать букет</a></p>`;
    totals();
  }
  function totals() {
    const it = itemsSum(), d = step === "form" ? delivery() : null;
    $("s-items").textContent = fmt(it);
    $("s-del-row").classList.toggle("hide", !d);
    if (d) $("s-del").textContent = d.p ? fmt(d.p) : (co.how.value === "pickup" ? "бесплатно" : "уточним");
    $("s-total").textContent = fmt(it + (d ? d.p : 0));
    $("co-next").disabled = !cart.length;
  }
  $("cart-list").addEventListener("click", e => {
    const q = e.target.closest("[data-cq]"), r = e.target.closest("[data-rm]");
    if (q) { const c = cart[+q.dataset.cq]; c.q = Math.max(1, Math.min(20, c.q + +q.dataset.d)); }
    else if (r) cart.splice(+r.dataset.rm, 1);
    else return;
    saveCart(); renderCart();
  });
  function setStep(s) {
    step = s;
    $("cart-list").classList.toggle("hide", s !== "cart");
    $("co-form").classList.toggle("hide", s !== "form");
    $("co-done").classList.toggle("hide", s !== "done");
    $("co-sent").classList.toggle("hide", s !== "sent");
    $("cart-foot").classList.toggle("hide", s === "done" || s === "sent");
    $("co-back").classList.toggle("hide", s !== "form");
    $("co-next").textContent = s === "form" ? "Подтвердить заказ" : "Оформить заказ";
    $("cart-title").textContent = { cart: "Корзина", form: "Оформление", sent: "Заказ принят", done: "Почти готово" }[s];
    cartDlg.querySelector(".cart-body").scrollTop = 0; cartDlg.scrollTop = 0;
    totals();
  }
  function openCart() { renderCart(); setStep("cart"); if (!cartDlg.open) cartDlg.showModal(); }
  document.addEventListener("click", e => { const b = e.target.closest("[data-open-cart]"); if (!b) return; e.preventDefault(); openCart(); });
  $("co-back").addEventListener("click", () => setStep("cart"));

  /* ---------- dates ---------- */
  const DAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
  const SLOTS = S.slots || [[9, 12], [12, 15], [15, 18], [18, 21]];
  const dstr = d => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  function buildDays() {
    const now = new Date(), opts = [];
    for (let k = 0; k < 3; k++) { const d = new Date(now); d.setDate(d.getDate() + k); if (k === 0 && now.getHours() >= SLOTS[SLOTS.length - 1][0] - 1) continue; opts.push([iso(d), ["Сегодня", "Завтра", "Послезавтра"][k], d]); }
    $("days").innerHTML = opts.map(([v, n, d], k) => `<label><input type="radio" name="day" value="${v}" ${k ? "" : "checked"}>${n}<small>${dstr(d)}</small></label>`).join("") + `<label><input type="radio" name="day" value="other">Другая дата</label>`;
    const t = new Date(now); t.setDate(t.getDate() + 1); co.date.min = iso(t);
    buildTimes();
  }
  function buildTimes() {
    const now = new Date(), today = iso(now), day = co.querySelector('[name="day"]:checked').value;
    const list = SLOTS.filter(([a]) => day !== today || a > now.getHours() + 1);
    $("times").innerHTML = `<option value="">Выберите время</option>` + list.map(([a, b]) => `<option>${a}:00–${b}:00</option>`).join("") + `<option>Уточнить у флориста</option>`;
  }
  co.addEventListener("change", e => {
    if (e.target.name === "day") buildTimes();
    document.querySelectorAll("[data-show]").forEach(el => { const [n, v] = el.dataset.show.split(":"); const c = co.querySelector(`[name="${n}"]:checked`); el.classList.toggle("hide", !c || c.value !== v); });
    totals();
  });
  co.addEventListener("input", e => { $("co-err").classList.add("hide"); const c = co.querySelector(`[data-cnt="${e.target.name}"]`); if (c) c.textContent = e.target.value.length + "/125"; });

  /* ---------- validation & order ---------- */
  const digits = v => v.replace(/\D/g, "");
  function validate() {
    const need = [["cname", "Укажите имя"], ["phone", "Укажите телефон"]];
    if (co.rcp.value === "other") need.push(["rname", "Укажите имя получателя"], ["rphone", "Укажите телефон получателя"]);
    if (co.how.value === "delivery") need.push(["street", "Укажите улицу"], ["house", "Укажите дом"]);
    if (co.querySelector('[name="day"]:checked').value === "other") need.push(["date", "Выберите дату"]);
    need.push(["time", "Выберите время"]);
    for (const [n, m] of need) if (!co[n].value.trim()) return [n, m];
    if (digits(co.phone.value).length < 10) return ["phone", "Проверьте номер телефона"];
    if (co.rcp.value === "other" && digits(co.rphone.value).length < 10) return ["rphone", "Проверьте телефон получателя"];
    if (!co.c1.checked || !co.c2.checked) return ["c1", "Нужно согласие на обработку и передачу данных"];
    return null;
  }
  function orderText() {
    const d = delivery(), dayIn = co.querySelector('[name="day"]:checked').value;
    const date = new Date((dayIn === "other" ? co.date.value : dayIn) + "T12:00:00");
    const L = [`Заказ с сайта «${S.name}»`, ""];
    cart.forEach((c, k) => { const i = byId(c.id); L.push(`${k + 1}. ${i.t}${label(c) ? " (" + label(c) + ")" : ""} × ${c.q} — ${fmt(unit(c) * c.q)}`); });
    L.push("", `Товары: ${fmt(itemsSum())}`, `${d.t}: ${d.p ? fmt(d.p) : co.how.value === "pickup" ? "бесплатно" : "уточнить"}`, `Итого: ${fmt(itemsSum() + d.p)}`, "");
    L.push(`Заказчик: ${co.cname.value.trim()}, ${co.phone.value.trim()}${co.email.value.trim() ? ", " + co.email.value.trim() : ""}`);
    L.push(co.rcp.value === "other" ? `Получатель: ${co.rname.value.trim()}, ${co.rphone.value.trim()}` : "Получатель: заказчик");
    if (co.how.value === "delivery") L.push(`Адрес: ${[co.city.value.trim() || "Москва", co.street.value.trim(), "д. " + co.house.value.trim(), co.korp.value.trim() && "корп. " + co.korp.value.trim(), co.flat.value.trim() && "кв. " + co.flat.value.trim()].filter(Boolean).join(", ")}`);
    L.push(`Когда: ${dstr(date)} (${DAYS[date.getDay()]}), ${co.time.value}`);
    if (co.card.value.trim()) L.push(`Текст открытки: «${co.card.value.trim()}»`);
    if (co.note.value.trim()) L.push(`Пожелания: ${co.note.value.trim()}`);
    L.push(`Оплата: ${co.pay.value}`);
    return L.join("\n");
  }
  $("co-next").addEventListener("click", () => {
    if (!cart.length) return;
    if (step === "cart") { buildDays(); setStep("form"); co.dispatchEvent(new Event("change")); return; }
    const bad = validate(), err = $("co-err");
    err.classList.toggle("hide", !bad);
    if (bad) { err.textContent = bad[1]; const f = co[bad[0]]; if (f && f.focus) { f.focus(); f.scrollIntoView({ block: "center", behavior: "smooth" }); } return; }
    const text = orderText();
    $("co-text").textContent = text;
    $("send-mail").href = `mailto:${S.email}?subject=` + encodeURIComponent("Заказ с сайта — " + co.cname.value.trim()) + "&body=" + encodeURIComponent(text);
    $("auto-fail").classList.add("hide");
    if (!S.endpoint) { setStep("done"); return; }
    sendAuto(text);
  });
  const orderId = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`; };
  async function sendAuto(text) {
    const btn = $("co-next"), id = orderId();
    btn.disabled = true; btn.textContent = "Отправляем заказ…";
    let ok = false;
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000);
      const r = await fetch(S.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, text, website: co.website.value }), signal: ctl.signal });
      clearTimeout(t); ok = r.ok && (await r.json()).ok === true;
    } catch (_) { ok = false; }
    btn.disabled = false;
    if (ok) { $("sent-id").textContent = "№ " + id; $("sent-phone").textContent = co.phone.value.trim(); $("sent-text").textContent = text; cart = []; saveCart(); setStep("sent"); }
    else { $("auto-fail").classList.remove("hide"); setStep("done"); }
  }
  const copy = t => navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject();
  $("copy-order").addEventListener("click", () => copy($("co-text").textContent).then(() => toast("Текст заказа скопирован"), () => toast("Выделите текст и скопируйте вручную")));
  $("send-tg").addEventListener("click", e => {
    const href = e.currentTarget.href; e.preventDefault();
    const go = () => { cart = []; saveCart(); location.href = href; };
    Promise.race([copy($("co-text").textContent).then(() => { toast("Заказ скопирован — вставьте его в чат"); return new Promise(r => setTimeout(r, 900)); }), new Promise(r => setTimeout(r, 1200))]).catch(() => {}).then(go);
  });
  $("send-mail").addEventListener("click", () => { cart = []; saveCart(); });

  window.SHOP_API = { openProduct, openCart, toast };
})();
