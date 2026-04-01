import { useState, useRef } from "react";
import { D, ALL_FILTERS, DEFAULT_ON, FEED_POSTS, USER_TYPE_META, type FeedPost } from "./constants";
import { SearchIc, CloseIc } from "./icons";

export default function FeedPage() {
  const [activeFilters, setActiveFilters] = useState(DEFAULT_ON);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const reelsRef = useRef<HTMLDivElement>(null);

  const filteredPosts = FEED_POSTS.filter((p) => {
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(p.occurrenceType);
    const matchesSearch = searchQuery === "" ||
      p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleFilter = (id: string) => {
    setActiveFilters((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const getFilterMeta = (type: string) => ALL_FILTERS.find((f) => f.id === type);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#000", overflow: "hidden" }}>
      {/* Top overlay with search & filters */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        background: "linear-gradient(rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 80%, transparent 100%)",
        padding: "48px 14px 12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>Ocorrências</h1>
            <button
              onClick={() => setShowFilters((p) => !p)}
              style={{
                width: 30, height: 30, borderRadius: 15, background: showFilters ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.08)",
                border: showFilters ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                color: showFilters ? "#00D4FF" : "rgba(255,255,255,0.5)", fontSize: 14, transition: "all .15s",
              }}
            >
              ⚙
            </button>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            {filteredPosts.length} posts
          </span>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0 10px", height: 34, borderRadius: 17,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}><SearchIc /></span>
              <input
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar bairro, tipo..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 11, fontFamily: "inherit" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0, display: "flex" }}>
                  <CloseIc />
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 }}>
              {ALL_FILTERS.slice(0, 10).map((f) => {
                const on = activeFilters.includes(f.id);
                return (
                  <button key={f.id} onClick={() => toggleFilter(f.id)} style={{
                    flexShrink: 0, padding: "4px 9px", borderRadius: 14, fontSize: 10, fontWeight: on ? 600 : 400,
                    background: on ? `${f.c}20` : "rgba(255,255,255,0.06)",
                    border: `1px solid ${on ? f.c + "40" : "rgba(255,255,255,0.05)"}`,
                    color: on ? f.c : "rgba(255,255,255,0.4)", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 3,
                    whiteSpace: "nowrap", fontFamily: "inherit", transition: "all .15s",
                  }}>
                    <span>{f.ic}</span>{f.lb.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reels content — full screen scroll snap */}
      <div ref={reelsRef} style={{
        height: "100%", overflowY: "auto", scrollSnapType: "y mandatory",
      }}>
        {filteredPosts.map((post) => (
          <ReelCard key={post.id} post={post} getFilterMeta={getFilterMeta} />
        ))}
        {filteredPosts.length === 0 && (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            Nenhuma ocorrência encontrada
          </div>
        )}
      </div>
    </div>
  );
}

function ReelCard({ post, getFilterMeta }: { post: FeedPost; getFilterMeta: (t: string) => any }) {
  const meta = getFilterMeta(post.occurrenceType);
  const userMeta = USER_TYPE_META[post.userType];

  return (
    <div style={{
      height: "100vh", scrollSnapAlign: "start", position: "relative",
      background: "#000",
    }}>
      {/* Full-screen background */}
      <img src={post.mediaUrl} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover",
      }} />

      {/* Bottom gradient */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
      }} />

      {/* Side actions */}
      <div style={{
        position: "absolute", right: 10, bottom: 120, display: "flex",
        flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        <SideAction icon="❤️" count={post.likes} />
        <SideAction icon="💬" count={post.comments} />
        <SideAction icon="↗️" count={post.shares} />
        <SideAction icon="🔖" />
      </div>

      {/* Bottom info */}
      <div style={{ position: "absolute", bottom: 80, left: 14, right: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <img src={post.userAvatar} alt="" style={{
            width: 34, height: 34, borderRadius: 17, objectFit: "cover",
            border: "2px solid rgba(255,255,255,0.25)",
          }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{post.userName}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{userMeta.ic} {userMeta.lb}</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>📍 {post.location} · {post.timestamp}</span>
          </div>
        </div>
        {meta && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px",
            borderRadius: 8, background: `${meta.c}25`, marginBottom: 6, fontSize: 10,
            fontWeight: 600, color: meta.c,
          }}>
            {meta.ic} {meta.lb}
          </div>
        )}
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.4, marginTop: 4 }}>
          {post.caption}
        </div>
      </div>

      {/* Play indicator */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 52, height: 52, borderRadius: 26, background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, color: "rgba(255,255,255,0.8)",
      }}>
        ▶
      </div>
    </div>
  );
}

function SideAction({ icon, count }: { icon: string; count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      {count !== undefined && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{count}</span>}
    </div>
  );
}
