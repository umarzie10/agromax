import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Award, Check, ChevronDown, Clock, Coffee, CreditCard, Download, Egg, FileCheck, Instagram,
  MapPin, Phone, Send, ShieldCheck, Sprout, Store, Truck, UtensilsCrossed, Package, Gift, Quote, ShoppingBasket, Snowflake,
} from "lucide-react";
import { categories, contacts, products, type Category, type ProductId } from "@/content/site";
import { translations, type Lang, type Dict } from "@/content/translations";
import hero from "@/assets/hero.jpg";
import farm from "@/assets/farm.jpg";
import cattle from "@/assets/cattle.jpg";
import eggs from "@/assets/eggs.jpg";
import chicken from "@/assets/chicken.jpg";
import dairy from "@/assets/dairy.jpg";

const btn = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const btnPrimary = `${btn} bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift`;
const btnOutline = `${btn} border-2 border-primary/25 bg-card text-foreground hover:border-primary hover:-translate-y-0.5`;
const btnAccent = `${btn} bg-accent text-accent-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift`;

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="flex shrink-0 items-center gap-2" aria-label="AgroMax">
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-accent">
        <Sprout className="h-5 w-5 text-forest" aria-hidden />
      </span>
      <span className={`font-display text-xl font-bold ${light ? "text-forest-foreground" : "text-foreground"}`}>AgroMax</span>
    </a>
  );
}

