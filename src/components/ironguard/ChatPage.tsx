import { useState, useEffect, useRef } from "react";
import { D, NAV_H } from "./constants";

/* ── Chat-specific tokens ── */
const CD = {
  card: "#111113",
  card2: "#181819",
  input: "#181819",
};

/* ── Actions ── */
const ACTIONS = [
  {
    id: "area", title: "Alertas na minha área", sub: "Ocorrências ativas em tempo real.",
    prompt: "Quais alertas estão ativos na minha área agora?",
    reply: "Encontrei **3 alertas ativos** num raio de 5km:\n\n🏍 **Roubo de moto** — Consolação · há 2min\n⚠️ **Assalto** — Bela Vista · há 8min\n🌊 **Alagamento** — Bom Retiro · há 15min\n\nA área de maior risco agora é **Consolação**, com pico entre **20h–23h**.",
    voice: "Encontrei três alertas ativos num raio de cinco quilômetros. Roubo de moto na Consolação há dois minutos. Assalto na Bela Vista há oito minutos. Alagamento no Bom Retiro há quinze minutos. A área de maior risco agora é a Consolação.",
  },
  {
    id: "rota", title: "Rota mais segura", sub: "Caminho com menor risco agora.",
    prompt: "Qual é a rota mais segura até o Centro agora?",
    reply: "✅ **Rota recomendada:**\nAv. Rebouças → R. da Consolação → Av. Ipiranga\n⏱ **12 min** · Risco: **Baixo**\n\n⚠️ **Evitar:** Av. Paulista (2 alertas) e Rua Augusta (perseguição há 6min).",
    voice: "Rota recomendada: Avenida Rebouças, Rua da Consolação e Avenida Ipiranga. Doze minutos, risco baixo. Evite a Avenida Paulista, que tem dois alertas ativos, e a Rua Augusta, com perseguição reportada há seis minutos.",
  },
  {
    id: "sos", title: "Como usar o SOS", sub: "Acionar ajuda de forma rápida.",
    prompt: "Como aciono o SOS no Iron Guard?",
    reply: "Para acionar o **SOS**:\n\n1️⃣ Vá para a aba **Início**\n2️⃣ Toque em **SOS — Pedir Ajuda**\n3️⃣ Selecione o tipo\n4️⃣ Confirme — usuários em **5km** alertados em segundos\n\n🔴 Discagem: **190** Polícia · **192** SAMU · **193** Bombeiros",
    voice: "Para acionar o S-O-S, vá para a aba Início e toque em Pedir Ajuda. Selecione o tipo de emergência e confirme. Usuários num raio de cinco quilômetros serão alertados imediatamente. Discagem rápida: cento e noventa para a Polícia, cento e noventa e dois para o SAMU.",
  },
];

const SUGESTOES = ["Motos roubadas perto", "Horários de risco", "Reportar alerta", "Mapa de calor"];
const AI_TEXT = [
  "Entendido! Posso ajudar melhor se você informar **seu bairro** ou **destino**.",
  "📊 Horários de maior risco: **18h–23h**, pico às **21h**\n📍 Mais reportados: Consolação, Bela Vista e Bom Retiro",
  "Não encontrei ocorrências específicas agora. Posso monitorar **em tempo real** para você.",
];
const AI_VOICE = [
  "Entendido. Informe seu bairro ou destino para que eu possa ajudar com mais precisão.",
  "Nos últimos dados de São Paulo, o pico de risco é entre dezoito e vinte e três horas.",
  "Não encontrei ocorrências específicas agora. Posso monitorar em tempo real para você.",
];

const CAP_LISTEN = ["Ouvindo...", "Pode falar...", "Estou te ouvindo..."];
const CAP_THINK = ["Analisando...", "Processando dados...", "Verificando alertas...", "Consultando área..."];
const CAP_SPEAK = ["Respondendo...", "Iron Guard IA falando..."];

/* ── SVG Icons ── */
const IcBack = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>;
const IcX = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>;
const IcSend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" /></svg>;
const IcPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
const IcMic = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8" /></svg>;
const IcChev = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>;
const IcStop = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" /></svg>;
const IcShield = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6L12 2z" /></svg>;
const IcRoute = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M6 16V9a3 3 0 0 1 3-3h6M16 8l2-2-2-2" /></svg>;
const IcHelp = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><circle cx="12" cy="17" r=".5" fill="currentColor" /></svg>;
const ICONS: Record<string, React.FC> = { area: IcShield, rota: IcRoute, sos: IcHelp };

