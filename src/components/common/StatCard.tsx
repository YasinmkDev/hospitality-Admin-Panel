import { Card, Statistic } from "antd";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  suffix,
  prefix,
  icon,
  gradient,
  delay = 0,
}: {
  title: string;
  value: number | string;
  suffix?: ReactNode;
  prefix?: ReactNode;
  icon?: ReactNode;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 140, damping: 18 }}
      whileHover={{ y: -4 }}
    >
      <Card
        styles={{ body: { padding: 22 } }}
        style={{
          background: gradient,
          border: 0,
          color: "#fff",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 18px 40px -20px rgba(11,31,58,0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ opacity: 0.85, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>
              {title}
            </div>
            <div style={{ marginTop: 8 }}>
              <Statistic
                value={value}
                prefix={prefix}
                suffix={suffix}
                valueStyle={{ color: "#fff", fontSize: 32, fontWeight: 700, fontFamily: "'Fraunces', serif" }}
              />
            </div>
          </div>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(255,255,255,0.18)",
              display: "grid", placeItems: "center",
              color: "#fff", fontSize: 20,
              backdropFilter: "blur(6px)",
            }}
          >
            {icon}
          </div>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute", right: -40, bottom: -40,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
      </Card>
    </motion.div>
  );
}
