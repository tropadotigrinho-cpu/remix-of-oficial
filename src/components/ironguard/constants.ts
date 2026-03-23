/* ═══════════════════════════════════════════════════════════
   IRON GUARD — Constants & Data
═══════════════════════════════════════════════════════════ */

/* ── Design tokens ── */
export const D = {
  bg: "#06080E",
  s1: "#0B1018",
  s2: "#0F1520",
  s3: "#131D2C",
  s4: "#172235",
  border: "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.11)",
  text: "#EEF2FA",
  sub: "rgba(238,242,250,0.36)",
  muted: "rgba(238,242,250,0.14)",
  red: "#FF3232",
  orange: "#FF7A00",
  green: "#22D46A",
  blue: "#3D8EFF",
  yellow: "#FFD000",
  pink: "#FF2D78",
  teal: "#00D4C8",
  purple: "#9D6FFF",
};

/* ── Map colors ── */
export const M = {
  land: "#0C1520",
  block: "#0A1018",
  blockBdr: "#14202E",
  park: "#0B1A10",
  parkBdr: "#133020",
  water: "#081420",
  highway: "#1E3248",
  mainRoad: "#162438",
  sideRoad: "#111D2C",
  label: "rgba(180,210,255,0.2)",
  labelBig: "rgba(180,210,255,0.36)",
};

/* ── SOS Types ── */
export interface SOSType {
  id: string;
  ic: string;
  lb: string;
  sub: string;
  c: string;
  urgent?: boolean;
}

export const SOS_TYPES: SOSType[] = [
  { id: "perigo", ic: "🚨", lb: "Estou em perigo", sub: "Assalto, perseguição ou ameaça", c: D.red, urgent: true },
  { id: "acidente", ic: "💥", lb: "Acidente", sub: "Colisão ou queda de moto", c: D.orange },
  { id: "gasolina", ic: "⛽", lb: "Sem combustível", sub: "Ficou sem gasolina na via", c: D.yellow },
  { id: "quebrado", ic: "🔧", lb: "Veículo quebrado", sub: "Pane mecânica ou elétrica", c: D.teal },
  { id: "pneu", ic: "🔩", lb: "Pneu furado", sub: "Precisa de assistência com pneu", c: D.blue },
  { id: "bateria", ic: "🔋", lb: "Bateria descarregada", sub: "Moto ou celular sem bateria", c: D.purple },
  { id: "perdido", ic: "📍", lb: "Estou perdido", sub: "Precisa de orientação de rota", c: D.green },
  { id: "medico", ic: "🏥", lb: "Emergência médica", sub: "Precisa de atendimento de saúde", c: D.pink, urgent: true },
];

/* ── Emergency Calls ── */
export interface EmergencyCall {
  lb: string;
  number: string;
  ic: string;
  c: string;
  sub: string;
}

export const EMERGENCY_CALLS: EmergencyCall[] = [
  { lb: "SAMU", number: "192", ic: "🚑", c: D.red, sub: "Emergências médicas" },
  { lb: "Bombeiros", number: "193", ic: "🚒", c: D.orange, sub: "Incêndios e resgates" },
  { lb: "Polícia", number: "190", ic: "🚔", c: D.blue, sub: "Crimes e segurança" },
  { lb: "CET SP", number: "1188", ic: "🛣", c: D.teal, sub: "Vias e trânsito SP" },
  { lb: "Guincho", number: "*695", ic: "🏗", c: D.yellow, sub: "Assistência na estrada" },
];

/* ── Filter Types ── */
export interface FilterType {
  id: string;
  lb: string;
  ic: string;
  c: string;
  desc: string;
}

export const ALL_FILTERS: FilterType[] = [
  { id: "roubo", lb: "Roubo de moto", ic: "🏍", c: D.red, desc: "Roubos e furtos de veículos" },
  { id: "assalto", lb: "Assalto", ic: "⚠️", c: D.pink, desc: "Assaltos a pedestres" },
  { id: "acidente", lb: "Acidente", ic: "🚨", c: D.orange, desc: "Colisões e acidentes" },
  { id: "perigo", lb: "Perigo na via", ic: "⚡", c: D.yellow, desc: "Buracos, obstáculos e riscos" },
  { id: "alagamento", lb: "Alagamento", ic: "🌊", c: D.blue, desc: "Vias inundadas e bloqueadas" },
  { id: "ajuda", lb: "Preciso de ajuda", ic: "🔧", c: D.teal, desc: "Assistência mecânica" },
  { id: "caça", lb: "Caça Moto", ic: "🔍", c: D.green, desc: "Motos roubadas em busca" },
  { id: "zona", lb: "Zonas de risco", ic: "🛡", c: D.purple, desc: "Regiões mapeadas" },
];

