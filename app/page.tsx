"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowDown, ArrowUpRight, Blocks, Check, Crosshair, Gamepad2, LoaderCircle, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { applicationSchema, games, platforms } from "@/lib/application-schema";

const notes = [
  { tag: "WELCOME", title: "Every great squad starts somewhere.", summary: "Meet NEXZZA. A new space for people who love to play.", body: ["NEXZZA starts with a simple idea: the people you play with matter as much as the game. This is a new community for builders, competitive players and anyone who enjoys a good co-op session.", "We’re gathering our first players. Tell us what you play through the join form below. Your application helps shape the community from the start.", "There are no scheduled events or live game servers announced yet. When there’s something to share, you’ll find it here."] },
  { tag: "OUR CODE", title: "Good competition. Better sportsmanship.", summary: "A few ground rules for a community worth coming back to.", body: ["Respect the person on the other side of the screen. Harassment, hate, threats and sharing someone’s private information have no place here.", "Play fair. No cheats, exploits or scams. Keep game-specific rules in mind and give new players room to learn.", "Keep personal information private, ask before recording others, and remember that taking a break is always okay. Winning feels good. Making everyone feel welcome lasts longer."] },
  { tag: "GET INVOLVED", title: "Bring your game. Find your people.", summary: "Builders, squad leaders, first-timers — there’s room for you.", body: ["Whether you’re planning a huge Minecraft build, looking for a regular squad, or discovering co-op for the first time, start by sharing your favourite game.", "Use your gaming name, an email where you can be contacted, and the platform you play on. A short introduction is optional.", "Submitting the form records an application for review. It doesn’t automatically create an account, reserve a server slot, or send an invitation. Never include passwords or other sensitive information."] },
];
const interests = [
  { icon: Blocks, number: "01", title: "Build & explore", copy: "Big ideas. Open worlds. A place to make something together.", label: "MINECRAFT · SANDBOX", game: "Minecraft", style: "build-card" },
  { icon: Crosshair, number: "02", title: "Find your squad", copy: "Make the call. Take the shot. Celebrate the win together.", label: "VALORANT · SHOOTERS", game: "Valorant", style: "squad-card" },
  { icon: Gamepad2, number: "03", title: "Just one more", copy: "Co-op adventures, casual sessions, and your next favourite game.", label: "CO-OP · EVERYTHING ELSE", game: "Other", style: "coop-card" },
];

