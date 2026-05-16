import { useEffect, useState } from "react";
import { Card, Col, Row, Tag, Timeline, Progress, Avatar } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  RiseOutlined,
  DollarOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { api } from "@/lib/mockApi";
import { GOLD, NAVY, NAVY_2, STATUS } from "@/lib/theme";
import type { Floor, Room, RoomEntry } from "@/lib/types";
import { RESERVATION_STATUS_LABELS } from "@/lib/types";

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [reservations, setReservations] = useState<RoomEntry[]>([]);

  useEffect(() => {
    api.room.list().then(setRooms);
    api.floor.list().then(setFloors);
    api.reservation.list().then(setReservations);
  }, []);

  const occupied = rooms.filter((r) => r.isOccupied).length;
  const available = rooms.length - occupied;
  const occRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
  const arrivalsToday = reservations.filter((r) => {
    const d = new Date(r.arrivalDate);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;
  const revenue = reservations.reduce((s, r) => s + r.totalOrder, 0);

  return (
    <div>
      <PageHeader
        title="Good morning, Aurora"
        subtitle={`${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · Live operations overview`}
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Occupancy"
            value={occRate}
            suffix="%"
            icon={<RiseOutlined />}
            gradient={`linear-gradient(135deg, ${NAVY} 0%, ${NAVY_2} 100%)`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Available Rooms"
            value={available}
            icon={<HomeOutlined />}
            gradient={`linear-gradient(135deg, #1f6f4a 0%, #2E9E6E 100%)`}
            delay={0.05}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Arrivals Today"
            value={arrivalsToday}
            icon={<TeamOutlined />}
            gradient={`linear-gradient(135deg, #6a4a1c 0%, ${GOLD} 100%)`}
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Revenue (MTD)"
            value={revenue.toLocaleString()}
            prefix={<DollarOutlined />}
            icon={<DollarOutlined />}
            gradient={`linear-gradient(135deg, #4b1f6b 0%, #7C5CFF 100%)`}
            delay={0.15}
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={16}>
          <Card
            className="cz-card-shadow"
            title={<span style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>Floor Occupancy</span>}
            style={{ border: 0 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {floors.map((f, i) => {
                const fr = rooms.filter((r) => r.floor === f.floorId);
                const occ = fr.filter((r) => r.isOccupied).length;
                const pct = fr.length ? Math.round((occ / fr.length) * 100) : 0;
                return (
                  <motion.div
                    key={f.floorId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <span style={{ fontWeight: 600, color: NAVY }}>{f.floorName}</span>
                        <span style={{ marginLeft: 10, color: "#94a3b8", fontSize: 12 }}>
                          Floor {f.floorNumber} · {fr.length} rooms
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ color: NAVY, fontWeight: 600 }}>
                        {occ}/{fr.length}
                      </span>
                    </div>
                    <Progress
                      percent={pct}
                      strokeColor={{ "0%": GOLD, "100%": NAVY }}
                      trailColor="#F0EBE0"
                      showInfo={false}
                      size={["100%", 10]}
                    />
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="cz-card-shadow"
            title={<span style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>Today's Arrivals</span>}
            style={{ border: 0 }}
          >
            <Timeline
              items={reservations.slice(0, 6).map((r) => ({
                color: r.reservationStatus === 1 ? STATUS.vacant : r.reservationStatus === 0 ? GOLD : "#94a3b8",
                dot: r.reservationStatus === 1 ? <CheckCircleFilled style={{ color: STATUS.vacant }} /> : undefined,
                children: (
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar size="small" style={{ background: NAVY, color: GOLD }}>
                        {r.customerName?.[0]}
                      </Avatar>
                      <span style={{ fontWeight: 600, color: NAVY }}>{r.customerName}</span>
                      <Tag color={r.reservationStatus === 1 ? "green" : r.reservationStatus === 0 ? "gold" : "default"}>
                        {RESERVATION_STATUS_LABELS[r.reservationStatus]}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {r.noNights} nights · {r.adultNo} adults · #{r.registrationNo}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
