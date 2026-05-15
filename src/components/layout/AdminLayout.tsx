import { useState } from "react";
import { Layout, Menu, Avatar, Badge, Dropdown, Input, Tooltip } from "antd";
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
} from "@ant-design/icons";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, NAVY } from "@/lib/theme";

const { Header, Sider, Content } = Layout;

const items = [
  { key: "/", icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  { type: "group" as const, label: "OPERATIONS", children: [
    { key: "/floors", icon: <AppstoreOutlined />, label: <Link to="/floors">Floors</Link> },
    { key: "/rooms", icon: <HomeOutlined />, label: <Link to="/rooms">Rooms</Link> },
    { key: "/rooms/layout", icon: <AppstoreOutlined />, label: <Link to="/rooms/layout">Floor Plan</Link> },
    { key: "/beds", icon: <KeyOutlined />, label: <Link to="/beds">Beds</Link> },
  ]},
  { type: "group" as const, label: "CATALOG", children: [
    { key: "/room-types", icon: <TagsOutlined />, label: <Link to="/room-types">Room Types</Link> },
    { key: "/room-features", icon: <StarOutlined />, label: <Link to="/room-features">Features</Link> },
    { key: "/room-products", icon: <ShoppingOutlined />, label: <Link to="/room-products">Products</Link> },
    { key: "/room-rates", icon: <DollarOutlined />, label: <Link to="/room-rates">Rates</Link> },
    { key: "/seasons", icon: <CloudOutlined />, label: <Link to="/seasons">Seasons</Link> },
  ]},
  { type: "group" as const, label: "GUEST FLOW", children: [
    { key: "/reservations", icon: <CalendarOutlined />, label: <Link to="/reservations">Reservations</Link> },
    { key: "/reservations/dnr", icon: <StopOutlined />, label: <Link to="/reservations/dnr">DNR List</Link> },
    { key: "/housekeeping", icon: <ClearOutlined />, label: <Link to="/housekeeping">Housekeeping</Link> },
    { key: "/reminders", icon: <BellOutlined />, label: <Link to="/reminders">Reminders</Link> },
  ]},
  { type: "group" as const, label: "SYSTEM", children: [
    { key: "/settings", icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
  ]},
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={260}
        collapsedWidth={80}
        collapsed={collapsed}
        theme="dark"
        style={{
          background: NAVY,
          borderRight: `1px solid rgba(255,255,255,0.06)`,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: collapsed ? "0 24px" : "0 22px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${GOLD}, #fff8e1)`,
              display: "grid", placeItems: "center",
              color: NAVY, fontFamily: "'Fraunces', serif", fontWeight: 800, fontSize: 20,
              boxShadow: "0 6px 20px rgba(201,166,107,0.35)",
            }}
          >C</motion.div>
          {!collapsed && (
            <div style={{ color: "#fff", lineHeight: 1.1 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, letterSpacing: 0.4 }}>Cizaro</div>
              <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 2 }}>HOSPITALITY</div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[loc.pathname]}
          items={items as any}
          style={{ background: NAVY, borderInlineEnd: 0, padding: "12px 10px" }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 24px",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(11,31,58,0.08)",
          }}
        >
          <Tooltip title={collapsed ? "Expand" : "Collapse"}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{ border: 0, background: "transparent", fontSize: 18, cursor: "pointer", color: NAVY }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </Tooltip>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search rooms, guests, reservations…"
            style={{ maxWidth: 420, borderRadius: 12, background: "#F7F4EE", border: "1px solid transparent" }}
          />
          <div style={{ flex: 1 }} />
          <Badge count={3} color={GOLD}>
            <BellOutlined style={{ fontSize: 18, color: NAVY }} />
          </Badge>
          <Dropdown
            menu={{ items: [{ key: "p", label: "Profile" }, { key: "s", label: "Settings" }, { key: "o", label: "Sign out" }] }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <Avatar style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>AD</Avatar>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 600, color: NAVY }}>Admin</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Aurora Branch</div>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 28 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
}
