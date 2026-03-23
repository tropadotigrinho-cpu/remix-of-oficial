import { useState } from "react";
import { D, ALL_FILTERS, DEFAULT_ON, ALERTS, NAV_H, type Alert } from "./constants";
import MapOrchestrator from "../map/MapOrchestrator";
import OccurrenceModal from "./OccurrenceModal";
import { SearchIc, GearIc, CloseIc } from "./icons";

export default function MapaPage() {
  const [filter, setFilter] = useState("all");
  const [activeOn, setActiveOn] = useState(DEFAULT_ON);
  const [selItem, setSelItem] = useState<Alert | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCfg, setShowCfg] = useState(false);
  const [toast, setToast] = useState(true);

  const toggleOn = (id: string) => setActiveOn((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const visibleFilters = [{ id: "all", lb: "Todos", ic: "◉", c: D.text, desc: "" }, ...ALL_FILTERS.filter((f) => activeOn.includes(f.id))];

  return (
    <div style={{ position: "absolute", inset: 0, bottom: NAV_H }}>
      <MapOrchestrator
        activeFilters={activeOn}
        onPinClick={(props) => {
          const alert = ALERTS.find((a) => a.id === Number(props.id));
          if (alert) setSelItem(alert);
        }}
      />

      {/* TOP */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "52px 16px 0" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 44, borderRadius: 14, background: "rgba(6,8,14,0.94)", backdropFilter: "blur(16px)", border: `1px solid ${D.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.42)" }}>
            <span style={{ color: D.sub }}><SearchIc /></span>
            <span style={{ fontSize: 12, color: D.muted }}>Buscar bairro ou alerta...</span>
          </div>
          <button onClick={() => setShowCfg(true)} style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: showCfg ? "rgba(255,255,255,0.09)" : "rgba(6,8,14,0.94)", backdropFilter: "blur(16px)", border: `1px solid ${showCfg ? D.border2 : D.border}`, color: showCfg ? D.text : D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.42)", transition: "all .2s", position: "relative" }}>
            <GearIc />
            {activeOn.join() !== DEFAULT_ON.join() && <div style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: 3, background: D.blue }} />}
          </button>
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
          {visibleFilters.map((f) => {
            const on = filter === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, border: `1px solid ${on ? f.c + "40" : "rgba(255,255,255,0.08)"}`, background: on ? `${f.c}16` : "rgba(6,8,14,0.82)", backdropFilter: "blur(12px)", color: on ? f.c : D.sub, fontSize: 11, fontWeight: on ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all .15s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {f.id === "all" ? <span style={{ color: on ? D.text : D.sub }}>●</span> : <span>{f.ic}</span>}
                {f.lb}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && !selItem && (
        <div style={{ position: "absolute", top: 148, left: 16, right: 16, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: `${D.red}12`, border: `1px solid ${D.red}20`, borderRadius: 14, backdropFilter: "blur(12px)" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: D.red, boxShadow: `0 0 8px ${D.red}` }} />
            <span style={{ flex: 1, fontSize: 11, color: D.sub }}>Consolação · alta incidência <span style={{ color: D.red }}>20h–23h</span></span>
            <button onClick={() => setToast(false)} style={{ background: "none", border: "none", color: D.muted, cursor: "pointer", padding: 0, display: "flex" }}>
              <CloseIc />
            </button>
          </div>
        </div>
      )}

      {/* Controls are now in MapOrchestrator → MapControls */}


      {/* Criar alerta btn */}
      <div style={{ position: "absolute", bottom: 14, left: 20, right: 20, zIndex: 10 }}>
        <button onClick={() => setShowCreate(true)} style={{ width: "100%", padding: "15px 0", borderRadius: 18, background: `linear-gradient(135deg,${D.red},#FF5000)`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 24px rgba(255,50,50,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
          + Criar Alerta
        </button>
      </div>

      {/* ═══ CONFIG SHEET ═══ */}
      {showCfg && (
        <div className="ig-fade" onClick={(e) => { if (e.target === e.currentTarget) setShowCfg(false); }} style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setShowCfg(false)} />
          <div className="ig-sheet" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: D.s1, borderRadius: "24px 24px 0 0", border: `1px solid ${D.border}`, borderBottom: "none", padding: "20px", maxHeight: "75%", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: D.border2, margin: "0 auto 16px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: D.text }}>Filtros da barra</div>
                <div style={{ fontSize: 12, color: D.sub, marginTop: 2 }}>Personalize quais tipos aparecem</div>
              </div>
              <button onClick={() => setShowCfg(false)} style={{ width: 30, height: 30, borderRadius: 9, background: D.s3, border: `1px solid ${D.border}`, color: D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloseIc />
              </button>
            </div>

            {/* PRÉVIA */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: D.sub, letterSpacing: 1.5, marginBottom: 8 }}>PRÉVIA DA BARRA</div>
              <div style={{ background: D.s2, borderRadius: 14, padding: 12, border: `1px solid ${D.border}` }}>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
                  <div style={{ padding: "4px 10px", borderRadius: 16, background: `${D.text}16`, border: `1px solid ${D.text}30`, fontSize: 10, color: D.text, fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ color: D.text }}>●</span>Todos
                  </div>
                  {ALL_FILTERS.filter((f) => activeOn.includes(f.id)).map((f) => (
                    <div key={f.id} style={{ padding: "4px 10px", borderRadius: 16, background: `${f.c}12`, border: `1px solid ${f.c}25`, fontSize: 10, color: f.c, fontWeight: 500, flexShrink: 0, display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
                      <span>{f.ic}</span>{f.lb.split(" ")[0]}
                    </div>
                  ))}
                  {activeOn.length === 0 && <span style={{ fontSize: 11, color: D.muted }}>Nenhum filtro ativo</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: activeOn.length > 0 ? D.green : D.muted }} />
                  <span style={{ fontSize: 10, color: D.sub }}>{activeOn.length} de {ALL_FILTERS.length} tipos ativos</span>
                </div>
              </div>
            </div>

            {/* LISTA DE TIPOS */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: D.sub, letterSpacing: 1.5, marginBottom: 8 }}>TIPOS DISPONÍVEIS</div>
              <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${D.border}` }}>
                {ALL_FILTERS.map((f, i) => {
                  const on = activeOn.includes(f.id);
                  const isLast = i === ALL_FILTERS.length - 1;
                  return (
                    <div key={f.id} onClick={() => toggleOn(f.id)} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", background: on ? `${f.c}08` : D.s2, borderBottom: isLast ? "none" : `1px solid ${D.border}`, cursor: "pointer", transition: "background .15s" }}>
                      <div style={{ fontSize: 20 }}>{f.ic}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{f.lb}</div>
                        <div style={{ fontSize: 11, color: D.sub, marginTop: 1 }}>{f.desc}</div>
                      </div>
                      <div style={{ width: 42, height: 24, borderRadius: 12, background: on ? D.green : D.s3, border: `1px solid ${on ? D.green : D.border2}`, padding: 2, cursor: "pointer", transition: "all .2s" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", transform: on ? "translateX(18px)" : "translateX(0)", transition: "transform .2s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActiveOn(DEFAULT_ON)} style={{ flex: 1, padding: "12px", background: "transparent", border: `1px solid ${D.border}`, borderRadius: 14, color: D.sub, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Restaurar</button>
              <button onClick={() => setShowCfg(false)} style={{ flex: 1, padding: "12px", background: D.s2, border: `1px solid ${D.border2}`, borderRadius: 14, color: D.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ OCCURRENCE MODAL ═══ */}
      {selItem && <OccurrenceModal alert={selItem} onClose={() => setSelItem(null)} />}

      {/* Criar alerta sheet */}
      {showCreate && (
        <div className="ig-fade" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }} style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.5)" }}>
          <div className="ig-sheet" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: D.s1, borderRadius: "24px 24px 0 0", border: `1px solid ${D.border}`, borderBottom: "none", padding: "20px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: D.border2, margin: "0 auto 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: D.text }}>Novo Alerta</div>
                <span style={{ fontSize: 11, color: D.sub }}>São Paulo · posição atual</span>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ width: 30, height: 30, borderRadius: 9, background: D.s3, border: `1px solid ${D.border}`, color: D.sub, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CloseIc />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {([["🏍", "Roubo", D.red], ["⚠️", "Assalto", D.pink], ["🚨", "Acidente", D.orange], ["🌊", "Alagamento", D.blue], ["⚡", "Perigo", D.yellow], ["🔧", "Ajuda", D.teal]] as [string, string, string][]).map(([ic, lb, c]) => (
                <button key={lb} onClick={() => setShowCreate(false)} style={{ padding: "11px 10px", background: `${c}08`, border: `1px solid ${c}1A`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontFamily: "inherit" }}>
                  <div style={{ fontSize: 20 }}>{ic}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{lb}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCreate(false)} style={{ width: "100%", padding: "14px", background: `linear-gradient(135deg,${D.red},#FF5000)`, border: "none", borderRadius: 15, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(255,50,50,0.35)" }}>Confirmar localização</button>
          </div>
        </div>
      )}
    </div>
  );
}
