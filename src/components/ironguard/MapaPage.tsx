import { useState } from "react";
import { D, ALL_FILTERS, DEFAULT_ON, ALERTS, NAV_H, type Alert } from "./constants";
import MapOrchestrator from "../map/MapOrchestrator";
import OccurrenceModal from "./OccurrenceModal";
import { CloseIc } from "./icons";

export default function MapaPage() {
  const [filter, setFilter] = useState("all");
  const [activeOn, setActiveOn] = useState(DEFAULT_ON);
  const [selItem, setSelItem] = useState<Alert | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCfg, setShowCfg] = useState(false);

  const toggleOn = (id: string) => setActiveOn((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const visibleFilters = [{ id: "all", lb: "Todos", ic: "◉", c: D.text, desc: "" }, ...ALL_FILTERS.filter((f) => activeOn.includes(f.id))];

  const handlePinClick = (props: Record<string, unknown>) => {
    const alert = ALERTS.find((a) => a.id === Number(props.id));
    if (alert) setSelItem(alert);
  };

  return (
    <div style={{ position: "absolute", inset: 0, bottom: NAV_H }}>
      <MapOrchestrator activeFilters={activeOn} onPinClick={handlePinClick} />

      {/* ── Map Header — clean, minimal ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "52px 16px 0" }}>
        {/* Search bar */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            padding: "0 14px", height: 42, borderRadius: 12,
            background: "rgba(15,21,32,0.8)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(238,242,250,0.3)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span style={{ fontSize: 12, color: "rgba(238,242,250,0.25)" }}>Buscar bairro ou alerta...</span>
          </div>
          <button onClick={() => setShowCfg(true)} style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: showCfg ? "rgba(255,255,255,0.08)" : "rgba(15,21,32,0.8)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${showCfg ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
            color: showCfg ? D.text : "rgba(238,242,250,0.35)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s", position: "relative",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9" opacity="0.6" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {activeOn.join() !== DEFAULT_ON.join() && <div style={{ position: "absolute", top: 8, right: 8, width: 5, height: 5, borderRadius: "50%", background: "#3D8EFF" }} />}
          </button>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
          {visibleFilters.map((f) => {
            const on = filter === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                flexShrink: 0, padding: "5px 12px", borderRadius: 20,
                border: on ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.05)",
                background: on ? "rgba(255,255,255,0.08)" : "rgba(15,21,32,0.7)",
                backdropFilter: "blur(16px)",
                color: on ? D.text : "rgba(238,242,250,0.4)",
                fontSize: 11, fontWeight: on ? 600 : 400,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                transition: "all .15s", whiteSpace: "nowrap", fontFamily: "inherit",
              }}>
                {f.id === "all" ? <span style={{ fontSize: 8 }}>●</span> : <span style={{ fontSize: 13 }}>{f.ic}</span>}
                {f.lb}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ position: "absolute", bottom: 14, left: 20, right: 20, zIndex: 10 }}>
        <button onClick={() => setShowCreate(true)} style={{
          width: "100%", padding: "14px 0", borderRadius: 14,
          background: "rgba(255,60,60,0.9)",
          border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: "0 4px 20px rgba(255,50,50,0.3)",
        }}>
          + Criar Alerta
        </button>
      </div>

      {/* ═══ CONFIG SHEET ═══ */}
      {showCfg && (
        <div className="ig-fade" onClick={(e) => { if (e.target === e.currentTarget) setShowCfg(false); }} style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setShowCfg(false)} />
          <div className="ig-sheet" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: D.s1, borderRadius: "20px 20px 0 0", border: `1px solid ${D.border}`, borderBottom: "none", padding: "20px", maxHeight: "75%", overflowY: "auto" }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: D.text }}>Filtros</div>
                <div style={{ fontSize: 11, color: D.sub, marginTop: 2 }}>Personalize tipos visíveis</div>
              </div>
              <button onClick={() => setShowCfg(false)} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloseIc />
              </button>
            </div>
            <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${D.border}` }}>
              {ALL_FILTERS.map((f, i) => {
                const on = activeOn.includes(f.id);
                const isLast = i === ALL_FILTERS.length - 1;
                return (
                  <div key={f.id} onClick={() => toggleOn(f.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: on ? "rgba(255,255,255,0.02)" : "transparent", borderBottom: isLast ? "none" : `1px solid ${D.border}`, cursor: "pointer", transition: "background .15s" }}>
                    <span style={{ fontSize: 18 }}>{f.ic}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: D.text }}>{f.lb}</div>
                      <div style={{ fontSize: 10, color: D.sub, marginTop: 1 }}>{f.desc}</div>
                    </div>
                    <div style={{ width: 38, height: 22, borderRadius: 11, background: on ? "rgba(34,212,106,0.8)" : "rgba(255,255,255,0.06)", padding: 2, cursor: "pointer", transition: "all .2s" }}>
                      <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", transform: on ? "translateX(16px)" : "translateX(0)", transition: "transform .2s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => setActiveOn(DEFAULT_ON)} style={{ flex: 1, padding: "11px", background: "transparent", border: `1px solid ${D.border}`, borderRadius: 12, color: D.sub, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Restaurar</button>
              <button onClick={() => setShowCfg(false)} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: D.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ OCCURRENCE MODAL ═══ */}
      {selItem && <OccurrenceModal alert={selItem} onClose={() => setSelItem(null)} />}

      {/* Criar alerta sheet */}
      {showCreate && (
        <div className="ig-fade" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }} style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.5)" }}>
          <div className="ig-sheet" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: D.s1, borderRadius: "20px 20px 0 0", border: `1px solid ${D.border}`, borderBottom: "none", padding: "20px" }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: D.text }}>Novo Alerta</div>
                <span style={{ fontSize: 11, color: D.sub }}>Campinas · posição atual</span>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloseIc />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {([["🏍", "Roubo", D.red], ["⚠️", "Assalto", D.pink], ["🚨", "Acidente", D.orange], ["🌊", "Alagamento", D.blue], ["⚡", "Perigo", D.yellow], ["🔧", "Ajuda", D.teal]] as [string, string, string][]).map(([ic, lb, c]) => (
                <button key={lb} onClick={() => setShowCreate(false)} style={{ padding: "11px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontFamily: "inherit" }}>
                  <span style={{ fontSize: 20 }}>{ic}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: D.text }}>{lb}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCreate(false)} style={{ width: "100%", padding: "13px", background: "rgba(255,60,60,0.9)", border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(255,50,50,0.3)" }}>Confirmar localização</button>
          </div>
        </div>
      )}
    </div>
  );
}
