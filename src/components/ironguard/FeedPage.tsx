import { useState, useRef } from "react";
import { D, ALL_FILTERS, DEFAULT_ON, FEED_POSTS, USER_TYPE_META, type FeedPost } from "./constants";
import { SearchIc, CloseIc } from "./icons";

export default function FeedPage() {
  const [activeFilters, setActiveFilters] = useState(DEFAULT_ON);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"feed" | "reels">("feed");
  const reelsRef = useRef<HTMLDivElement>(null);

  const filteredPosts = FEED_POSTS.filter((p) => {
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(p.occurrenceType);
    const matchesSearch = searchQuery === "" ||
      p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const photoPosts = filteredPosts.filter((p) => p.type === "photo");
  const videoPosts = filteredPosts.filter((p) => p.type === "video");

  const toggleFilter = (id: string) => {
    setActiveFilters((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const getFilterMeta = (type: string) => ALL_FILTERS.find((f) => f.id === type);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: D.bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "52px 16px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: D.text, letterSpacing: -0.5 }}>Feed</h1>
          <div style={{ display: "flex", gap: 4 }}>
            {(["feed", "reels"] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: viewMode === m ? "rgba(255,255,255,0.1)" : "transparent",
                border: `1px solid ${viewMode === m ? "rgba(255,255,255,0.15)" : "transparent"}`,
                color: viewMode === m ? D.text : D.sub, cursor: "pointer", fontFamily: "inherit",
              }}>
                {m === "feed" ? "📷 Posts" : "🎬 Reels"}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 40, borderRadius: 12,
          background: D.s2, border: `1px solid ${D.border}`, marginBottom: 10,
        }}>
          <span style={{ color: D.sub, display: "flex" }}><SearchIc /></span>
          <input
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por bairro, tipo ou texto..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none", color: D.text,
              fontSize: 12, fontFamily: "inherit",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: D.muted, cursor: "pointer", padding: 0, display: "flex" }}>
              <CloseIc />
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
          {ALL_FILTERS.slice(0, 10).map((f) => {
            const on = activeFilters.includes(f.id);
            return (
              <button key={f.id} onClick={() => toggleFilter(f.id)} style={{
                flexShrink: 0, padding: "5px 10px", borderRadius: 16, fontSize: 10, fontWeight: on ? 600 : 400,
                background: on ? `${f.c}16` : D.s2, border: `1px solid ${on ? f.c + "30" : D.border}`,
                color: on ? f.c : D.sub, cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
                whiteSpace: "nowrap", fontFamily: "inherit", transition: "all .15s",
              }}>
                <span>{f.ic}</span>{f.lb.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {viewMode === "feed" ? (
          <div style={{ height: "100%", overflowY: "auto", padding: "0 16px 100px" }}>
            {(searchQuery ? filteredPosts : [...photoPosts, ...videoPosts]).map((post) => (
              <PhotoPostCard key={post.id} post={post} getFilterMeta={getFilterMeta} />
            ))}
            {filteredPosts.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: D.muted, fontSize: 13 }}>
                Nenhum post encontrado
              </div>
            )}
          </div>
        ) : (
          <div ref={reelsRef} style={{
            height: "100%", overflowY: "auto", scrollSnapType: "y mandatory",
          }}>
            {videoPosts.map((post) => (
              <ReelCard key={post.id} post={post} getFilterMeta={getFilterMeta} />
            ))}
            {videoPosts.length === 0 && (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: D.muted, fontSize: 13 }}>
                Nenhum reel disponível
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoPostCard({ post, getFilterMeta }: { post: FeedPost; getFilterMeta: (t: string) => any }) {
  const meta = getFilterMeta(post.occurrenceType);
  const userMeta = USER_TYPE_META[post.userType];

  return (
    <div style={{
      background: D.s1, borderRadius: 16, border: `1px solid ${D.border}`,
      marginBottom: 12, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <img src={post.userAvatar} alt="" style={{ width: 36, height: 36, borderRadius: 18, objectFit: "cover" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: D.text }}>{post.userName}</span>
            <span style={{ fontSize: 10, color: D.sub }}>{userMeta.ic} {userMeta.lb}</span>
          </div>
          <div style={{ fontSize: 10, color: D.muted, marginTop: 1 }}>
            📍 {post.location} · {post.timestamp}
          </div>
        </div>
        {meta && (
          <div style={{
            padding: "3px 8px", borderRadius: 10, fontSize: 9, fontWeight: 600,
            background: `${meta.c}16`, color: meta.c, border: `1px solid ${meta.c}25`,
          }}>
            {meta.ic} {meta.lb.split(" ")[0]}
          </div>
        )}
      </div>

      {/* Caption */}
      <div style={{ padding: "0 14px 10px", fontSize: 12, color: D.sub, lineHeight: 1.5 }}>
        {post.caption}
      </div>

      {/* Media */}
      <div style={{ position: "relative" }}>
        <img src={post.mediaUrl} alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 14px" }}>
        <ActionButton icon="❤️" count={post.likes} />
        <ActionButton icon="💬" count={post.comments} />
        <ActionButton icon="↗️" count={post.shares} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: D.muted }}>🔖</span>
      </div>
    </div>
  );
}

function ReelCard({ post, getFilterMeta }: { post: FeedPost; getFilterMeta: (t: string) => any }) {
  const meta = getFilterMeta(post.occurrenceType);
  const userMeta = USER_TYPE_META[post.userType];

  return (
    <div style={{
      height: "80vh", scrollSnapAlign: "start", position: "relative",
      background: D.bg, marginBottom: 2,
    }}>
      {/* Background image */}
      <img src={post.mediaUrl} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", filter: "brightness(0.7)",
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
        background: "linear-gradient(transparent, rgba(6,8,14,0.95))",
      }} />

      {/* Side actions */}
      <div style={{
        position: "absolute", right: 12, bottom: "25%", display: "flex",
        flexDirection: "column", alignItems: "center", gap: 18,
      }}>
        <SideAction icon="❤️" count={post.likes} />
        <SideAction icon="💬" count={post.comments} />
        <SideAction icon="↗️" count={post.shares} />
        <SideAction icon="🔖" />
      </div>

      {/* Bottom info */}
      <div style={{ position: "absolute", bottom: 20, left: 14, right: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <img src={post.userAvatar} alt="" style={{ width: 32, height: 32, borderRadius: 16, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{post.userName}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{userMeta.ic}</span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{post.location}</span>
          </div>
        </div>
        {meta && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px",
            borderRadius: 8, background: `${meta.c}30`, marginBottom: 6, fontSize: 10,
            fontWeight: 600, color: meta.c,
          }}>
            {meta.ic} {meta.lb}
          </div>
        )}
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
          {post.caption}
        </div>
      </div>

      {/* Play indicator */}
      {post.type === "video" && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 56, height: 56, borderRadius: 28, background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          ▶
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, count }: { icon: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 11, color: D.sub }}>{count}</span>
    </div>
  );
}

function SideAction({ icon, count }: { icon: string; count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      {count !== undefined && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{count}</span>}
    </div>
  );
}
