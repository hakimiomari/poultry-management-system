"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useScroll, useTransform, useReducedMotion, animate } from "motion/react";
/* eslint-disable @next/next/no-img-element -- plain <img> keeps SMIL animation in the SVG and avoids the image optimizer for static screenshots */
import { Bird, ClipboardList, Wallet, Stethoscope, Languages, ShieldCheck, BellRing, Smartphone, LogIn, Mail, ArrowRight, ChevronDown, Egg, TrendingDown, Wheat, Sun, Moon } from "lucide-react";

const Github = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
);

type Props = { signedIn: boolean; repoUrl: string; contactEmail: string };

/* ── helpers ─────────────────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;
function Reveal({ children, delay = 0, className = "", y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null); const inView = useInView(ref, { once: true, margin: "-10% 0px" }); const reduce = useReducedMotion();
  return <motion.div ref={ref} className={className} initial={reduce ? false : { opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.7, delay, ease }}>{children}</motion.div>;
}
function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null); const inView = useInView(ref, { once: true }); const [v, setV] = useState(0);
  useEffect(() => { if (!inView) return; const c = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (x) => setV(x) }); return () => c.stop(); }, [inView, to]);
  return <span ref={ref} className="tabular">{v.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>;
}
const Pill = ({ children }: { children: ReactNode }) => <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{children}</span>;

/* ── page ────────────────────────────────────────────────────────── */
export function Landing({ signedIn, repoUrl, contactEmail }: Props) {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  const appHref = signedIn ? "/dashboard" : "/login";

  const features = [
    { icon: Bird, title: "Flocks & sheds", text: "Broilers and layers, breed, intake, capacity-checked housing. Population is computed from movements — never typed in." },
    { icon: ClipboardList, title: "One-screen daily log", text: "Deaths, feed, water, eggs — big numeric inputs built for a worker's thumb in a dusty shed." },
    { icon: BellRing, title: "Alerts that matter", text: "Abnormal mortality, missing logs, overdue vet work. Thresholds live in settings, not in code." },
    { icon: Wallet, title: "Sales & purchases", text: "Feed, chicks, medicine, equipment, vet costs; eggs and birds sold. Credit, partial and paid — who owes whom, always." },
    { icon: Stethoscope, title: "Health & vet visits", text: "Vaccination schedule, treatments, check-ups with findings and cost that posts itself to finance." },
    { icon: Languages, title: "English · دری · پښتو", text: "Every label, error and enum in three languages with a true right-to-left layout and Solar Hijri dates." },
    { icon: ShieldCheck, title: "Roles & audit trail", text: "Owner, manager, worker, vet, accountant. Every change is validated on the server and written to the audit log." },
    { icon: Smartphone, title: "Phone-first, light or dark", text: "Bottom navigation, dialogs that keep your input on error, and a theme that follows you across devices." },
  ];
  const steps = [
    { n: "01", title: "Place the flock", text: "Create a shed and a flock: breed, intake date, chick count and cost. Capacity is enforced." },
    { n: "02", title: "Record every day", text: "Workers log deaths, feed, water and eggs in seconds. Sales and purchases go into finance." },
    { n: "03", title: "Read the farm at a glance", text: "Live population, mortality %, hen-day production, cash position and alerts — on any phone." },
  ];
  const shots = [
    { src: "/screens/dashboard-light.png", alt: "Dashboard — light theme", w: "wide" },
    { src: "/screens/finance-light.png", alt: "Finance — sales, purchases, balances", w: "wide" },
    { src: "/screens/flock-dark.png", alt: "Flock detail with charts — dark theme", w: "wide" },
    { src: "/screens/dashboard-dari-rtl.png", alt: "Dari — full right-to-left layout", w: "wide" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-heading font-bold"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg text-primary-foreground">🐔</span>PMS</Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a><a href="#how" className="hover:text-foreground">How it works</a><a href="#screens" className="hover:text-foreground">Screens</a><a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"><Github className="size-4" /><span className="hidden sm:inline">GitHub</span></a>
            <Link href={appHref} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><LogIn className="size-4" />{signedIn ? "Open dashboard" : "Login"}</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <motion.div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" animate={reduce ? undefined : { scale: [1, 1.15, 1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-accent/40 blur-3xl" animate={reduce ? undefined : { y: [0, -30, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),var(--border)_calc(100%-1px)),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),var(--border)_calc(100%-1px))] bg-[size:64px_64px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        </div>
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24">
          <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}><Pill><Egg className="size-3.5" />Open-source poultry farm management</Pill></motion.div>
          <motion.h1 initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }} className="font-heading mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Every bird counted.<br /><span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">Every day recorded.</span>
          </motion.h1>
          <motion.p initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }} className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            PMS runs broiler and layer farms from a phone in the shed — flocks, daily logs, sales and purchases, vet visits and alerts — in English, Dari and Pashto.
          </motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease }} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={appHref} className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 sm:w-auto">{signedIn ? "Open dashboard" : "Try the live demo"}<ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></Link>
            <a href={repoUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-6 py-3.5 text-base font-semibold transition hover:bg-muted sm:w-auto"><Github className="size-4" />View on GitHub</a>
          </motion.div>
          <p className="mt-3 text-xs text-muted-foreground">Demo login: <span dir="ltr" className="font-mono">0700000001</span> / <span className="font-mono">owner123</span></p>
        </motion.div>
        {/* animated journey */}
        <motion.div initial={reduce ? false : { opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.4, ease }} className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="overflow-hidden rounded-2xl border shadow-2xl shadow-primary/10 ring-1 ring-foreground/5">
            <img src="/growth.svg" alt="From egg to result: egg, hatch, chick, grower, adult — with birds, weight, feed and eggs counted at every step" className="block w-full" />
          </div>
        </motion.div>
        <motion.a href="#stats" aria-label="Scroll" className="mx-auto mb-6 flex w-fit text-muted-foreground" animate={reduce ? undefined : { y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}><ChevronDown className="size-6" /></motion.a>
      </section>

      {/* stats */}
      <section id="stats" className="border-y bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[[<Bird key="b" />, 6060, "", "birds tracked in the demo"], [<Egg key="e" />, 2485, "", "eggs collected today"], [<TrendingDown key="t" />, 3.4, "%", "cumulative mortality"], [<Wheat key="w" />, 12192, " kg", "feed consumed"]].map(([icon, n, suf, label], i) => (
            <Reveal key={i} delay={i * 0.08} className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&>svg]:size-5">{icon as ReactNode}</div>
              <div><div className="font-heading text-2xl font-bold sm:text-3xl"><Counter to={n as number} suffix={suf as string} decimals={(n as number) % 1 ? 1 : 0} /></div><div className="text-xs text-muted-foreground sm:text-sm">{label as string}</div></div>
            </Reveal>))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center"><Pill>What&apos;s inside</Pill><h2 className="font-heading mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Built for the farm, not the office</h2><p className="mt-3 text-muted-foreground">Everything a small or mid-size poultry operation needs to stop running on notebooks and memory.</p></Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.08}>
              <motion.div whileHover={reduce ? undefined : { y: -4 }} className="h-full rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><f.icon className="size-5" /></div>
                <h3 className="mt-4 font-semibold">{f.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </motion.div>
            </Reveal>))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center"><Pill>How it works</Pill><h2 className="font-heading mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Three steps, then it runs itself</h2></Reveal>
          <div className="relative mt-12 grid gap-8 md:grid-cols-3">
            <div aria-hidden className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.12} className="relative text-center md:text-start">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary font-heading text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 md:mx-0">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </Reveal>))}
          </div>
        </div>
      </section>

      {/* screens */}
      <section id="screens" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center"><Pill>Screens</Pill><h2 className="font-heading mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Light, dark, and right-to-left</h2><p className="mt-3 text-muted-foreground">The same app, the way each person on the farm needs it.</p></Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {shots.map((s, i) => (
            <Reveal key={s.src} delay={(i % 2) * 0.1}>
              <motion.figure whileHover={reduce ? undefined : { scale: 1.015 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="overflow-hidden rounded-2xl border bg-card shadow-md">
                <img src={s.src} alt={s.alt} loading="lazy" className="block w-full" /><figcaption className="px-4 py-2.5 text-xs text-muted-foreground">{s.alt}</figcaption>
              </motion.figure>
            </Reveal>))}
          <Reveal className="md:col-span-2">
            <div className="grid items-center gap-8 rounded-2xl border bg-card p-6 sm:p-10 md:grid-cols-[1fr_auto]">
              <div><div className="flex items-center gap-2 text-primary"><Sun className="size-5" /><Moon className="size-5" /><Languages className="size-5" /></div>
                <h3 className="font-heading mt-3 text-2xl font-bold">Your language, your theme, your phone</h3>
                <p className="mt-2 max-w-xl text-muted-foreground">Dari and Pashto flip the entire layout right-to-left, with Arabic-script typography and Gregorian + Solar Hijri dates. Light, dark or system theme follows your account. Bottom navigation and large inputs make it usable one-handed.</p>
                <div className="mt-4 flex flex-wrap gap-2">{["English", "دری", "پښتو", "RTL", "Dark mode", "PWA-ready"].map((x) => <Pill key={x}>{x}</Pill>)}</div></div>
              <motion.img src="/screens/mobile-dari.png" alt="Mobile view in Dari" loading="lazy" className="mx-auto w-44 rounded-[1.6rem] border-[6px] border-foreground/80 shadow-2xl" animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* tech */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Reveal className="text-center"><p className="text-sm font-medium text-muted-foreground">Open source · built with</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">{["Next.js 15", "React 19", "TypeScript", "Prisma", "SQLite / PostgreSQL", "Tailwind CSS 4", "shadcn/ui", "Vitest", "Motion"].map((x) => <span key={x} className="rounded-lg border bg-background px-3 py-1.5 text-sm font-medium">{x}</span>)}</div></Reveal>
        </div>
      </section>

      {/* CTA + contact */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <motion.div aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div aria-hidden className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-black/10 blur-2xl" animate={reduce ? undefined : { x: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
            <h2 className="font-heading relative text-3xl font-bold tracking-tight sm:text-4xl">Ready to count every bird?</h2>
            <p className="relative mx-auto mt-3 max-w-xl opacity-85">Try the demo, read the code, or get in touch to run PMS on your own farm.</p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={appHref} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-primary shadow-lg transition hover:-translate-y-0.5 sm:w-auto"><LogIn className="size-4" />{signedIn ? "Open dashboard" : "Open the app"}</Link>
              <a href={repoUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 font-semibold transition hover:bg-white/10 sm:w-auto"><Github className="size-4" />GitHub repository</a>
              {contactEmail && <a href={`mailto:${contactEmail}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 font-semibold transition hover:bg-white/10 sm:w-auto"><Mail className="size-4" />Contact</a>}
            </div>
            {!contactEmail && <p className="relative mt-4 text-sm opacity-80">Questions or ideas? <a href={`${repoUrl}/issues`} target="_blank" rel="noreferrer" className="underline underline-offset-4">Open an issue on GitHub</a>.</p>}
          </div>
        </Reveal>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">🐔</span><span className="font-medium text-foreground">PMS</span> · Poultry Management System</div>
          <div className="flex items-center gap-5"><a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a><Link href="/login" className="hover:text-foreground">Login</Link><a href="#contact" className="hover:text-foreground">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}
