import { useState, useEffect } from "react";
import { D, SOS_TYPES, EMERGENCY_CALLS, type SOSType } from "./constants";
import { CloseIc, PhoneIc } from "./icons";

interface SOSModalProps {
  onClose: () => void;
}

export default function SOSModal({ onClose }: SOSModalProps) {
  const [step, setStep] = useState<"type" | "confirm" | "sending" | "sent">("type");
  const [selType, setSelType] = useState<SOSType | null>(null);
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (step !== "sending") return;
    if (count <= 0) { setStep("sent"); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, count]);

  const doCall = (number: string) => { window.open(`tel:${number}`); };

  return (
    <div className="ig-fade" style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column" }}>
      {/* STEP 1 — escolher tipo */}
      {step === "type" && (
        <div className="ig-sheet" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Header */}
            <div style={{ padding: "56px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: D.text }}>Central de Emergência</div>
                <div style={{ fontSize: 12, color: D.sub, marginTop: 3 }}>Selecione o tipo de situação</div>
              </div>
              <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, background: D.s2, border: `1px solid ${D.border}`, color: D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloseIc />
              </button>
            </div>

            {/* Tipos de emergência */}
            <div style={{ padding: "0 20px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: D.sub, letterSpacing: 1.5, marginBottom: 8 }}>TIPO DE EMERGÊNCIA</div>
              <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${D.border}` }}>
                {SOS_TYPES.map((t, i) => {
                  const on = selType?.id === t.id;
                  const isLast = i === SOS_TYPES.length - 1;
                  return (
                    <div key={t.id} onClick={() => setSelType(t)} style={{
                      display: "flex", alignItems: "center", gap: 13,
                      padding: "12px 14px",
                      background: on ? `${t.c}10` : D.s2,
                      borderBottom: isLast ? "none" : `1px solid ${D.border}`,
                      cursor: "pointer", transition: "background .15s",
                      position: "relative",
                    }}>
                      {t.urgent && <div style={{ position: "absolute", top: 6, right: 10, fontSize: 8, fontWeight: 700, color: D.red, background: `${D.red}18`, padding: "2px 6px", borderRadius: 6, letterSpacing: 0.5 }}>URGENTE</div>}
                      <div style={{ fontSize: 22 }}>{t.ic}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{t.lb}</div>
                        <div style={{ fontSize: 11, color: D.sub, marginTop: 1 }}>{t.sub}</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${on ? t.c : D.border2}`, background: on ? t.c : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                        {on && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discagem rápida */}
            <div style={{ padding: "20px 20px 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: D.sub, letterSpacing: 1.5, marginBottom: 8 }}>DISCAGEM RÁPIDA</div>
              <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${D.border}` }}>
                {EMERGENCY_CALLS.map((e, i) => {
                  const isLast = i === EMERGENCY_CALLS.length - 1;
                  return (
                    <div key={e.number} onClick={() => doCall(e.number)} style={{
                      display: "flex", alignItems: "center", gap: 13,
                      padding: "12px 14px", background: D.s2,
                      borderBottom: isLast ? "none" : `1px solid ${D.border}`,
                      cursor: "pointer", transition: "background .15s",
                    }}>
                      <div style={{ fontSize: 22 }}>{e.ic}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{e.lb}</span>
                          <span style={{ fontSize: 12, color: e.c, fontWeight: 700 }}>{e.number}</span>
                        </div>
                        <div style={{ fontSize: 11, color: D.sub, marginTop: 1 }}>{e.sub}</div>
                      </div>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${e.c}14`, border: `1px solid ${e.c}30`, display: "flex", alignItems: "center", justifyContent: "center", color: e.c }}>
                        <PhoneIc />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Confirmar SOS */}
          <div style={{ padding: "12px 20px 32px" }}>
            <button
              onClick={() => { if (selType) { setCount(3); setStep("confirm"); } }}
              style={{
                width: "100%", padding: "15px",
                background: selType ? `linear-gradient(135deg,${selType.c},${selType.c}CC)` : "rgba(255,255,255,0.06)",
                border: `1px solid ${selType ? selType.c + "40" : D.border}`,
                borderRadius: 16, color: selType ? "#fff" : D.sub,
                fontSize: 14, fontWeight: 700, cursor: selType ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "all .2s",
                boxShadow: selType ? `0 6px 20px ${selType.c}40` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {selType ? `${selType.ic} Enviar SOS — ${selType.lb}` : "Selecione um tipo para continuar"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — confirmação */}
      {step === "confirm" && selType && (
        <div className="ig-scale" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center", gap: 20 }}>
          <div style={{ fontSize: 52 }}>{selType.ic}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: D.s2, borderRadius: 14, padding: "12px 18px", border: `1px solid ${D.border}` }}>
            <div style={{ fontSize: 28 }}>{selType.ic}</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, color: D.sub }}>Tipo de emergência</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: selType.c }}>{selType.lb}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: D.sub, lineHeight: 1.5 }}>
            Todos os usuários Iron Guard num raio de{" "}
            <span style={{ color: D.text, fontWeight: 600 }}>5km</span> serão alertados imediatamente com sua localização.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button onClick={() => setStep("sending")} style={{ width: "100%", padding: "15px", background: `rgba(${selType.c === "#FF3232" ? "255,50,50" : "180,100,0"},0.88)`, border: `1px solid ${selType.c}40`, borderRadius: 16, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 6px 20px ${selType.c}40` }}>
              Confirmar — Enviar SOS agora
            </button>
            <button onClick={() => setStep("type")} style={{ width: "100%", padding: "13px", background: "transparent", border: `1px solid ${D.border}`, borderRadius: 16, color: D.sub, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Voltar e alterar tipo
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — enviando countdown */}
      {step === "sending" && (
        <div className="ig-scale" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ fontSize: 14, color: D.sub }}>Enviando em</div>
          <div style={{ fontSize: 72, fontWeight: 800, color: D.red }}>{count}</div>
          <div style={{ fontSize: 16, color: D.text }}>{selType?.ic} {selType?.lb}</div>
          <div style={{ fontSize: 12, color: D.sub }}>Alertando usuários em 5km</div>
          <button onClick={onClose} style={{ marginTop: 20, padding: "10px 30px", background: "transparent", border: `1px solid ${D.border}`, borderRadius: 12, color: D.sub, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        </div>
      )}

      {/* STEP 4 — enviado */}
      {step === "sent" && (
        <div className="ig-scale" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: `${D.green}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={D.green} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: D.text }}>SOS enviado</div>
          <div style={{ fontSize: 13, color: D.sub }}>23 usuários foram notificados.</div>
          <div style={{ fontSize: 12, color: D.muted }}>Fique no local e aguarde.</div>
          <button onClick={onClose} style={{ marginTop: 16, padding: "12px 32px", background: D.s2, border: `1px solid ${D.border}`, borderRadius: 14, color: D.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Estou seguro</button>
        </div>
      )}
    </div>
  );
}
