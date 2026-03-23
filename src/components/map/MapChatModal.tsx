import { useState, useRef, useEffect, useCallback } from "react";
import { D } from "@/components/ironguard/constants";
import { Mic, Send, X } from "lucide-react";

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
    { role: "ai", text: "Checking your route. A robbery was reported 200m ahead. Avoid Rua Augusta." },
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
            ? "linear-gradient(180deg, transparent 0%, rgba(6,8,14,0.5) 30%, rgba(6,8,14,0.95) 100%)"
            : "rgba(0,0,0,0.35)",
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
        height: voiceMode ? "50%" : "auto",
        maxHeight: voiceMode ? "50%" : "55%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "24px 24px 0 0",
        background: voiceMode
          ? "linear-gradient(180deg, rgba(6,8,14,0.7) 0%, rgba(6,8,14,0.98) 100%)"
          : "rgba(11,16,24,0.97)",
        border: `1px solid ${D.border2}`,
        borderBottom: "none",
        backdropFilter: "blur(24px)",
        transition: "all 0.3s ease",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px 12px",
          borderBottom: voiceMode ? "none" : `1px solid ${D.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 4,
              background: D.green,
              boxShadow: `0 0 10px ${D.green}80`,
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: D.green, letterSpacing: 1.2 }}>
              IA OPERACIONAL ATIVA
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${D.border}`,
              cursor: "pointer",
              color: D.sub,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
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
              width: 120, height: 120, borderRadius: "50%",
              background: `radial-gradient(circle, ${D.teal}55 0%, ${D.teal}18 50%, transparent 100%)`,
              boxShadow: orbPulse
                ? `0 0 80px ${D.teal}55, 0 0 160px ${D.teal}22`
                : `0 0 40px ${D.teal}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "box-shadow 0.6s ease",
              animation: orbPulse ? "ig-orb-breathe 2s ease-in-out infinite" : "none",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `radial-gradient(circle, ${D.teal} 0%, ${D.teal}99 100%)`,
                boxShadow: `0 0 24px ${D.teal}88`,
              }} />
            </div>

            {/* Audio waveform bars */}
            <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 4, borderRadius: 2,
                    background: D.teal,
                    opacity: 0.5,
                    height: orbPulse ? `${6 + Math.sin(i * 0.8) * 14}px` : "4px",
                    transition: "height 0.3s ease",
                    animation: orbPulse ? `ig-wave ${0.4 + i * 0.05}s ease-in-out infinite alternate` : "none",
                  }}
                />
              ))}
            </div>

            {/* Transcription */}
            <p style={{
              fontSize: 14, color: "rgba(238,242,250,0.7)", fontStyle: "italic",
              textAlign: "center", margin: "8px 20px 0", lineHeight: 1.6,
              maxWidth: 280,
            }}>
              {orbPulse
                ? '"Checking your route... A robbery was reported 200m ahead. Avoid Rua Augusta."'
                : "Tap to speak or type..."}
            </p>

            {/* Bottom input bar in voice mode */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginTop: 16, width: "100%", maxWidth: 340,
            }}>
              <div style={{
                flex: 1, padding: "12px 16px", borderRadius: 24,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${D.border}`,
                color: D.sub, fontSize: 13,
              }}>
                Tap to speak or type...
              </div>
              <button
                onClick={toggleVoice}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: orbPulse ? D.red : "rgba(255,255,255,0.08)",
                  border: `1px solid ${D.border}`,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: orbPulse ? "#fff" : D.teal,
                  transition: "all 0.3s ease",
                }}
              >
                <Mic size={20} />
              </button>
              <button
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: D.green, border: "none",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Send size={18} color="#fff" />
              </button>
            </div>
          </div>
        ) : (
          /* ── Text Chat ── */
          <>
            {/* Messages */}
            <div ref={scrollRef} style={{
              flex: 1, overflowY: "auto", padding: "14px 18px",
              display: "flex", flexDirection: "column", gap: 12,
              minHeight: 100, maxHeight: 200,
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}>
                  {msg.role === "ai" && (
                    <div style={{
                      width: 36, height: 36, borderRadius: 12,
                      background: D.s3,
                      border: `1px solid ${D.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 18,
                    }}>
                      🤖
                    </div>
                  )}
                  <div style={{
                    maxWidth: "78%",
                    padding: "11px 15px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? `${D.blue}18` : D.s2,
                    border: `1px solid ${msg.role === "user" ? `${D.blue}25` : D.border}`,
                    fontSize: 13, lineHeight: 1.55,
                    color: D.text,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick chips */}
            <div style={{ display: "flex", gap: 8, padding: "0 18px 10px", overflowX: "auto" }}>
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  style={{
                    padding: "7px 14px", borderRadius: 20,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${D.border}`,
                    color: D.sub, fontSize: 12, fontWeight: 500,
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
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 18px 18px",
              borderTop: `1px solid ${D.border}`,
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Talk to Iron Guard AI..."
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 24,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${D.border}`,
                  color: D.text, fontSize: 13, outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={toggleVoice}
                style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${D.border}`,
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
                  width: 42, height: 42, borderRadius: "50%",
                  background: D.green, border: "none",
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
          50% { transform: scale(1.06); }
        }
        @keyframes ig-wave {
          0% { height: 4px; }
          100% { height: 20px; }
        }
      `}</style>
    </>
  );
}
