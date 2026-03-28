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

const PRIMARY_CYAN = "#00D1FF";
const ACCENT_BLUE = "#007AFF";
const BG_DARK = "#020407";

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
        setTimeout(() => setOrbPulse(false), 5000);
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
          position: "absolute",
          inset: 0,
          zIndex: 30,
          background: voiceMode ? "transparent" : "rgba(0,0,0,0.35)",
          transition: "background 0.4s ease",
        }}
      />

      {voiceMode ? (
        /* ══════════ VOICE MODE ══════════ */
        <>
          {/* Gradient fade into map */}
          <div
            style={{
              position: "absolute",
              bottom: "40vh",
              left: 0,
              right: 0,
              height: 128,
              zIndex: 31,
              background: `linear-gradient(to top, ${BG_DARK} 0%, transparent 100%)`,
              pointerEvents: "none",
            }}
          />

          {/* AI Orb — floating above modal */}
          <div
            style={{
              position: "absolute",
              bottom: "calc(40vh - 40px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 33,
              width: 112,
              height: 112,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${PRIMARY_CYAN} 0%, ${ACCENT_BLUE} 100%)`,
              boxShadow: orbPulse
                ? `0 0 60px ${PRIMARY_CYAN}99, 0 0 120px ${ACCENT_BLUE}55`
                : `0 0 40px ${PRIMARY_CYAN}66, 0 0 80px ${ACCENT_BLUE}33`,
              animation: "ig-orb-float 4s ease-in-out infinite",
              transition: "box-shadow 0.6s ease",
            }}
          />

          {/* Modal body */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40vh",
              zIndex: 32,
              background: BG_DARK,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {/* Close button */}
            <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", padding: "16px 20px 0" }}>
              <button
                onClick={onClose}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(148,163,184,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content area with 3px gaps */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 3,
                paddingTop: 32,
                overflow: "hidden",
              }}
            >
              {/* Audio waveform bars */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, height: 32 }}>
                {[0.1, 0.3, 0.2, 0.4, 0.15, 0.35, 0.25].map((delay, i) => (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      borderRadius: 2,
                      background: i % 2 === 0 ? PRIMARY_CYAN : ACCENT_BLUE,
                      opacity: 0.8,
                      height: orbPulse ? undefined : 8,
                      animation: orbPulse
                        ? `ig-waveform 1.2s ease-in-out infinite`
                        : "none",
                      animationDelay: `${delay}s`,
                      transition: "height 0.3s ease",
                      minHeight: 8,
                    }}
                  />
                ))}
              </div>

              {/* Live caption */}
              <div style={{ textAlign: "center", maxWidth: 320, padding: "0 16px" }}>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: "rgba(241,245,249,0.9)",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  {orbPulse
                    ? '"Checking your route... A robbery was reported 200m ahead. Avoid Rua Augusta."'
                    : "Tap to speak or type..."}
                </p>
              </div>
            </div>

            {/* Input bar — unified pill */}
            <div style={{ width: "100%", padding: "0 24px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "6px 6px 6px 16px",
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Tap to speak or type..."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "inherit",
                    padding: "8px 0",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 4 }}>
                  <button
                    onClick={toggleVoice}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: orbPulse ? "#FF3B30" : PRIMARY_CYAN,
                      transition: "color 0.3s ease",
                    }}
                  >
                    <Mic size={24} />
                  </button>
                  <button
                    onClick={() => sendMessage(input)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: PRIMARY_CYAN,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 12px ${PRIMARY_CYAN}33`,
                    }}
                  >
                    <Send size={20} color={BG_DARK} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ══════════ TEXT MODE ══════════ */
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 31,
            maxHeight: "55%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "24px 24px 0 0",
            background: "rgba(11,16,24,0.97)",
            border: `1px solid ${D.border2}`,
            borderBottom: "none",
            backdropFilter: "blur(24px)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px 12px",
              borderBottom: `1px solid ${D.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: D.green,
                  boxShadow: `0 0 10px ${D.green}80`,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: D.green, letterSpacing: 1.2 }}>
                IA OPERACIONAL ATIVA
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${D.border}`,
                cursor: "pointer",
                color: D.sub,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minHeight: 100,
              maxHeight: 200,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                {msg.role === "ai" && (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: D.s3,
                      border: `1px solid ${D.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 18,
                    }}
                  >
                    🤖
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "11px 15px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? `${D.blue}18` : D.s2,
                    border: `1px solid ${msg.role === "user" ? `${D.blue}25` : D.border}`,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: D.text,
                  }}
                >
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
                  padding: "7px 14px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${D.border}`,
                  color: D.sub,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input bar — unified pill (same as voice mode) */}
          <div style={{ padding: "12px 18px 18px", borderTop: `1px solid ${D.border}` }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "4px 4px 4px 16px",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Talk to Iron Guard AI..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: D.text,
                  fontSize: 13,
                  fontFamily: "inherit",
                  padding: "8px 0",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 2 }}>
                <button
                  onClick={toggleVoice}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: PRIMARY_CYAN,
                  }}
                >
                  <Mic size={20} />
                </button>
                <button
                  onClick={() => sendMessage(input)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: PRIMARY_CYAN,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 10px ${PRIMARY_CYAN}33`,
                  }}
                >
                  <Send size={16} color={BG_DARK} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes ig-orb-float {
          0%, 100% { transform: translateX(-50%) scale(1); filter: brightness(1); }
          50% { transform: translateX(-50%) scale(1.1); filter: brightness(1.2); }
        }
        @keyframes ig-waveform {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
      `}</style>
    </>
  );
}
