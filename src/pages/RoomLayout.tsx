import { useEffect, useState } from "react";
import { Card, Col, Row, Select, Space, Tag, Tooltip } from "antd";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { api } from "@/lib/mockApi";
import { GOLD, NAVY, STATUS, numberToHex } from "@/lib/theme";
import type { Floor, Room, RoomType } from "@/lib/types";

export default function RoomLayout() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [floorId, setFloorId] = useState<string>();

  useEffect(() => {
    api.room.list().then(setRooms);
    api.floor.list().then((f) => { setFloors(f); setFloorId(f[0]?.floorId); });
    api.roomType.list().then(setTypes);
  }, []);

  const fr = rooms.filter((r) => r.floor === floorId);

  return (
    <div>
      <PageHeader
        title="Floor Plan"
        subtitle="Live spatial view of your property"
        extra={
          <Select
            value={floorId} onChange={setFloorId} style={{ width: 220 }}
            options={floors.map(f => ({ value: f.floorId, label: `${f.floorName} · F${f.floorNumber}` }))}
          />
        }
      />

      <Card className="cz-card-shadow cz-grain" style={{ border: 0, background: "#fff" }}>
        <Space style={{ marginBottom: 16 }} wrap>
          {[
            ["Available", STATUS.vacant], ["Occupied", STATUS.occupied],
            ["Cleaning", STATUS.cleaning], ["Reserved", STATUS.reserved],
          ].map(([l, c]) => (
            <Tag key={l as string} color={c as string} style={{ color: "#fff", border: 0 }}>● {l}</Tag>
          ))}
        </Space>
        <Row gutter={[14, 14]}>
          {fr.map((r, i) => {
            const t = types.find(t => t.roomTypeId === r.roomTypeId);
            const sCol = r.reservationStatus === "Occupied" ? STATUS.occupied
              : r.reservationStatus === "Cleaning" ? STATUS.cleaning
              : r.reservationStatus === "Reserved" ? STATUS.reserved : STATUS.vacant;
            return (
              <Col key={r.roomId} xs={8} sm={6} md={4} lg={3}>
                <Tooltip
                  title={<div>
                    <div style={{ fontWeight: 600 }}>Room {r.number}</div>
                    <div>{t?.roomType} · {r.bedcount} beds</div>
                    <div>{r.reservationStatus}</div>
                  </div>}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015 }}
                    whileHover={{ y: -3, scale: 1.04 }}
                    style={{
                      borderRadius: 14,
                      padding: 14,
                      background: `linear-gradient(135deg, ${numberToHex(t?.color)}, ${NAVY})`,
                      color: "#fff",
                      cursor: "pointer",
                      position: "relative",
                      minHeight: 86,
                      boxShadow: "0 8px 20px -12px rgba(11,31,58,0.5)",
                    }}
                  >
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700 }}>{r.number}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{t?.roomType}</div>
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      width: 10, height: 10, borderRadius: 99,
                      background: sCol, boxShadow: `0 0 10px ${sCol}`,
                    }} />
                  </motion.div>
                </Tooltip>
              </Col>
            );
          })}
        </Row>
      </Card>
    </div>
  );
}
