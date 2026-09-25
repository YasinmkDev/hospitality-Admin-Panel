import { useState, useEffect, useRef } from "react";
import { Layout, Menu, Avatar, Badge, Dropdown, Input, Tooltip, Drawer, Spin } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  HomeOutlined,
  KeyOutlined,
  TagsOutlined,
  StarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CloudOutlined,
  CalendarOutlined,
  ClearOutlined,
  BellOutlined,
  SettingOutlined,
  SearchOutlined,
  StopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, NAVY } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/mockApi";
import type { Room, RoomEntry, RoomReminder } from "@/lib/types";

type SearchResult = { key: string; label: string; sub: string; path: string };

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const loc = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuth();

  // ── Search ──────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      const q = query.toLowerCase();
      const [rooms, reservations] = await Promise.all([
        api.room.list() as Promise<Room[]>,
        api.reservation.list() as Promise<RoomEntry[]>,
      ]);
      const results: SearchResult[] = [
        ...rooms
          .filter((r) => r.number.toLowerCase().includes(q) || r.reservationStatus?.toLowerCase().includes(q))
          .slice(0, 4)
          .map((r) => ({ key: `room-${r.roomId}`, label: `Room #${r.number}`, sub: r.reservationStatus ?? "Room", path: "/rooms" })),
        ...reservations
          .filter((r) => r.customerName?.toLowerCase().includes(q) || r.registrationNo?.toLowerCase().includes(q))
          .slice(0, 4)
          .map((r) => ({ key: `res-${r.roomEntryId}`, label: r.customerName ?? "Guest", sub: `Reg: ${r.registrationNo}`, path: "/reservations" })),
      ];
      setSearchResults(results);
      setSearchOpen(results.length > 0);
      setSearchLoading(false);
    }, 300);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Notifications ────────────────────────────────────────────────────────
  const [reminders, setReminders] = useState<RoomReminder[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    api.reminder.list().then((r) =>
      setReminders((r as RoomReminder[]).filter((x) => !x.isDone).slice(0, 8))
    );
  }, []);

  const unread = reminders.length;

  // Screen resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [loc.pathname]);

  const items = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      type: "group" as const,
      label: "OPERATIONS",
      children: [
        { key: "/floors", icon: <AppstoreOutlined />, label: <Link to="/floors">Floors</Link> },
        { key: "/rooms", icon: <HomeOutlined />, label: <Link to="/rooms">Rooms</Link> },
        { key: "/rooms/layout", icon: <AppstoreOutlined />, label: <Link to="/rooms/layout">Floor Plan</Link> },
        { key: "/beds", icon: <KeyOutlined />, label: <Link to="/beds">Beds</Link> },
      ],
    },
    {
      type: "group" as const,
      label: "CATALOG",
      children: [
        { key: "/room-types", icon: <TagsOutlined />, label: <Link to="/room-types">Room Types</Link> },
        { key: "/room-features", icon: <StarOutlined />, label: <Link to="/room-features">Features</Link> },
        { key: "/room-products", icon: <ShoppingOutlined />, label: <Link to="/room-products">Products</Link> },
        { key: "/room-rates", icon: <DollarOutlined />, label: <Link to="/room-rates">Rates</Link> },
        { key: "/seasons", icon: <CloudOutlined />, label: <Link to="/seasons">Seasons</Link> },
      ],
    },
    {
      type: "group" as const,
      label: "GUEST FLOW",
      children: [
        { key: "/reservations", icon: <CalendarOutlined />, label: <Link to="/reservations">Reservations</Link> },
        { key: "/reservations/dnr", icon: <StopOutlined />, label: <Link to="/reservations/dnr">DNR List</Link> },
        { key: "/housekeeping", icon: <ClearOutlined />, label: <Link to="/housekeeping">Housekeeping</Link> },
        { key: "/reminders", icon: <BellOutlined />, label: <Link to="/reminders">Reminders</Link> },
      ],
    },
    {
      type: "group" as const,
      label: "SYSTEM",
      children: [
        { key: "/settings", icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
      ],
    },
  ];

  const brandHeader = (
    <div
      style={{
        height: 72,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: collapsed && !isMobile ? "0 20px" : "0 22px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${GOLD}, #fff8e1)`,
          display: "grid",
          placeItems: "center",
          color: NAVY,
          fontFamily: "'Fraunces', serif",
          fontWeight: 800,
          fontSize: 20,
          boxShadow: "0 6px 20px rgba(201,166,107,0.35)",
          flexShrink: 0,
        }}
      >
        C
      </motion.div>
      {(!collapsed || isMobile) && (
        <div style={{ color: "#fff", lineHeight: 1.1 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, letterSpacing: 0.4 }}>
            Cizaro
          </div>
          <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 2 }}>HOSPITALITY SUITE</div>
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          width={260}
          collapsedWidth={76}
          collapsed={collapsed}
          theme="dark"
          style={{
            background: NAVY,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "auto",
            zIndex: 20,
          }}
        >
          {brandHeader}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[loc.pathname]}
            items={items as any}
            style={{ background: NAVY, borderInlineEnd: 0, padding: "12px 8px" }}
          />
        </Sider>
      )}

      {/* Mobile Navigation Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        closable={false}
        styles={{ body: { padding: 0, background: NAVY } }}
        width={280}
      >
        {brandHeader}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[loc.pathname]}
          items={items as any}
          style={{ background: NAVY, borderInlineEnd: 0, padding: "12px 8px" }}
        />
      </Drawer>

      <Layout style={{ minWidth: 0 }}>
        {/* Responsive Header */}
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: isMobile ? "0 16px" : "0 24px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(11,31,58,0.08)",
            height: 68,
          }}
        >
          {/* Mobile hamburger or Desktop collapse toggle */}
          {isMobile ? (
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg text-[#0B1F3A] hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent"
              aria-label="Open Navigation Menu"
            >
              <MenuOutlined />
            </button>
          ) : (
            <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg text-[#0B1F3A] hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent"
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </Tooltip>
          )}

          {/* ── Global Search ── */}
          <div ref={searchRef} className="flex-1 max-w-xs sm:max-w-md relative">
            <Input
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              prefix={searchLoading ? <Spin size="small" /> : <SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder={isMobile ? "Search..." : "Search rooms, guests, bookings..."}
              style={{ borderRadius: 12, background: "#F7F4EE", border: "1px solid transparent", height: 38 }}
            />
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", borderRadius: 14, boxShadow: "0 12px 40px rgba(11,31,58,0.15)", zIndex: 1000, overflow: "hidden" }}
                >
                  {searchResults.map((r) => (
                    <div
                      key={r.key}
                      onClick={() => { navigate(r.path); setSearchOpen(false); setQuery(""); }}
                      style={{ padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid #f7f4ee", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f4ee")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: NAVY, fontSize: 13 }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.sub}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "#cbd5e1" }}>→</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ flex: 1 }} />

          {/* ── Notifications Bell ── */}
          <Dropdown
            trigger={["click"]}
            open={notifOpen}
            onOpenChange={setNotifOpen}
            dropdownRender={() => (
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(11,31,58,0.15)", width: 320, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #f0ebe0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: NAVY }}>Notifications</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{unread} pending</span>
                </div>
                {reminders.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>All caught up!</div>
                ) : (
                  reminders.map((r) => (
                    <div
                      key={r.roomReminderId}
                      onClick={() => { navigate("/reminders"); setNotifOpen(false); }}
                      style={{ padding: "11px 18px", borderBottom: "1px solid #f7f4ee", cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f4ee")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ marginTop: 2, color: r.isDone ? "#2E9E6E" : GOLD, fontSize: 15 }}>
                        {r.isDone ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: NAVY, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reminderSubject}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          {new Date(r.reminderStartingTime).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div
                  onClick={() => { navigate("/reminders"); setNotifOpen(false); }}
                  style={{ padding: "10px 18px", textAlign: "center", fontSize: 13, color: NAVY, fontWeight: 600, cursor: "pointer", borderTop: "1px solid #f0ebe0" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f4ee")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  View all reminders →
                </div>
              </div>
            )}
          >
            <div style={{ cursor: "pointer", padding: "4px 6px" }}>
              <Badge count={unread} color={GOLD}>
                <BellOutlined style={{ fontSize: 18, color: NAVY }} />
              </Badge>
            </div>
          </Dropdown>

          {/* User profile menu */}
          <Dropdown
            menu={{
              items: [
                { key: "p", label: "Profile & Settings" },
                { key: "h", label: "Help & Operations" },
                { type: "divider" },
                { key: "o", label: "Sign out", danger: true },
              ],
              onClick: ({ key }) => {
                if (key === "p") {
                  navigate("/settings");
                } else if (key === "o") {
                  signOut().then(() => navigate("/login"));
                }
              },
            }}
            placement="bottomRight"
          >
            <div className="flex items-center gap-2.5 cursor-pointer pl-1 py-1 rounded-xl hover:bg-slate-100/70 transition">
              <Avatar style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>
                {session?.user?.email ? session.user.email[0].toUpperCase() : "AD"}
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold text-[#0B1F3A]">
                  {session?.user?.user_metadata?.name || "Admin"}
                </div>
                <div className="text-[10px] text-slate-500">Aurora Palace</div>
              </div>
            </div>
          </Dropdown>
        </Header>

        {/* Responsive Content Area */}
        <Content
          style={{
            padding: isMobile ? "16px 12px" : "28px 24px",
            maxWidth: "100%",
            overflowX: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
}
