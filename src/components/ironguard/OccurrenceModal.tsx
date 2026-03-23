import { useState, useRef } from "react";
import { D, ALERTS, ALL_FILTERS, type Alert } from "./constants";
import { CloseIc } from "./icons";

interface OccurrenceModalProps {
  alert: Alert;
  onClose: () => void;
}

export default function OccurrenceModal({ alert, onClose }: OccurrenceModalProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const filterInfo = ALL_FILTERS.find((f) => f.id === alert.type);
  const sameTypeAlerts = ALERTS.filter((a) => a.type === alert.type);

  return (
    /* Overlay — semi-transparent so map shows behind */
    <div
      className="ig-fade"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.78) 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Scrollable sheet container */}
      <div
        ref={sheetRef}
        className="ig-sheet"
        style={{
          background: "rgba(11,16,24,0.92)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px 24px 0 0",
          border: `1px solid ${D.border}`,
          borderBottom: "none",
          maxHeight: "72%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: D.border2, margin: "0 auto 14px" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700, color: D.text }}>
              {filterInfo?.ic || alert.ic} {filterInfo?.lb || alert.type}
            </div>
            <div style={{ fontSize: 12, color: D.sub, marginTop: 3 }}>
              Ocorrências próximas ({alert.bairro}) • {sameTypeAlerts.length} registros
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, background: D.s3, border: `1px solid ${D.border}`, color: D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CloseIc />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
          {/* Horizontal scroll cards */}
          <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 20px 14px", scrollSnapType: "x mandatory" }}>
            {sameTypeAlerts.map((a) => {
              const isExpanded = expandedId === a.id;
              return (
                <div
                  key={a.id}
                  style={{
                    width: "min(300px, 85vw)",
                    flexShrink: 0,
                    background: D.s2,
                    borderRadius: 20,
                    padding: 0,
                    overflow: "hidden",
                    border: `1px solid ${D.border}`,
                    scrollSnapAlign: "start",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Top bar: time + distance */}
                  <div style={{
                    textAlign: "center",
                    padding: "10px 16px",
                    borderBottom: `1px solid ${D.border}`,
                    background: "rgba(255,255,255,0.02)",
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: D.text }}>
                      {a.ago} &nbsp; {a.dist}
                    </span>
                  </div>

                  {/* Main content */}
                  <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Plate + Vehicle icon row */}
                    {a.plate ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: D.text, letterSpacing: 1.5 }}>
                            {a.plate}
                          </div>
                          {a.model && (
                            <div style={{ fontSize: 13, color: D.sub, marginTop: 2 }}>
                              {a.model} · {a.vehicleColor}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 38, opacity: 0.9 }}>{a.ic}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 600, color: D.text }}>{a.t}</div>
                    )}

                    {/* Location */}
                    <div style={{ fontSize: 12, color: "#ff8a80" }}>
                      📍 Registrado: {a.bairro} · {a.ago}
                    </div>

                    {a.lastSeen && (
                      <div style={{ fontSize: 12, color: "#80cbc4" }}>
                        👁 Último avistamento: {a.lastSeen}
                      </div>
                    )}

                    {/* Details toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      style={{ background: "none", border: "none", color: D.blue, fontSize: 12, cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" }}
                    >
                      {isExpanded ? "Ocultar detalhes ▲" : "Detalhes ▼"}
                    </button>
                    {isExpanded && (
                      <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5, padding: "4px 0" }}>
                        {a.t}. Confirmado por {a.v} usuários na região de {a.bairro}.
                        {a.isNew && " ⚡ Registrado recentemente."}
                      </div>
                    )}

                    {/* Separator */}
                    <div style={{ height: 1, background: D.border, margin: "4px 0" }} />

                    {/* Footer: Reporter + Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {a.reporterAvatar ? (
                          <img src={a.reporterAvatar} alt="" style={{ width: 36, height: 36, borderRadius: 18, objectFit: "cover", border: `2px solid ${D.border2}` }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 18, background: D.s3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>
                            {a.reporter || "Anônimo"}
                            <span style={{ color: D.sub, fontWeight: 400 }}> ›</span>
                          </div>
                          <div style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                            <span style={{ color: D.text }}>★</span>
                            <span style={{ color: D.sub }}>{(3.5 + Math.random() * 1.5).toFixed(1)}</span>
                            {a.medals && <span style={{ marginLeft: 2 }}>{a.medals}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {/* Chat button */}
                        <button style={{
                          width: 38, height: 38, borderRadius: 19,
                          background: "rgba(255,255,255,0.06)", border: `1px solid ${D.border2}`,
                          color: D.sub, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          position: "relative",
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, background: D.red }} />
                        </button>
                        {/* Call button */}
                        <button style={{
                          width: 38, height: 38, borderRadius: 19,
                          background: "rgba(255,255,255,0.06)", border: `1px solid ${D.border2}`,
                          color: D.sub, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm button */}
          <div style={{ padding: "0 20px" }}>
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "13px",
                background: `linear-gradient(135deg,${D.red},#FF5000)`,
                border: "none", borderRadius: 14, color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(255,50,50,0.3)",
              }}
            >
              ✓ Confirmar alerta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
