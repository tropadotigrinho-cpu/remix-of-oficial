import { useState, useEffect } from "react";
import { D, M, HEAT, ALERTS, type Alert } from "./constants";

interface MapSVGProps {
  activeFilter?: string;
  activeFilters: string[];
  selId?: number | null;
  onPin: (alert: Alert) => void;
  W?: number;
  H?: number;
}

export default function MapSVG({ activeFilter, activeFilters, selId, onPin, W = 390, H = 560 }: MapSVGProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 850);
    return () => clearInterval(t);
  }, []);

  const px = (v: number) => (v / 100) * W;
  const py = (v: number) => (v / 100) * H;
  const pR = (r: number) => r + (tick % 2 === 0 ? 11 : 6);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      {/* Defs */}
      <defs>
        <radialGradient id="hg">
          <stop offset="0%" stopColor={D.red} stopOpacity="0.35" />
          <stop offset="100%" stopColor={D.red} stopOpacity="0" />
        </radialGradient>
        {HEAT.map((h, i) => (
          <radialGradient key={`hg${i}`} id={`hg${i}`}>
            <stop offset="0%" stopColor={D.red} stopOpacity={0.18 * h.i} />
            <stop offset="100%" stopColor={D.red} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill={M.land} />

      {/* Parks */}
      {([[8, 22, 16, 12], [68, 22, 14, 10], [45, 10, 12, 8]] as number[][]).map(([x, y, w, h], i) => (
        <rect key={`park${i}`} x={px(x)} y={py(y)} width={px(w)} height={py(h)} rx={4} fill={M.park} stroke={M.parkBdr} strokeWidth={0.5} />
      ))}

      {/* Blocks */}
      {([
        [4, 4, 10, 10], [18, 4, 12, 10], [34, 4, 9, 10], [47, 4, 12, 10], [63, 4, 10, 10], [77, 4, 18, 10],
        [4, 20, 8, 12], [26, 20, 10, 12], [40, 20, 7, 12], [51, 20, 7, 12], [62, 20, 7, 12], [85, 20, 11, 12],
        [4, 36, 10, 10], [18, 36, 12, 10], [34, 36, 9, 10], [47, 36, 10, 10], [61, 36, 10, 10], [75, 36, 9, 10],
        [4, 55, 10, 10], [18, 55, 12, 10], [34, 55, 9, 10], [47, 55, 10, 10], [61, 55, 10, 10], [75, 55, 9, 10],
      ] as number[][]).map(([x, y, w, h], i) => (
        <rect key={`blk${i}`} x={px(x)} y={py(y)} width={px(w)} height={py(h)} rx={3} fill={M.block} stroke={M.blockBdr} strokeWidth={0.5} />
      ))}

      {/* Highways */}
      {([
        [[0, py(32)], [W, py(32)]],
        [[px(50), 0], [px(50), H]],
      ] as number[][][]).map(([[x1, y1], [x2, y2]], i) => (
        <line key={`hw${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={M.highway} strokeWidth={3} />
      ))}

      {/* Side Roads */}
      {([
        [[0, py(22)], [W, py(22)]], [[0, py(46)], [W, py(46)]], [[0, py(68)], [W, py(68)]],
        [[px(16), 0], [px(16), H]], [[px(32), 0], [px(32), H]], [[px(62), 0], [px(62), H]], [[px(80), 0], [px(80), H]],
      ] as number[][][]).map(([[x1, y1], [x2, y2]], i) => (
        <line key={`rd${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={M.sideRoad} strokeWidth={1.5} />
      ))}

      {/* Heatmap */}
      {HEAT.map((h, i) => (
        <circle key={`ht${i}`} cx={px(h.x)} cy={py(h.y)} r={px(8) * h.i} fill={`url(#hg${i})`} />
      ))}

      {/* Bairro labels */}
      {([
        { lb: "CONSOLAÇÃO", x: 44, y: 26, big: true },
        { lb: "BELA VISTA", x: 62, y: 29, big: true },
        { lb: "PINHEIROS", x: 18, y: 45 },
        { lb: "CAMBUCI", x: 52, y: 62 },
      ] as { lb: string; x: number; y: number; big?: boolean }[]).map((b, i) => (
        <text key={`lb${i}`} x={px(b.x)} y={py(b.y)} textAnchor="middle" fill={b.big ? M.labelBig : M.label} fontSize={b.big ? 9 : 7} fontWeight={600} letterSpacing={2}>
          {b.lb}
        </text>
      ))}

      {/* User position */}
      <circle cx={px(50)} cy={py(50)} r={pR(0)} fill={D.blue} opacity={0.08} />
      <circle cx={px(50)} cy={py(50)} r={8} fill={D.blue} opacity={0.2} />
      <circle cx={px(50)} cy={py(50)} r={5} fill={D.blue} />
      <circle cx={px(50)} cy={py(50)} r={2.5} fill="#fff" />
      <text x={px(50) + 10} y={py(50) - 6} fill={D.blue} fontSize={8} fontWeight={600} opacity={0.7}>
        3
      </text>

      {/* Alert pins */}
      {ALERTS.map((a) => {
        if (activeFilter && activeFilter !== "all" && a.type !== activeFilter) return null;
        if (!activeFilters.includes(a.type)) return null;
        const isSel = selId === a.id;
        const isNew = a.isNew;
        const r = isSel ? 16 : isNew ? 12 : 10;
        const cx = px(a.x);
        const cy = py(a.y);
        return (
          <g key={a.id} onClick={() => onPin(a)} style={{ cursor: "pointer" }}>
            {isNew && <circle cx={cx} cy={cy} r={pR(r)} fill={a.color} opacity={0.1} />}
            {isSel && <circle cx={cx} cy={cy} r={r + 6} fill={a.color} opacity={0.12} />}
            <circle cx={cx} cy={cy} r={r} fill={a.color} opacity={0.22} />
            <circle cx={cx} cy={cy} r={r * 0.6} fill={a.color} />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={isSel ? 14 : 11}>
              {a.ic}
            </text>
            {isSel && (
              <text x={cx} y={cy + r + 14} textAnchor="middle" fill={D.text} fontSize={8} fontWeight={600}>
                {a.t.length > 26 ? a.t.slice(0, 26) + "…" : a.t}
              </text>
            )}
          </g>
        );
      })}

      {/* North */}
      <text x={W - 18} y={20} fill={M.label} fontSize={10} fontWeight={700}>
        N
      </text>
    </svg>
  );
}