export const DEFAULT_ON = ["roubo", "assalto", "acidente", "perigo", "alagamento"];

/* ── Alerts ── */
export interface Alert {
  id: number;
  type: string;
  x: number;
  y: number;
  t: string;
  plate?: string;
  model?: string;
  vehicleColor?: string;
  lastSeen?: string;
  reporter?: string;
  reporterAvatar?: string;
  medals?: string;
  bairro: string;
  ago: string;
  dist: string;
  v: number;
  isNew?: boolean;
  color: string;
  ic: string;
}

export const ALERTS: Alert[] = [
  { id: 1, type: "roubo", x: 44, y: 37, t: "Roubo CG 160 prata", plate: "ABC-1234", model: "Honda CG 160", vehicleColor: "Prata", lastSeen: "Consolação · 5 min", reporter: "Fabiano", reporterAvatar: "https://randomuser.me/api/portraits/men/32.jpg", medals: "🥇🥇🥈", bairro: "Consolação", ago: "1min", dist: "220m", v: 11, isNew: true, color: D.red, ic: "🏍" },
  { id: 2, type: "assalto", x: 62, y: 52, t: "Dupla em moto armada", reporter: "Carlos", reporterAvatar: "https://randomuser.me/api/portraits/men/41.jpg", medals: "🥇🥈", bairro: "Bela Vista", ago: "8min", dist: "780m", v: 7, color: D.pink, ic: "⚠️" },
  { id: 3, type: "alagamento", x: 28, y: 60, t: "Via bloqueada alagamento", reporter: "Renato", reporterAvatar: "https://randomuser.me/api/portraits/men/54.jpg", medals: "🥇🥇", bairro: "Bom Retiro", ago: "15min", dist: "1.4km", v: 4, color: D.blue, ic: "🌊" },
  { id: 4, type: "acidente", x: 74, y: 44, t: "Colisão com caminhão", reporter: "Julio", reporterAvatar: "https://randomuser.me/api/portraits/men/67.jpg", medals: "🥇🥉", bairro: "Pinheiros", ago: "28min", dist: "1.9km", v: 5, color: D.orange, ic: "🚨" },
  { id: 5, type: "roubo", x: 52, y: 68, t: "Yamaha Fazer 250 preta", plate: "XYZ-9876", model: "Yamaha Fazer 250", vehicleColor: "Preta", lastSeen: "Cambuci · 10 min", reporter: "Pedro", reporterAvatar: "https://randomuser.me/api/portraits/men/22.jpg", medals: "🥇", bairro: "Cambuci", ago: "52min", dist: "2.1km", v: 9, color: D.red, ic: "🏍" },
  { id: 6, type: "assalto", x: 36, y: 48, t: "Celular roubado", reporter: "Ana", reporterAvatar: "https://randomuser.me/api/portraits/women/44.jpg", medals: "🥈🥈", bairro: "Sta Cecília", ago: "1h", dist: "580m", v: 3, color: D.pink, ic: "⚠️" },
];

export const HEAT = [
  { x: 44, y: 35, i: 1.0 },
  { x: 40, y: 42, i: 0.7 },
  { x: 48, y: 40, i: 0.65 },
  { x: 62, y: 50, i: 0.9 },
  { x: 67, y: 55, i: 0.6 },
  { x: 52, y: 66, i: 0.6 },
  { x: 28, y: 60, i: 0.45 },
];

/* ── Navigation ── */
export const NAV_H = 76;

export interface NavItem {
  id: string;
  lb: string;
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", lb: "Início" },
  { id: "chat", lb: "Chat", badge: 2 },
  { id: "mapa", lb: "Mapa" },
  { id: "feed", lb: "Feed" },
  { id: "perfil", lb: "Perfil" },
];
