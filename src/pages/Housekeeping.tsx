import { useEffect, useState } from "react";
import { Avatar, Button, Card, Col, Row, Tag, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { api } from "@/lib/mockApi";
import type { HouseKeeping, Room } from "@/lib/types";
import { GOLD, NAVY, STATUS } from "@/lib/theme";

const cols = [
  { id: 0, label: "Pending", color: STATUS.cleaning, icon: <ClockCircleOutlined /> },
  { id: 1, label: "In Progress", color: STATUS.reserved, icon: <PlayCircleOutlined /> },
  { id: 2, label: "Done", color: STATUS.vacant, icon: <CheckCircleOutlined /> },
];

export default function Housekeeping() {
  const [list, setList] = useState<HouseKeeping[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const load = () => { api.houseKeeping.list().then(setList); };
  useEffect(() => { load(); api.room.list().then(setRooms); }, []);

  const move = async (item: HouseKeeping, dir: 1 | -1) => {
    const next = Math.min(2, Math.max(0, item.status + dir));
    if (next === item.status) return;
    const updated = { ...item, status: next, jobEndDate: next === 2 ? new Date().toISOString() : item.jobEndDate };
    await api.houseKeeping.update(updated);
    message.success("Status updated");
    load();
  };

  return (
    <div>
      <PageHeader title="Housekeeping" subtitle="Live cleaning board across all rooms" />
      <Row gutter={[16, 16]}>
        {cols.map((col) => {
          const items = list.filter(h => h.status === col.id);
          return (
            <Col xs={24} lg={8} key={col.id}>
              <Card
                className="cz-card-shadow"
                style={{ border: 0, background: "rgba(255,255,255,0.7)" }}
                styles={{ body: { padding: 16, minHeight: 460 } }}
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 99, background: col.color, boxShadow: `0 0 10px ${col.color}` }} />
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: NAVY }}>{col.label}</span>
                    <Tag>{items.length}</Tag>
                  </div>
                }
              >
                <AnimatePresence>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {items.map((h) => {
                      const room = rooms.find(r => r.roomId === h.objectId);
                      return (
                        <motion.div
                          key={h.houseKeepingId}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ y: -2 }}
                        >
                          <Card style={{ border: `1px solid ${col.color}33`, background: "#fff" }} styles={{ body: { padding: 14 } }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: NAVY }}>
                                  Room {room?.number ?? "—"}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{h.notes}</div>
                              </div>
                              <Avatar size="small" style={{ background: NAVY, color: GOLD }}>{h.assignee?.[0]}</Avatar>
                            </div>
                            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Tag color="gold" style={{ color: NAVY }}>{h.assignee}</Tag>
                              <div>
                                {h.status > 0 && <Button size="small" onClick={() => move(h, -1)}>←</Button>}
                                {h.status < 2 && <Button size="small" type="primary" style={{ marginLeft: 6 }} onClick={() => move(h, 1)}>→</Button>}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
