import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 24,
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 34,
            margin: 0,
            color: "#0B1F3A",
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>{subtitle}</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{extra}</div>
    </motion.div>
  );
}