function LangSwitch({ lang, setLang, light = false }: { lang: Lang; setLang: (l: Lang) => void; light?: boolean }) {
  return (
    <div className={`flex items-center text-sm font-semibold ${light ? "text-forest-foreground/70" : "text-muted-foreground"}`} role="group" aria-label="Language">
      {(["uz", "ru"] as Lang[]).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1.5 opacity-50">|</span>}
          <button onClick={() => setLang(l)} aria-pressed={lang === l}
            className={`rounded px-1 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${lang === l ? (light ? "text-accent" : "text-primary") : "hover:text-foreground"}`}>
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

function Section({ id, title, subtitle, children, className = "" }: { id: string; title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`px-5 py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function Landing() {
  const [lang, setLangState] = useState<Lang>("uz");
  const [preselect, setPreselect] = useState<ProductId | null>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem("agromax-lang");
    if (saved === "ru" || saved === "uz") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
  }, [lang, t]);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("agromax-lang", l); };

  const askPrice = (id: ProductId) => {
    setPreselect(id);
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems: [string, string][] = [
    ["audience", t.nav.audience], ["products", t.nav.products], ["terms", t.nav.terms],
    ["farm", t.nav.farm], ["faq", t.nav.faq], ["contact", t.nav.contact],
  ];

  return (
    <div id="top" className="pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <LangSwitch lang={lang} setLang={setLang} />
            <a href="#order" className={`${btnPrimary} hidden !px-5 !py-2.5 !text-sm md:inline-flex`}>{t.cta.quote}</a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-5 pt-8 pb-16 sm:pt-14 sm:pb-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-earth">
                <Egg className="h-4 w-4" aria-hidden /> {t.hero.eyebrow}
              </p>
              <h1 className="mt-5 text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-6xl">{t.hero.title}</h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.hero.text}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#order" className={btnPrimary}>{t.cta.quote}</a>
                <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className={btnOutline}><Send className="h-5 w-5" aria-hidden />{t.cta.telegram}</a>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                {t.hero.badges.map((b, i) => {
                  const Icon = [Sprout, ShieldCheck, Truck][i]!;
                  return (
                    <li key={b} className="flex items-center gap-2.5 text-sm font-semibold">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
                      {b}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 -z-10 rotate-2 rounded-3xl bg-secondary" aria-hidden />
              <img src={hero} alt={t.hero.imgAlt} width={1280} height={1024} fetchPriority="high" className="aspect-[5/4] w-full rounded-3xl object-cover shadow-lift" />
            </div>
          </div>
        </section>

        {/* Audience */}
        <Section id="audience" title={t.audience.title} className="bg-card">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.audience.items.map((it, i) => {
              const Icon = [UtensilsCrossed, Coffee, Store, ShoppingBasket][i]!;
              return (
                <Reveal key={it.t}>
                  <div className="h-full rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/25 text-earth"><Icon className="h-6 w-6" aria-hidden /></span>
                    <h3 className="mt-5 text-xl font-semibold">{it.t}</h3>
                    <p className="mt-2 text-muted-foreground">{it.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* Products */}
        <Section id="products" title={t.products.title} subtitle={t.products.subtitle}>
          <div className="-mx-5 mb-8 overflow-x-auto px-5" role="group" aria-label={t.products.filter}>
            <div className="flex w-max gap-2">
              {(["all", ...categories] as const).map((c) => (
                <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c}
                  className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"}`}>
                  {t.categories[c]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.filter((p) => filter === "all" || p.category === filter).map((p) => {
              const it = t.products.items[p.id];
              const isMeat = p.category === "chicken" || p.category === "beef";
              return (
                <article key={p.id} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition-all duration-300 animate-in fade-in hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative overflow-hidden">
                    <img src={p.image} alt={it.name} loading="lazy" width={912} height={912} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold shadow-soft ${isMeat ? "bg-meat text-primary-foreground" : p.category === "eggs" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>{t.categories[p.category]}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-semibold sm:text-2xl">{it.name}</h3>
                    <dl className="mt-3 space-y-1.5 text-sm">
                      {[[t.products.pack, it.pack], [t.products.state, t.states[p.state]], [t.products.temp, p.temp], [t.products.shelf, `${p.shelfDays} ${t.products.days}`]].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
                      ))}
                    </dl>
                    <button onClick={() => askPrice(p.id)} className={`${btnOutline} mt-auto w-full !py-3`} style={{ marginTop: "1.5rem" }}>{t.products.ask}</button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <a href={contacts.catalogPdf} className={btnAccent}><Download className="h-5 w-5" aria-hidden />{t.products.pdf}</a>
          </div>
        </Section>

        {/* Terms */}
        <Section id="terms" title={t.terms.title} className="bg-secondary">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div className="space-y-4">
              {[[Package, t.terms.min], [CreditCard, t.terms.pay], [Truck, t.terms.zone]].map(([Icon, v], i) => {
                const I = Icon as typeof Package; const val = v as { t: string; d: string };
                return (
                  <Reveal key={i}>
                    <div className="flex gap-4 rounded-2xl bg-card p-5 shadow-soft">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><I className="h-5 w-5" aria-hidden /></span>
                      <div><h3 className="font-sans text-base font-bold">{val.t}</h3><p className="mt-1 text-muted-foreground">{val.d}</p></div>
                    </div>
                  </Reveal>
                );
              })}
              <Reveal>
                <div className="flex gap-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Snowflake className="h-5 w-5" aria-hidden /></span>
                  <div><h3 className="font-sans text-base font-bold">{t.terms.cold.t}</h3><p className="mt-1 text-muted-foreground">{t.terms.cold.d}</p></div>
                </div>
              </Reveal>
            </div>
            <Reveal>
              <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
                <h3 className="px-5 pt-5 font-sans text-base font-bold">{t.terms.tableTitle}</h3>
                <div className="overflow-x-auto p-5">
                  <table className="w-full min-w-[560px] text-left">
                    <thead><tr className="border-b border-border text-sm text-muted-foreground">{t.terms.cols.map((c) => <th key={c} className="pr-3 pb-3 font-semibold">{c}</th>)}</tr></thead>
                    <tbody>{t.terms.rows.map((r) => <tr key={r[0]} className="border-b border-border/60 last:border-0">{r.map((c, i) => <td key={i} className={`py-3.5 pr-3 ${i === 0 ? "font-semibold" : ""}`}>{c}</td>)}</tr>)}</tbody>
                  </table>
                  <p className="mt-4 text-sm text-muted-foreground">{t.terms.note}</p>
                </div>
              </div>
            </Reveal>
          </div>

        </Section>

        {/* How */}
        <Section id="how" title={t.how.title}>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.how.steps.map((s, i) => (
              <Reveal key={s}>
                <li className="relative h-full rounded-2xl border border-border bg-card p-6">
                  <span className="font-display text-5xl font-semibold text-accent">0{i + 1}</span>
                  <p className="mt-3 text-lg font-semibold">{s}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* Farm */}
        <Section id="farm" title={t.farm.title} className="bg-card">
          <div className="grid gap-8 lg:grid-cols-2">
            <Reveal>
              <p className="text-lg text-muted-foreground">{t.farm.text}</p>
              <ol className="mt-8 flex flex-wrap items-center gap-2">
                {t.farm.process.map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{s}</span>
                    {i < t.farm.process.length - 1 && <span className="text-earth" aria-hidden>→</span>}
                  </li>
                ))}
              </ol>
              <ul className="mt-8 space-y-3">
                {t.farm.certs.map((c) => (
                  <li key={c} className="flex items-center gap-3 rounded-xl border border-dashed border-earth/40 p-3 text-sm font-medium">
                    <FileCheck className="h-5 w-5 shrink-0 text-earth" aria-hidden />{c}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="grid grid-cols-2 gap-4">
              <img src={farm} alt={t.farm.alts[0]} loading="lazy" width={1200} height={912} className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover" />
              <img src={eggs} alt={t.farm.alts[1]} loading="lazy" width={912} height={912} className="aspect-square w-full rounded-2xl object-cover" />
              <img src={dairy} alt={t.farm.alts[2]} loading="lazy" width={912} height={912} className="aspect-square w-full rounded-2xl object-cover" />
            </Reveal>
          </div>
        </Section>

        {/* Sample */}
        <section className="px-5 py-12">
          <Reveal className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl bg-forest p-8 text-forest-foreground sm:p-12">
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/30" aria-hidden />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <Gift className="h-10 w-10 text-accent" aria-hidden />
                  <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{t.sample.title}</h2>
                  <p className="mt-3 text-lg opacity-85">{t.sample.text}</p>
                </div>
                <a href="#order" className={`${btnAccent} shrink-0`}>{t.sample.cta}</a>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Partners */}
        <Section id="partners" title={t.partners.title}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid h-20 place-items-center rounded-2xl border border-dashed border-border bg-card text-xs font-semibold text-muted-foreground">{t.partners.logo} {i + 1}</div>
            ))}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {t.partners.reviews.map((r) => (
              <Reveal key={r.a}>
                <figure className="h-full rounded-2xl bg-card p-6 shadow-soft">
                  <Quote className="h-7 w-7 text-accent" aria-hidden />
                  <blockquote className="mt-3 text-lg">{r.q}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-earth">{r.a}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Form */}
        <Section id="order" title={t.form.title} subtitle={t.form.subtitle} className="bg-secondary">
          <OrderForm t={t} preselect={preselect} />
        </Section>

        {/* FAQ */}
        <Section id="faq" title={t.faq.title}>
          <div className="mx-auto max-w-3xl space-y-3">
            {t.faq.items.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card px-6 py-4 open:shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {f.q}<ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-forest px-5 py-16 text-forest-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <Logo light />
            <p className="mt-4 font-display text-2xl">{t.footer.slogan}</p>
            <ul className="mt-8 space-y-4">
              <li><a href={contacts.phoneHref} className="flex items-center gap-3 hover:text-accent"><Phone className="h-5 w-5 text-accent" aria-hidden />{contacts.phone}</a></li>
              <li><a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-accent"><Send className="h-5 w-5 text-accent" aria-hidden />Telegram</a></li>
              <li><a href={contacts.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-accent"><Instagram className="h-5 w-5 text-accent" aria-hidden />Instagram</a></li>
              <li className="flex items-center gap-3"><Clock className="h-5 w-5 text-accent" aria-hidden /><span><span className="opacity-70">{t.footer.hours}:</span> {t.footer.hoursVal}</span></li>
              <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-accent" aria-hidden /><span><span className="opacity-70">{t.footer.address}:</span> {t.footer.addressVal}</span></li>
            </ul>
            <div className="mt-8"><LangSwitch lang={lang} setLang={setLang} light /></div>
          </div>
          <iframe title="Map" src={contacts.mapEmbed} loading="lazy" className="h-72 w-full rounded-2xl border-0 lg:h-full" />
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-forest-foreground/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm opacity-80">
          <p>© {new Date().getFullYear()} AgroMax. {t.footer.rights}</p>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-foreground/10 hover:bg-forest-foreground/20 text-xs font-semibold text-forest-foreground transition cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            <span>Admin Boshqaruv Paneli</span>
          </a>
        </div>
      </footer>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-3 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} !py-3`}><Send className="h-5 w-5" aria-hidden />{t.cta.tg}</a>
        <a href={contacts.phoneHref} className={`${btnAccent} !py-3`}><Phone className="h-5 w-5" aria-hidden />{t.cta.call}</a>
      </div>

      {/* Desktop floating Telegram */}
      <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" aria-label={t.cta.telegram}
        className="fixed right-6 bottom-6 z-50 hidden h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:scale-110 md:grid">
        <Send className="h-6 w-6" aria-hidden />
      </a>
    </div>
  );
}

type Errors = Partial<Record<"business" | "type" | "person" | "phone" | "products", string>>;

function OrderForm({ t, preselect }: { t: Dict; preselect: ProductId | null }) {
  const [selected, setSelected] = useState<ProductId[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  useEffect(() => { if (preselect) setSelected((s) => (s.includes(preselect) ? s : [...s, preselect])); }, [preselect]);

  const toggle = (id: ProductId) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      business: String(fd.get("business") || "").trim(),
      type: String(fd.get("type") || ""),
      person: String(fd.get("person") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      volume: String(fd.get("volume") || "").trim().slice(0, 200),
      message: String(fd.get("message") || "").trim().slice(0, 1000),
      products: selected,
    };
    const err: Errors = {};
    if (!data.business) err.business = t.form.errors.required;
    if (!data.type) err.type = t.form.errors.required;
    if (!data.person) err.person = t.form.errors.required;
    if (!/^\+?[\d\s()-]{9,18}$/.test(data.phone)) err.phone = t.form.errors.phone;
    if (!data.products.length) err.products = t.form.errors.products;
    setErrors(err);
    if (Object.keys(err).length) return;
    setStatus("sending");
    try {
      let sentSuccessfully = false;

      // 1. AgroMax Python FastAPI backend orqali jo'natish (DB saqlash + Stiker + Auto-Pin)
      try {
        const backendResp = await fetch("http://localhost:8000/api/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (backendResp.ok) {
          sentSuccessfully = true;
        }
      } catch (err) {
        console.warn("Backend serverga ulanish imkoni bo'lmadi, zaxira Telegram botiga yuborilmoqda:", err);
      }

      // 2. Agar backend o'chiq bo'lsa, to'g'ridan-to'g'ri Telegram API orqali zaxira yuborish
      if (!sentSuccessfully) {
        const productNames = data.products.map((id) => t.products.items[id as keyof typeof t.products.items]?.name ?? id).join(", ");
        const lines = [
          "🛒 <b>Yangi buyurtma — AgroMax</b>",
          "",
          `🏢 <b>Korxona:</b> ${data.business}`,
          `📋 <b>Tur:</b> ${data.type}`,
          `👤 <b>Mas'ul shaxs:</b> ${data.person}`,
          `📞 <b>Telefon:</b> <a href="tel:${data.phone}">${data.phone}</a>`,
          `📦 <b>Mahsulotlar:</b> ${productNames}`,
          data.volume ? `⚖️ <b>Hajm/Miqdor:</b> ${data.volume}` : null,
          data.message ? `💬 <b>Izoh:</b> ${data.message}` : null,
        ].filter(Boolean).join("\n");

        const resp = await fetch(
          "https://api.telegram.org/bot8980149764:AAFM3ljn83TuurTwB9CgF-9SLQbRUdo0GTU/sendMessage",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: "-1004349938020",
              text: lines,
              parse_mode: "HTML",
            }),
          }
        );
        if (!resp.ok) throw new Error("Telegram error");
      }
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-card p-10 text-center shadow-soft" role="status">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-8 w-8" aria-hidden /></span>
        <h3 className="mt-5 text-2xl font-semibold">{t.form.successTitle}</h3>
        <p className="mt-2 text-muted-foreground">{t.form.successText}</p>
        <button onClick={() => { setStatus("idle"); setSelected([]); }} className={`${btnOutline} mt-6`}>{t.form.again}</button>
      </div>
    );
  }

  const field = "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";
  const label = "text-sm font-semibold";
  const Err = ({ k }: { k: keyof Errors }) => errors[k] ? <p className="mt-1 text-sm text-destructive">{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto grid max-w-3xl gap-5 rounded-3xl bg-card p-6 shadow-soft sm:grid-cols-2 sm:p-10">
      <div><label htmlFor="business" className={label}>{t.form.business} *</label><input id="business" name="business" maxLength={100} className={field} aria-invalid={!!errors.business} /><Err k="business" /></div>
      <div>
        <label htmlFor="type" className={label}>{t.form.type} *</label>
        <select id="type" name="type" defaultValue="" className={field} aria-invalid={!!errors.type}>
          <option value="" disabled>{t.form.choose}</option>
          {t.form.types.map((x) => <option key={x} value={x}>{x}</option>)}
        </select><Err k="type" />
      </div>
      <div><label htmlFor="person" className={label}>{t.form.person} *</label><input id="person" name="person" maxLength={100} className={field} aria-invalid={!!errors.person} /><Err k="person" /></div>
      <div><label htmlFor="phone" className={label}>{t.form.phone} *</label><input id="phone" name="phone" type="tel" inputMode="tel" placeholder="+998 90 123 45 67" className={field} aria-invalid={!!errors.phone} /><Err k="phone" /></div>
      <fieldset className="sm:col-span-2">
        <legend className={label}>{t.form.products} *</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {products.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button type="button" key={p.id} onClick={() => toggle(p.id)} aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/50"}`}>
                {on && <Check className="h-4 w-4" aria-hidden />}{t.products.items[p.id].name}
              </button>
            );
          })}
        </div><Err k="products" />
      </fieldset>
      <div className="sm:col-span-2"><label htmlFor="volume" className={label}>{t.form.volume}</label><input id="volume" name="volume" maxLength={200} placeholder={t.form.volumePh} className={field} /></div>
      <div className="sm:col-span-2"><label htmlFor="message" className={label}>{t.form.message}</label><textarea id="message" name="message" rows={4} maxLength={1000} className={field} /></div>
      <button type="submit" disabled={status === "sending"} className={`${btnPrimary} sm:col-span-2 disabled:opacity-60`}>
        <Award className="h-5 w-5" aria-hidden />{status === "sending" ? t.form.sending : t.form.submit}
      </button>
    </form>
  );
}
