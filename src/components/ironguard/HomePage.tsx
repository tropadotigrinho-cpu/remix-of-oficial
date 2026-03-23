import { D, ALERTS, EMERGENCY_CALLS, NAV_H } from "./constants";
import MapSVG from "./MapSVG";
import { ChevronIc } from "./icons";

interface HomePageProps {
  onSOS: () => void;
}

export default function HomePage({ onSOS }: HomePageProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: NAV_H + 10 }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 6px" }}>
        <div style={{ fontSize: 11, color: D.sub, fontWeight: 500 }}>Bem-vindo de volta 👋</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: D.text, marginTop: 2 }}>
          Olá, <span style={{ background: `linear-gradient(90deg,${D.blue},${D.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Carlos</span>
        </div>
      </div>

      {/* Risk banner */}
      <div style={{ padding: "10px 20px" }}>
        <div style={{ background: `${D.red}0A`, border: `1px solid ${D.red}1A`, borderRadius: 16, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 20 }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: D.red, letterSpacing: 0.5 }}>ZONA DE RISCO · CONSOLAÇÃO</div>
              <div style={{ fontSize: 11, color: D.sub, marginTop: 2 }}>Pico de alertas: 20h–23h · 6 ocorrências</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: D.red }}>95%</div>
              <div style={{ fontSize: 8, color: D.sub, fontWeight: 600 }}>RISCO</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini mapa + SOS */}
      <div style={{ padding: "6px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Mini mapa */}
          <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border}`, height: 160 }}>
            <MapSVG activeFilter="all" activeFilters={["roubo", "assalto", "acidente", "perigo", "alagamento"]} selId={null} onPin={() => {}} W={354} H={160} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(6,8,14,0.8))", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: D.red, boxShadow: `0 0 6px ${D.red}` }} />
              <span style={{ fontSize: 11, color: D.sub }}>{ALERTS.length} alertas</span>
            </div>
          </div>

          {/* ═══ BOTÃO SOS ═══ */}
          <div style={{ background: D.s1, borderRadius: 18, padding: "14px", border: `1px solid ${D.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: D.sub, letterSpacing: 1.5, marginBottom: 10 }}>CENTRAL DE EMERGÊNCIA</div>
            <button onClick={onSOS} style={{
              width: "100%", padding: "16px", marginBottom: 10,
              background: `linear-gradient(135deg, ${D.red}, #FF5000)`,
              border: "none", borderRadius: 16, color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 6px 24px rgba(255,50,50,0.4), inset 0 1px 0 rgba(255,255,255,0.12)`,
            }}>
              <span style={{ fontSize: 20 }}>🛡</span> SOS — Pedir Ajuda
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              {EMERGENCY_CALLS.slice(0, 3).map((e) => (
                <button key={e.number} onClick={() => window.open(`tel:${e.number}`)} style={{
                  flex: 1, padding: "9px 0",
                  background: `${e.c}0E`, border: `1px solid ${e.c}20`,
                  borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                }}>
                  <span style={{ fontSize: 16 }}>{e.ic}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: e.c }}>{e.number}</span>
                  <span style={{ fontSize: 9, color: D.sub }}>{e.lb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas recentes */}
      <div style={{ padding: "14px 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: D.sub, letterSpacing: 1.5, marginBottom: 10 }}>ALERTAS PRÓXIMOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ALERTS.slice(0, 4).map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", background: D.s1, borderRadius: 14, border: `1px solid ${D.border}`, position: "relative" }}>
              {a.isNew && <div style={{ position: "absolute", top: 8, right: 10, width: 6, height: 6, borderRadius: 3, background: D.red }} />}
              <div style={{ fontSize: 22, width: 36, textAlign: "center" }}>{a.ic}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.t}</div>
                <div style={{ fontSize: 11, color: D.sub, marginTop: 2 }}>📍 {a.bairro} · há {a.ago}</div>
              </div>
              <ChevronIc />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
