import { useState, useRef, useEffect, useCallback } from "react";
import { D } from "@/components/ironguard/constants";
import { MessageSquare, Mic, Send, X } from "lucide-react";

interface MapChatModalProps {
  open: boolean;
  onClose: () => void;
}

interface ChatMsg {
  role: "ai" | "user";
  text: string;
}

const QUICK_CHIPS = ["Como tá aqui?", "Tem roubo perto?", "Analisar rota"];

const MOCK_REPLIES: Record<string, string> = {
  "Como tá aqui?": "Área relativamente segura. Últimas 2h sem ocorrências graves num raio de 500m.",
  "Tem roubo perto?": "Há 2 registros de roubo nos últimos 30min: Consolação (220m) e Cambuci (2.1km).",
  "Analisar rota": "Sua rota atual passa por 1 zona de risco (Bela Vista). Recomendo desviar pela Av. Paulista.",
};

export default function MapChatModal({ open, onClose }: MapChatModalProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "ai", text: "Iron Guard IA ativa. Como posso ajudar na sua rota?" },
  ]);
  const [input, setInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [orbPulse, setOrbPulse] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    setTimeout(() => {
      const reply = MOCK_REPLIES[text] || "Analisando dados da região... Área monitorada, sem alertas críticos no momento.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    }, 800);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceMode((v) => {
      if (!v) {
        setOrbPulse(true);
        setTimeout(() => setOrbPulse(false), 3000);
      }
      return !v;
    });
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 30,
          background: voiceMode
            ? "linear-gradient(180deg, transparent 0%, rgba(6,8,14,0.4) 40%, rgba(6,8,14,0.92) 100%)"
            : "rgba(0,0,0,0.3)",
          transition: "background 0.4s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 31,
        height: voiceMode ? "40%" : "auto",
        maxHeight: voiceMode ? "40%" : "55%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px 20px 0 0",
        background: voiceMode
          ? "linear-gradient(180deg, rgba(6,8,14,0.6) 0%, rgba(6,8,14,0.97) 100%)"
          : "rgba(6,8,14,0.97)",
        border: `1px solid ${D.border2}`,
        borderBottom: "none",
        backdropFilter: "blur(24px)",
        transition: "all 0.3s ease",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px 10px",
          borderBottom: voiceMode ? "none" : `1px solid ${D.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: 4,
              background: D.green,
              boxShadow: `0 0 8px ${D.green}`,
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: D.sub, letterSpacing: 1 }}>
              IA OPERACIONAL ATIVA
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: D.sub, padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {voiceMode ? (
          /* ── Voice Overlay ── */
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 3,
            padding: "0 24px 24px",
          }}>
            {/* Orb */}
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: `radial-gradient(circle, ${D.teal}44 0%, ${D.teal}11 60%, transparent 100%)`,
              boxShadow: orbPulse
                ? `0 0 60px ${D.teal}55, 0 0 120px ${D.teal}22`
                : `0 0 30px ${D.teal}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "box-shadow 0.6s ease",
              animation: orbPulse ? "ig-orb-breathe 2s ease-in-out infinite" : "none",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `radial-gradient(circle, ${D.teal} 0%, ${D.teal}88 100%)`,
                boxShadow: `0 0 20px ${D.teal}88`,
              }} />
            </div>

            {/* Audio waveform bars */}
            <div style={{ display: "flex", alignItems: "center", gap: 3, height: 32 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 3, borderRadius: 2,
                    background: D.teal,
                    opacity: 0.5,
                    height: orbPulse ? `${8 + Math.sin(i * 0.8) * 16}px` : "4px",
                    transition: "height 0.3s ease",
                    animation: orbPulse ? `ig-wave ${0.4 + i * 0.05}s ease-in-out infinite alternate` : "none",
                  }}
                />
              ))}
            </div>

            {/* Transcription */}
            <p style={{
              fontSize: 13, color: D.sub, fontStyle: "italic",
              textAlign: "center", margin: 0,
            }}>
              {orbPulse ? "Ouvindo..." : "Toque para falar"}
            </p>

            {/* Mic button */}
            <button
              onClick={toggleVoice}
              style={{
                marginTop: 8,
                width: 52, height: 52, borderRadius: "50%",
                background: orbPulse ? D.red : D.teal,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 20px ${orbPulse ? D.red : D.teal}44`,
                transition: "all 0.3s ease",
              }}
            >
              <Mic size={22} color="#fff" />
            </button>
          </div>
        ) : (
          /* ── Text Chat ── */
          <>
            {/* Messages */}
            <div ref={scrollRef} style={{
              flex: 1, overflowY: "auto", padding: "12px 16px",
              display: "flex", flexDirection: "column", gap: 10,
              minHeight: 120, maxHeight: 220,
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user" ? `${D.blue}22` : D.s2,
                  border: `1px solid ${msg.role === "user" ? `${D.blue}33` : D.border}`,
                  fontSize: 13, lineHeight: 1.5,
                  color: D.text,
                }}>
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick chips */}
            <div style={{ display: "flex", gap: 6, padding: "0 16px 8px", overflowX: "auto" }}>
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  style={{
                    padding: "6px 12px", borderRadius: 20,
                    background: D.s3, border: `1px solid ${D.border}`,
                    color: D.sub, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px 16px",
              borderTop: `1px solid ${D.border}`,
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Fale com a IA Iron Guard..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 14,
                  background: D.s2, border: `1px solid ${D.border}`,
                  color: D.text, fontSize: 13, outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={toggleVoice}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: D.s3, border: `1px solid ${D.border}`,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: D.sub,
                }}
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => sendMessage(input)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: D.blue, border: "none",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Send size={16} color="#fff" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* CSS */}
      <style>{`
        @keyframes ig-orb-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes ig-wave {
          0% { height: 4px; }
          100% { height: 24px; }
        }
      `}</style>
    </>
  );
}
