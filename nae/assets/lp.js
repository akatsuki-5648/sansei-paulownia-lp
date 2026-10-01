/* 京都皇帝早生桐 LP 共通 ── 2026-10-01 初版
   ★ライブラリ無し。★数字は HTML に最終値を書いておき、見えた時だけ数え上げる（★静的HTMLで数字が空にならない） */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ① 出てくる動き
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.matches("[data-count]")) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  $$("[data-reveal],.lines,.sprout,.growth-bars,[data-count]").forEach((el) => io.observe(el));

  // ② 数え上げ（★最終値は HTML に在る）
  function countUp(el) {
    if (reduce) return;
    const end = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.firstChild.nodeValue = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick); else el.firstChild.nodeValue = el.dataset.count;
    };
    requestAnimationFrame(tick);
  }

  // ③ 右の縦枠だけが入れ替わる（Growth）
  $$(".stage").forEach((stage) => {
    const imgs = $$(".stage__frame img", stage), cap = stage.querySelector(".stage__cap");
    const so = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = +e.target.dataset.show;
        imgs.forEach((im, k) => im.classList.toggle("is-on", k === i));
        if (cap && imgs[i]) cap.textContent = imgs[i].dataset.cap || "";
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    $$("[data-show]", stage).forEach((s) => so.observe(s));
  });

  // ④ 触れた部位の写真が隣に（Nothing wasted）
  $$(".uses").forEach((box) => {
    const items = $$(".use", box), pics = $$(".uses__frame > *", box);
    const on = (i) => { items.forEach((x, k) => x.classList.toggle("is-on", k === i)); pics.forEach((x, k) => x.classList.toggle("is-on", k === i)); };
    items.forEach((it, i) => { it.addEventListener("mouseenter", () => on(i)); it.addEventListener("focusin", () => on(i)); });
    const uo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) on(items.indexOf(e.target)); }), { rootMargin: "-48% 0px -48% 0px" });
    items.forEach((it) => uo.observe(it));
    on(0);
  });

  // ⑤ ヘッダの地／画面下のバー
  const hd = document.querySelector(".hd"), bar = document.querySelector(".bar"), hero = document.querySelector(".hero");
  const onScroll = () => {
    const y = scrollY;
    hd && hd.classList.toggle("is-scrolled", y > 40);
    if (bar && hero) {
      const past = y > hero.offsetHeight * 0.75;
      const contact = document.getElementById("contact");
      const inContact = contact && contact.getBoundingClientRect().top < innerHeight * 0.6 && contact.getBoundingClientRect().bottom > 0;
      bar.classList.toggle("is-shown", past && !inContact);
    }
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ⑥ フォーム ── ★送り先のサーバーは未接続。★メールソフトに本文を作って渡す（送るのは本人）
  //   ★件名は自動：【京都皇帝早生桐LP｜どのLP】用件｜入力した要点（★2026-10-01 Hikârư「件名を両方わかるように自動で」）
  $$("form[data-mailto]").forEach((f) => {
    f.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!f.reportValidity()) return;
      const val = (n) => { const el = f.querySelector(`[name="${n}"]`); return el ? el.value.trim() : ""; };
      const rows = $$("[name]", f).map((el) => {
        const lab = f.querySelector(`label[for="${el.id}"]`);
        const k = lab ? lab.childNodes[0].nodeValue.trim() : el.name;
        return `■${k}\n${(el.value || "（未記入）").trim()}`;
      });
      const keys = (f.dataset.subjectFields || "").split(",").map((s) => s.trim()).filter(Boolean);
      const parts = keys.map((k) => { const v = val(k); return k === "name" && v ? `${v} 様` : v; }).filter(Boolean);
      const subj = (f.dataset.subject || "お問い合わせ") + (parts.length ? "｜" + parts.join("・") : "");
      const now = new Date(), pad = (x) => String(x).padStart(2, "0");
      const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const head = `このメールは「${f.dataset.lp || document.title}」のフォームから作られました。\n送信元：${location.href.split("#")[0]}\n作成：${stamp}\n\n`;
      const href = `mailto:${f.dataset.mailto}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(head + rows.join("\n\n") + "\n")}`;
      window.__lpMailto = href; location.href = href;
    });
  });
})();
