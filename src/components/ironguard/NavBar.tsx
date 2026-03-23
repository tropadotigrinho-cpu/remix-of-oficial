import { D, NAV_ITEMS, NAV_H } from "./constants";
import { NAV_ICONS } from "./icons";

interface NavBarProps {
  nav: string;
  setNav: (id: string) => void;
}

export default function NavBar({ nav, setNav }: NavBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        height: NAV_H,
        background: `linear-gradient(to top, ${D.bg}, ${D.bg}F2, ${D.bg}B0)`,
        backdropFilter: "blur(18px)",
        borderTop: `1px solid ${D.border}`,
        display: "flex",
        alignItems: "flex-start",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      {NAV_ITEMS.map(({ id, lb, badge }) => {
        const on = nav === id;
        const Ic = NAV_ICONS[id];
        return (
          <button
            key={id}
            onClick={() => setNav(id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "8px 0 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", color: on ? D.text : D.sub, transition: "color .2s" }}>
              {Ic && <Ic />}
              {badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: D.red,
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {badge}
                </div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 400, color: on ? D.text : D.sub, transition: "all .2s" }}>
              {lb}
            </span>
          </button>
        );
      })}
    </div>
  );
}