export default function Home() {
  const [game, setGame] = useState("");
  const [platform, setPlatform] = useState("");
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const pending = useRef(false);

  useEffect(() => {
    type ModelTool = { name: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown };
    const context = (document as Document & { modelContext?: { registerTool: (tool: ModelTool, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "prepare_join_application",
        description: "Fill the visible NEXZZA community application for the visitor to review. This stages details only; it does not submit or save an application.",
        inputSchema: { type: "object", properties: { playerName: { type: "string", minLength: 2, maxLength: 32 }, email: { type: "string", format: "email", maxLength: 254 }, game: { type: "string", enum: [...games] }, platform: { type: "string", enum: [...platforms] }, message: { type: "string", maxLength: 600 } }, required: ["playerName", "email", "game", "platform"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const parsed = applicationSchema.safeParse(input);
          if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
          if (pending.current) return { ok: false, error: "An application is being submitted." };
          flushSync(() => { setSuccess(false); setGame(parsed.data.game); setPlatform(parsed.data.platform); setError(""); });
          const form = formRef.current;
          if (!form) return { ok: false, error: "Application form is unavailable." };
          for (const field of ["playerName", "email", "message"] as const) {
            const control = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement | null;
            if (control) control.value = parsed.data[field];
          }
          document.getElementById("join")?.scrollIntoView({ behavior: "auto" });
          return { ok: true, status: "staged_for_review", game: parsed.data.game, platform: parsed.data.platform, submitted: false };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch { /* Optional enhancement; the regular form remains available. */ }
    return () => lifecycle.abort();
  }, []);

  function chooseGame(value: string) {
    setGame(value);
    document.getElementById("join")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    window.setTimeout(() => document.getElementById("player-name")?.focus({ preventScroll: true }), 350);
  }

  async function submitApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    const data = new FormData(event.currentTarget);
    const parsed = applicationSchema.safeParse({ playerName: data.get("playerName"), email: data.get("email"), game, platform, message: data.get("message"), website: data.get("website") });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    pending.current = true;
    setSubmitting(true);
    try {
      const response = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(20000) });
      const result = await response.json() as { error?: string; ok?: boolean };
      if (!response.ok) throw new Error(result.error || "We couldn’t save your application. Please try again.");
      if (result.ok !== true) throw new Error("We couldn’t confirm your application. Please try again.");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error && e.name !== "TimeoutError" ? e.message : "Connection interrupted. Your details are still here — please try again.");
    } finally { pending.current = false; setSubmitting(false); }
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a href="#" aria-label="NEXZZA home" className="brand"><span className="brand-mark">N</span>NEXZZA</a>
        <nav aria-label="Main navigation"><a href="#community">The community</a><a href="#news">Community notes</a></nav>
        <Button asChild className="header-join"><a href="#join">Join the community <ArrowUpRight size={17} /></a></Button>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" role="img" aria-label="A lone explorer approaching a glowing yellow portal in a vast otherworldly valley" />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow hero-eyebrow"><Plus size={17} /> FOR THE LOVE OF THE GAME</p>
            <h1 id="hero-title">GOOD GAMES.<br />BETTER<br /><span>PEOPLE.</span></h1>
            <p className="hero-copy">New worlds. Close matches. One more game.<br className="desktop-break" /> It’s better with your people.</p>
            <Button asChild className="primary-cta"><a href="#join">Find your people <ArrowUpRight size={20} /></a></Button>
          </div>
          <a className="hero-explore" href="#community"><ArrowDown size={16} /> EXPLORE THE COMMUNITY</a>
          <div className="hero-caption"><span>NEXZZA / A NEW CHAPTER</span><strong>YOUR NEXT ADVENTURE<br />STARTS TOGETHER.</strong></div>
        </section>
        <div className="values-strip" aria-label="Our community values"><span>GOOD VIBES</span><Plus aria-hidden="true" /><span>FAIR PLAY</span><Plus aria-hidden="true" /><span>ALL SKILL LEVELS</span><Plus aria-hidden="true" /><span>ONE COMMUNITY</span></div>
        <section id="community" className="section community-section">
          <div className="section-heading"><div><p className="eyebrow">01 / THE COMMUNITY</p><h2>Different games.<br /><span className="muted-heading">Same energy.</span></h2></div><p>For the builders. The clutch players.<br />The “I’m just here for a good time” players.<br />Whatever your game, you belong here.</p></div>
          <div className="interest-grid">{interests.map(({ icon: Icon, ...item }) => <article key={item.title} className={"interest-card " + item.style}><div className="interest-top"><Icon size={34} strokeWidth={1.5} /><span>{item.number}</span></div><p className="game-label">{item.label}</p><h3>{item.title}</h3><p className="interest-copy">{item.copy}</p><button onClick={() => chooseGame(item.game)} className="card-link">I’m in <ArrowUpRight size={20} /><span className="sr-only"> — {item.title}</span></button></article>)}</div>
        </section>
        <section id="news" className="section news-section">
          <div className="section-heading"><div><p className="eyebrow">02 / COMMUNITY NOTES</p><h2>The latest drop.</h2></div><span className="section-aside">Small beginnings. Big possibilities.</span></div>
          <div className="news-list">{notes.map((note, index) => <button key={note.title} className="news-row" onClick={() => setActiveNote(index)} aria-label={"Read " + note.title}><span className="news-number">0{index + 1}</span><span className={"news-tag tag-" + index}>{note.tag}</span><span className="news-text"><strong>{note.title}</strong><span>{note.summary}</span></span><ArrowUpRight className="news-arrow" size={25} /></button>)}</div>
        </section>
        <section id="join" className="join-section">
          <div className="section join-grid"><div className="join-intro"><p className="eyebrow">03 / YOUR NEXT CHAPTER</p><h2>THERE’S A<br />SPOT FOR<br /><span>YOU.</span></h2><p>You bring the game.<br />Let’s find you some good company.</p><div className="join-note"><ShieldCheck size={21} /><span>All skill levels welcome.<br />Respect and fair play come first.</span></div></div>
            <div className="join-form-card">
              {success ? <div className="success-panel" role="status" aria-live="polite"><span className="success-icon"><Check size={33} /></span><p className="eyebrow">APPLICATION SAVED</p><h3>You’ve taken<br />the first step.</h3><p>Your application is ready for the community team to review. If you’ve applied before, your original application stays on file.</p><a href="#news" className="card-link">Explore community notes <ArrowUpRight size={20} /></a></div> : <form ref={formRef} onSubmit={submitApplication} aria-label="Community application">
                <h3>Join the community</h3><p className="form-description">Tell us a little about the player behind the name.</p>
                <div className="form-field"><label htmlFor="player-name">Player name <span>*</span></label><Input className="form-input" id="player-name" name="playerName" placeholder="What do your teammates call you?" required minLength={2} maxLength={32} autoComplete="nickname" /></div>
                <div className="form-field"><label htmlFor="email">Email address <span>*</span></label><Input className="form-input" id="email" name="email" type="email" placeholder="you@example.com" required maxLength={254} autoComplete="email" /></div>
                <div className="form-pair"><div className="form-field"><label htmlFor="game">Your game <span>*</span></label><Select value={game} onValueChange={setGame} name="game" required><SelectTrigger id="game" className="form-select"><SelectValue placeholder="Pick a game" /></SelectTrigger><SelectContent>{games.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div><div className="form-field"><label htmlFor="platform">Your platform <span>*</span></label><Select value={platform} onValueChange={setPlatform} name="platform" required><SelectTrigger id="platform" className="form-select"><SelectValue placeholder="Pick a platform" /></SelectTrigger><SelectContent>{platforms.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div></div>
                <div className="form-field"><label htmlFor="message">Say hello <span className="optional">Optional</span></label><Textarea id="message" name="message" className="form-input form-textarea" placeholder="Your favourite game, your play style, or just a hello." maxLength={600} rows={3} /></div>
                <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
                {error && <p id="form-error" className="form-error" role="alert">{error}</p>}
                <Button className="primary-cta form-submit" disabled={submitting} type="submit" aria-describedby={error ? "form-error" : undefined}>{submitting ? <><LoaderCircle className="spin" size={19} /> Sending application…</> : <>Send application <ArrowUpRight size={20} /></>}</Button>
                <p className="privacy-note">Your details are saved privately for application review and community contact. Your email is never displayed publicly.</p>
              </form>}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer"><a href="#" className="brand footer-brand"><span className="brand-mark">N</span>NEXZZA</a><p>Good games. Better people.</p><span>© {new Date().getFullYear()} NEXZZA</span></footer>
      <Dialog open={activeNote !== null} onOpenChange={open => { if (!open) setActiveNote(null); }}><DialogContent className="article-dialog">{activeNote !== null && <><DialogHeader><p className="eyebrow">{notes[activeNote].tag}</p><DialogTitle className="article-title">{notes[activeNote].title}</DialogTitle><DialogDescription className="article-description">{notes[activeNote].summary}</DialogDescription></DialogHeader><div className="article-body">{notes[activeNote].body.map(p => <p key={p}>{p}</p>)}</div><Button className="primary-cta article-cta" onClick={() => { setActiveNote(null); window.setTimeout(() => document.getElementById("join")?.scrollIntoView({ behavior: "auto" }), 150); }}>Join the community <ArrowUpRight size={18} /></Button></>}</DialogContent></Dialog>
    </>
  );
}