function Dots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "2px 0", alignItems: "center" }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(240,242,248,0.3)", animation: `igDp .85s ease infinite`, animationDelay: `${i * .17}s` }} />)}
    </div>
  );
}

function Md({ text }: { text: string }) {
  return <span>{text.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") && p.endsWith("**") ? <strong key={i} style={{ color: D.text, fontWeight: 700 }}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)}</span>;
}

/* ══ VOICE SCREEN ══ */
function VoiceScreen({ onClose, voiceText }: { onClose: () => void; voiceText: string }) {
  const [vp, setVp] = useState<"listening" | "thinking" | "speaking">("listening");
  const [cap, setCap] = useState(CAP_LISTEN[0]);
  const [bars, setBars] = useState(Array(32).fill(0.1));
  const [spoken, setSpoken] = useState("");
  const capI = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setBars(prev => prev.map((_, i) => {
        const c = Math.abs(i - 15.5) / 16;
        const amp = vp === "listening" ? 0.62 : vp === "thinking" ? 0.14 : 0.9;
        return 0.07 + Math.random() * amp * (1 - c * 0.5);
      }));
    }, 72);
    return () => clearInterval(t);
  }, [vp]);

  useEffect(() => {
    const pool = vp === "listening" ? CAP_LISTEN : vp === "thinking" ? CAP_THINK : CAP_SPEAK;
    setCap(pool[0]); capI.current = 0;
    const t = setInterval(() => { capI.current = (capI.current + 1) % pool.length; setCap(pool[capI.current]); }, 1900);
    return () => clearInterval(t);
  }, [vp]);

  useEffect(() => {
    const run = async () => {
      await new Promise(r => setTimeout(r, 2600));
      setVp("thinking");
      await new Promise(r => setTimeout(r, 1700));
      setVp("speaking");
      setSpoken(voiceText);
      await new Promise(r => setTimeout(r, Math.max(3200, voiceText.length * 52)));
      setVp("listening");
      setSpoken("");
    };
    run();
  }, [voiceText]);

  const C = {
    listening: { a: "#3B9EFF", b: "#7B61FF" },
    thinking: { a: "#7B61FF", b: "#3B9EFF" },
    speaking: { a: "#22D46A", b: "#00D4C8" },
  };
  const { a: c1, b: c2 } = C[vp];

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "#07070A", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }} className="ig-voice-in">
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: `radial-gradient(ellipse 52% 38% at 50% 40%,${c1}0D 0%,transparent 65%)`, transition: "background 1.3s ease", pointerEvents: "none" }} />

      <div style={{ width: "100%", padding: "18px 22px 0", display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 10 }}>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(240,242,248,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IcX /></button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 5, width: "100%" }}>
        <div style={{ color: "rgba(240,242,248,0.28)", fontSize: 10, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 50, transition: "color .7s" }}>
          {vp === "listening" ? "ouvindo" : vp === "thinking" ? "processando" : "respondendo"}
        </div>

        {/* ORB */}
        <div style={{ position: "relative", width: 210, height: 210, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 210, height: 210, borderRadius: "50%", border: `1px solid ${c1}12`, animation: "igR3 3.6s ease infinite", transition: "border-color 1.3s" }} />
          <div style={{ position: "absolute", width: 162, height: 162, borderRadius: "50%", border: `1px solid ${c1}22`, animation: "igR2 2.6s ease infinite", transition: "border-color 1.3s" }} />
          <div style={{ position: "absolute", width: 118, height: 118, borderRadius: "50%", border: `1.5px solid ${c1}38`, animation: "igR1 1.9s ease infinite", transition: "border-color 1.3s" }} />
          <div style={{ position: "absolute", width: 92, height: 92, borderRadius: "50%", background: `radial-gradient(circle,${c1}1C 0%,transparent 66%)`, filter: "blur(10px)", animation: "igOG 2.3s ease infinite", transition: "background 1.3s" }} />
          <div style={{
            width: 84, height: 84, borderRadius: "50%",
            background: `conic-gradient(from 0deg,${c1},${c2},${c1}88,${c2},${c1})`,
            boxShadow: `0 0 36px ${c1}44,0 0 68px ${c1}16,inset 0 0 16px rgba(255,255,255,0.06)`,
            animation: `igOS 5s linear infinite,igOP ${vp === "speaking" ? "1s" : "1.9s"} ease infinite`,
            transition: "box-shadow 1.3s", position: "relative", zIndex: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ position: "absolute", width: 56, height: 56, borderRadius: "50%", background: "radial-gradient(circle at 34% 34%,rgba(255,255,255,0.18),transparent 56%)" }} />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
              <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8" />
            </svg>
          </div>
        </div>

        {/* WAVEFORM */}
        <div style={{ marginTop: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5, height: 40 }}>
          {bars.map((h, i) => {
            const dist = Math.abs(i - 15.5) / 16;
            const op = vp === "thinking" ? 0.1 + (1 - dist) * 0.12 : 0.2 + (1 - dist) * 0.52;
            return <div key={i} style={{ width: 2.5, height: Math.max(2.5, h * 36), borderRadius: 2, background: c1, opacity: op, transition: "height .072s ease,background 1.3s,opacity .5s", flexShrink: 0 }} />;
          })}
        </div>

        <div style={{ marginTop: 26, textAlign: "center", padding: "0 44px", minHeight: 64 }}>
          <div key={cap} style={{ color: "rgba(240,242,248,0.32)", fontSize: 11, fontWeight: 400, letterSpacing: "0.01em", marginBottom: spoken ? 9 : 0 }} className="ig-cf">{cap}</div>
          {spoken && <div key={spoken.slice(0, 20)} style={{ color: "rgba(240,242,248,0.72)", fontSize: 14, fontWeight: 400, lineHeight: 1.62, letterSpacing: "-0.01em" }} className="ig-cf">{spoken}</div>}
        </div>
      </div>

      <div style={{ padding: "0 22px 46px", width: "100%", position: "relative", zIndex: 10 }}>
        <button onClick={onClose} style={{ width: "100%", padding: "14px", borderRadius: 17, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(240,242,248,0.38)", fontSize: 13, fontWeight: 400, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <IcStop />Parar conversa por voz
        </button>
      </div>
    </div>
  );
}

