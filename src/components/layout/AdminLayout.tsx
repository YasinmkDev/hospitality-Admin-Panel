import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Badge, Dropdown, Tooltip, Drawer } from "antd";
import {
  DashboardOutlined, AppstoreOutlined, HomeOutlined, KeyOutlined,
  TagsOutlined, StarOutlined, ShoppingOutlined, DollarOutlined,
  CloudOutlined, CalendarOutlined, ClearOutlined, BellOutlined,
  SettingOutlined, SearchOutlined, StopOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, MenuOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, NAVY } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/mockApi";
import type { RoomReminder } from "@/lib/types";

const { Header, Sider, Content } = Layout;

// Flat list of all nav items for search filtering
const ALL_NAV_ITEMS = [
  { key: "/",                  icon: <DashboardOutlined />,  label: "Dashboard",    group: "" },
  { key: "/floors",            icon: <AppstoreOutlined />,   label: "Floors",       group: "OPERATIONS" },
  { key: "/rooms",             icon: <HomeOutlined />,       label: "Rooms",        group: "OPERATIONS" },
  { key: "/rooms/layout",      icon: <AppstoreOutlined />,   label: "Floor Plan",   group: "OPERATIONS" },
  { key: "/beds",              icon: <KeyOutlined />,        label: "Beds",         group: "OPERATIONS" },
  { key: "/room-types",        icon: <TagsOutlined />,       label: "Room Types",   group: "CATALOG" },
  { key: "/room-features",     icon: <StarOutlined />,       label: "Features",     group: "CATALOG" },
  { key: "/room-products",     icon: <ShoppingOutlined />,   label: "Products",     group: "CATALOG" },
  { key: "/room-rates",        icon: <DollarOutlined />,     label: "Rates",        group: "CATALOG" },
  { key: "/seasons",           icon: <CloudOutlined />,      label: "Seasons",      group: "CATALOG" },
  { key: "/reservations",      icon: <CalendarOutlined />,   label: "Reservations", group: "GUEST FLOW" },
  { key: "/reservations/dnr",  icon: <StopOutlined />,       label: "DNR List",     group: "GUEST FLOW" },
  { key: "/housekeeping",      icon: <ClearOutlined />,      label: "Housekeeping", group: "GUEST FLOW" },
  { key: "/reminders",         icon: <BellOutlined />,       label: "Reminders",    group: "GUEST FLOW" },
  { key: "/settings",          icon: <SettingOutlined />,    label: "Settings",     group: "SYSTEM" },
];

// Build grouped Ant Menu items from a filtered flat list
function buildMenuItems(items: typeof ALL_NAV_ITEMS, collapsed = false) {
  const groups: Record<string, typeof ALL_NAV_ITEMS> = {};
  const ungrouped: typeof ALL_NAV_ITEMS = [];

  items.forEach((item) => {
    if (!item.group) { ungrouped.push(item); return; }
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  const result: object[] = ungrouped.map((i) => ({
    key: i.key, icon: i.icon, label: <Link to={i.key}>{i.label}</Link>,
  }));

  Object.entries(groups).forEach(([group, children]) => {
    result.push({
      type: "group",
      label: collapsed ? null : <span style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.45 }}>{group}</span>,
      children: children.map((i) => ({
        key: i.key, icon: i.icon, label: <Link to={i.key}>{i.label}</Link>,
      })),
    });
  });

  return result;
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState("");

  const loc = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuth();

  // ── Notifications ─────────────────────────────────────────────────────
  const [reminders, setReminders] = useState<RoomReminder[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    api.reminder.list().then((raw) => {
      const typed = raw as unknown as RoomReminder[];
      setReminders(typed.filter((x) => !x.isDone).slice(0, 8));
    });
  }, []);

  const unread = reminders.length;

  // ── Resize ────────────────────────────────────────────────────────────
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

  useEffect(() => { setMobileDrawerOpen(false); }, [loc.pathname]);

  // ── Sidebar search filter ─────────────────────────────────────────────
  const filteredItems = sidebarQuery.trim()
    ? ALL_NAV_ITEMS.filter((i) =>
        i.label.toLowerCase().includes(sidebarQuery.toLowerCase()) ||
        i.group.toLowerCase().includes(sidebarQuery.toLowerCase())
      )
    : ALL_NAV_ITEMS;

  const menuItems = buildMenuItems(filteredItems, collapsed);

  // ── Sidebar content ───────────────────────────────────────────────────
  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Brand */}
      <div style={{
        height: 68, display: "flex", alignItems: "center", gap: 12,
        padding: collapsed && !isMobile ? "0 20px" : "0 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
      }}>
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${GOLD}, #fff8e1)`,
            display: "grid", placeItems: "center",
            color: NAVY, fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 18,
            boxShadow: "0 6px 20px rgba(201,166,107,0.35)",
          }}
        >H</motion.div>
        {(!collapsed || isMobile) && (
          <div style={{ color: "#fff", lineHeight: 1.1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, letterSpacing: 0.4, whiteSpace: "nowrap" }}>
              HMS
            </div>
            <div style={{ fontSize: 10, opacity: 0.55, letterSpacing: 2 }}>HOSPITALITY SUITE</div>
          </div>
        )}
      </div>

      {/* Search — hidden when collapsed on desktop */}
      {(!collapsed || isMobile) && (
        <div style={{ padding: "10px 12px 4px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.08)", borderRadius: 10,
            padding: "7px 12px", border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <SearchOutlined style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, flexShrink: 0 }} />
            <input
              value={sidebarQuery}
              onChange={(e) => setSidebarQuery(e.target.value)}
              placeholder="Filter navigation..."
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#fff", fontSize: 12, width: "100%",
              }}
            />
            {sidebarQuery && (
              <button
                onClick={() => setSidebarQuery("")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0, fontSize: 11, lineHeight: 1 }}
              >✕</button>
            )}
          </div>
        </div>
      )}

      {/* No results state */}
      {sidebarQuery && filteredItems.length === 0 ? (
        <div style={{ padding: "20px 16px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          No pages match "{sidebarQuery}"
        </div>
      ) : (
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[loc.pathname]}
          items={menuItems as any}
          style={{ background: NAVY, borderInlineEnd: 0, padding: "8px 8px", flex: 1, overflowY: "auto", minHeight: 0 }}
        />
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          width={260} collapsedWidth={76} collapsed={collapsed} theme="dark"
          style={{
            background: NAVY, borderRight: "1px solid rgba(255,255,255,0.06)",
            position: "sticky", top: 0, height: "100vh",
            display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 20, overflowY: "auto",
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left" onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen} closable={false}
        styles={{ body: { padding: 0, background: NAVY, display: "flex", flexDirection: "column" } }}
        width={280}
      >
        {sidebarContent}
      </Drawer>

      <Layout style={{ minWidth: 0 }}>
        <Header style={{
          position: "sticky", top: 0, zIndex: 10,
          display: "flex", alignItems: "center", gap: 12,
          padding: isMobile ? "0 16px" : "0 24px",
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(11,31,58,0.08)", height: 68,
        }}>
          {/* Collapse / hamburger */}
          {isMobile ? (
            <button onClick={() => setMobileDrawerOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg text-[#0B1F3A] hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent"
              aria-label="Open Navigation">
              <MenuOutlined />
            </button>
          ) : (
            <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <button onClick={() => setCollapsed((c) => !c)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg text-[#0B1F3A] hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent">
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </Tooltip>
          )}

          <div style={{ flex: 1 }} />

          {/* Notifications Bell */}
          <Dropdown
            trigger={["click"]} open={notifOpen} onOpenChange={setNotifOpen}
            dropdownRender={() => (
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(11,31,58,0.15)", width: 320, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #f0ebe0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: NAVY }}>Notifications</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{unread} pending</span>
                </div>
                {reminders.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>All caught up!</div>
                ) : reminders.map((r) => (
                  <div key={r.roomReminderId}
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
                ))}
                <div onClick={() => { navigate("/reminders"); setNotifOpen(false); }}
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

          {/* User Menu */}
          <Dropdown
            menu={{
              items: [
                { key: "p", label: "Profile & Settings" },
                { key: "h", label: "Help & Operations" },
                { type: "divider" },
                { key: "o", label: "Sign out", danger: true },
              ],
              onClick: ({ key }) => {
                if (key === "p") navigate("/settings");
                if (key === "o") signOut().then(() => navigate("/login"));
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
                  {session?.user?.user_metadata?.name || session?.user?.email?.split("@")[0] || "Admin"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {session?.user?.email === "guest@hotel-demo.com" ? "Guest Access" : "Operations"}
                </div>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: isMobile ? "16px 12px" : "28px 24px", maxWidth: "100%", overflowX: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
}