/* ══ INPUT BAR (shared) ══ */
function InputBar({ input, setInput, inputRef, onSend, onVoice }: {
  input: string;
  setInput: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSend: () => void;
  onVoice: () => void;
}) {
  return (
    <div style={{ padding: "10px 16px 12px", background: `${D.bg}F8`, borderTop: `1px solid ${D.border}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: CD.input, border: `1px solid ${D.border2}`, borderRadius: 99, padding: "10px 10px 10px 16px" }}>
        <div style={{ color: D.muted, display: "flex", cursor: "pointer" }}><IcPlus /></div>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && input.trim()) onSend(); }}
          placeholder="Pergunte qualquer coisa..."
          style={{ flex: 1, background: "none", border: "none", color: D.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        {input.trim() ? (
          <button onClick={onSend} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#3B9EFF,#5BC8FF)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(59,158,255,.38)", transition: "all .15s" }}>
            <IcSend />
          </button>
        ) : (
          <button onClick={onVoice} className="ig-glow-btn" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59,158,255,0.09)", border: "1px solid rgba(59,158,255,0.2)", color: D.blue, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" }}>
            <IcMic />
          </button>
        )}
      </div>
    </div>
  );
}

/* ══ MAIN CHAT PAGE ══ */
interface Msg { id: number; role: "user" | "ai"; text: string; }

export default function ChatPage() {
  const [phase, setPhase] = useState<"home" | "chat" | "voice">("home");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [vText, setVText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const addMsg = (role: "user" | "ai", text: string) => new Promise<void>(res => { setMsgs(p => [...p, { id: Date.now() + Math.random(), role, text }]); setTimeout(res, 40); });

  const startCard = async (a: typeof ACTIONS[0]) => {
    setPhase("chat");
    await new Promise(r => setTimeout(r, 260));
    await addMsg("user", a.prompt);
    setTyping(true);
    await new Promise(r => setTimeout(r, 1300));
    setTyping(false);
    await addMsg("ai", a.reply);
  };

  const send = async (t?: string) => {
    const text = t || input;
    if (!text.trim()) return;
    setInput("");
    if (phase === "home") setPhase("chat");
    await addMsg("user", text.trim());
    setTyping(true);
    await new Promise(r => setTimeout(r, 850 + Math.random() * 700));
    setTyping(false);
    const i = Math.floor(Math.random() * AI_TEXT.length);
    await addMsg("ai", AI_TEXT[i]);
  };

  const openVoice = (a: typeof ACTIONS[0] | null) => {
    setVText(a ? a.voice : AI_VOICE[Math.floor(Math.random() * AI_VOICE.length)]);
    setPhase("voice");
  };

  const closeVoice = () => {
    setPhase(msgs.length > 0 ? "chat" : "home");
  };

  const aiN = msgs.filter(m => m.role === "ai").length;

  return (
    <div style={{ position: "absolute", inset: 0, bottom: NAV_H, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* ══ HOME ══ */}
      {phase === "home" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} className="ig-fade">
          {/* Scrollable centered content */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 22px 12px" }}>
            <div style={{ maxWidth: 480, width: "100%", margin: "0 auto" }}>
              {/* Title */}
              <div style={{ marginBottom: 22, textAlign: "center" }}>
                <div style={{ lineHeight: 1.14, marginBottom: 2 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.045em", background: "linear-gradient(94deg,#C8DFFF 0%,#A8CAFF 42%,#C4B5FD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Como podemos
                  </span>
                </div>
                <div style={{ lineHeight: 1.14 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.045em", background: "linear-gradient(94deg,#3B9EFF 0%,#22D4C8 52%,#22D46A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    te ajudar hoje?
                  </span>
                </div>
                <div style={{ color: D.sub, fontSize: 13, marginTop: 10, lineHeight: 1.58 }}>
                  IA de segurança do Iron Guard. Pergunte sobre alertas, rotas ou emergências.
                </div>
              </div>

              <div style={{ color: D.muted, fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", marginBottom: 10, textAlign: "center" }}>Toque para começar</div>

              {/* 3 CARDS */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ACTIONS.map((a, i) => {
                  const Icon = ICONS[a.id];
                  return (
                    <button key={a.id} onClick={() => startCard(a)} className="ig-chat-slide" style={{
                      width: "100%", background: CD.card, border: `1px solid ${D.border2}`,
                      borderRadius: 18, padding: "14px 16px",
                      display: "flex", alignItems: "center", gap: 14,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      animationDelay: `${i * .07}s`,
                    }}>
                      <div style={{ width: 42, height: 42, borderRadius: 13, background: CD.card2, border: `1px solid ${D.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(240,242,248,0.45)", flexShrink: 0 }}>
                        {Icon && <Icon />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: D.text, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
                        <div style={{ color: D.sub, fontSize: 12, lineHeight: 1.38 }}>{a.sub}</div>
                      </div>
                      <div style={{ color: D.muted, flexShrink: 0 }}><IcChev /></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Input above navbar */}
          <InputBar
            input={input} setInput={setInput} inputRef={inputRef}
            onSend={() => send()}
            onVoice={() => openVoice(null)}
          />
        </div>
      )}

      {/* ══ CHAT ══ */}
      {phase === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }} className="ig-fade">
          {/* Header */}
          <div style={{ padding: "52px 20px 11px", display: "flex", alignItems: "center", gap: 14, borderBottom: `1px solid ${D.border}`, background: `${D.bg}F8`, flexShrink: 0, zIndex: 10 }}>
            <button onClick={() => { setPhase("home"); setMsgs([]); }} style={{ width: 34, height: 34, borderRadius: "50%", background: CD.card2, border: `1px solid ${D.border2}`, color: D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IcBack />
            </button>
            <span style={{ color: D.text, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", flex: 1 }}>Iron Guard IA</span>
          </div>

          {/* Msgs */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
            {msgs.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }} className="ig-chat-slide">
                <div style={{
                  maxWidth: "78%", padding: "10px 14px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.role === "user" ? "linear-gradient(135deg,#3B9EFF,#5BC8FF)" : CD.card,
                  border: m.role === "ai" ? `1px solid ${D.border2}` : "none",
                  color: m.role === "user" ? "#fff" : D.sub,
                  fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-line", wordBreak: "break-word",
                  boxShadow: m.role === "user" ? "0 4px 14px rgba(59,158,255,0.2)" : "none",
                }}>
                  <Md text={m.text} />
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex" }} className="ig-chat-slide">
                <div style={{ padding: "11px 14px", borderRadius: "18px 18px 18px 4px", background: CD.card, border: `1px solid ${D.border2}` }}><Dots /></div>
              </div>
            )}

            {aiN >= 1 && !typing && (
              <div className="ig-fade">
                <div style={{ color: D.muted, fontSize: 11, marginBottom: 7 }}>Sugestões</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {SUGESTOES.map(s => (
                    <button key={s} onClick={() => send(s)} style={{ padding: "5px 11px", borderRadius: 20, background: CD.card, border: `1px solid ${D.border2}`, color: D.sub, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input above navbar */}
          <InputBar
            input={input} setInput={setInput} inputRef={inputRef}
            onSend={() => send()}
            onVoice={() => openVoice(null)}
          />
        </div>
      )}

      {/* ══ VOICE ══ */}
      {phase === "voice" && <VoiceScreen onClose={closeVoice} voiceText={vText} />}
    </div>
  );
}
