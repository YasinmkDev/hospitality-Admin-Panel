import { useEffect, useState } from "react";
import { Card, Col, Row, Tag, Timeline, Progress, Avatar, Button } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  RiseOutlined,
  DollarOutlined,
  CheckCircleFilled,
  PlusOutlined,
  CalendarOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatCardsSkeleton, Shimmer, EmptyState } from "@/components/common/SkeletonLoaders";
import { api } from "@/lib/mockApi";
import { GOLD, NAVY, NAVY_2, STATUS } from "@/lib/theme";
import type { Floor, Room, RoomEntry } from "@/lib/types";
import { RESERVATION_STATUS_LABELS } from "@/lib/types";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [reservations, setReservations] = useState<RoomEntry[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.room.list(), api.floor.list(), api.reservation.list()])
      .then(([r, f, res]) => {
        if (mounted) {
          setRooms(r);
          setFloors(f);
          setReservations(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Dashboard data load failed:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const occupied = rooms.filter((r) => r.isOccupied).length;
  const available = rooms.length - occupied;
  const occRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
  const arrivalsToday = reservations.filter((r) => {
    const d = new Date(r.arrivalDate);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;
  const revenue = reservations.reduce((s, r) => s + (r.totalOrder || 0), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Executive Operations Hub"
          subtitle={`${new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })} · Live Aurora Palace command feed`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/reservations">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: NAVY, borderColor: NAVY }}
              className="rounded-xl h-9 font-medium shadow-sm"
            >
              New Booking
            </Button>
          </Link>
          <Link to="/rooms">
            <Button
              icon={<HomeOutlined />}
              className="rounded-xl h-9 font-medium border-slate-300"
            >
              Room Matrix
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <>
          <StatCardsSkeleton count={4} />
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={16}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <Shimmer className="h-6 w-44" />
                <Shimmer className="h-4 w-60" />
                <div className="space-y-4 pt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Shimmer className="h-4 w-32" />
                        <Shimmer className="h-4 w-12" />
                      </div>
                      <Shimmer className="h-2.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <Shimmer className="h-6 w-36" />
                <div className="space-y-4 pt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <Shimmer className="w-8 h-8 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Shimmer className="h-4 w-28" />
                        <Shimmer className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Row gutter={[16, 16]}>
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
                gradient="linear-gradient(135deg, #1f6f4a 0%, #2E9E6E 100%)"
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
                gradient="linear-gradient(135deg, #4b1f6b 0%, #7C5CFF 100%)"
                delay={0.15}
              />
            </Col>
          </Row>

          <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
            {/* Floor Occupancy Progress */}
            <Col xs={24} lg={15} xl={16}>
              <Card
                className="cz-card-shadow"
                title={
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>
                      Floor-by-Floor Occupancy
                    </span>
                    <span className="text-xs font-sans text-slate-500 font-normal">
                      {floors.length} Floors Configured
                    </span>
                  </div>
                }
                style={{ border: 0 }}
              >
                {floors.length === 0 ? (
                  <EmptyState
                    title="No floors registered"
                    description="Configure your building floors to monitor occupancy."
                    actionText="Add Floors"
                    onAction={() => window.location.assign("/floors")}
                  />
                ) : (
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
                          transition={{ delay: i * 0.05 }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span style={{ fontWeight: 600, color: NAVY }}>{f.floorName}</span>
                              <span className="text-slate-400 text-xs">
                                Floor {f.floorNumber} · {fr.length} total rooms
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-500">
                                {pct}% full
                              </span>
                              <span
                                className="tabular-nums text-xs px-2 py-0.5 rounded-md font-semibold"
                                style={{ background: "#F7F4EE", color: NAVY }}
                              >
                                {occ} / {fr.length} Occupied
                              </span>
                            </div>
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
                )}
              </Card>
            </Col>

            {/* Today's Arrivals Timeline */}
            <Col xs={24} lg={9} xl={8}>
              <Card
                className="cz-card-shadow"
                title={
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>
                      Upcoming Arrivals
                    </span>
                    <Link
                      to="/reservations"
                      className="text-xs text-[#C9A66B] hover:text-[#b38f55] font-semibold"
                    >
                      View All &rarr;
                    </Link>
                  </div>
                }
                style={{ border: 0 }}
              >
                {reservations.length === 0 ? (
                  <EmptyState
                    title="No upcoming arrivals"
                    description="New guest reservations will display in this activity stream."
                  />
                ) : (
                  <Timeline
                    className="mt-2"
                    items={reservations.slice(0, 5).map((r) => ({
                      color:
                        r.reservationStatus === 1
                          ? STATUS.vacant
                          : r.reservationStatus === 0
                          ? GOLD
                          : "#94a3b8",
                      dot:
                        r.reservationStatus === 1 ? (
                          <CheckCircleFilled style={{ color: STATUS.vacant }} />
                        ) : undefined,
                      children: (
                        <div className="pb-1">
                          <div className="flex flex-wrap gap-2 items-center">
                            <Avatar
                              size="small"
                              style={{ background: NAVY, color: GOLD, fontWeight: 700 }}
                            >
                              {r.customerName?.[0] || "G"}
                            </Avatar>
                            <span style={{ fontWeight: 600, color: NAVY, fontSize: 13 }}>
                              {r.customerName || "Valued Guest"}
                            </span>
                            <Tag
                              color={
                                r.reservationStatus === 1
                                  ? "green"
                                  : r.reservationStatus === 0
                                  ? "gold"
                                  : "default"
                              }
                              className="text-[11px] font-medium"
                            >
                              {RESERVATION_STATUS_LABELS[r.reservationStatus] || "Reserved"}
                            </Tag>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {r.noNights} nights · {r.adultNo} adults · #{r.registrationNo}
                          </div>
                        </div>
                      ),
                    }))}
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* Quick Operations Navigation Row */}
          <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-[#0B1F3A]">Quick Access:</span>
              <Link to="/housekeeping" className="hover:text-[#C9A66B] flex items-center gap-1.5">
                <ClearOutlined /> Housekeeping Tasks
              </Link>
              <Link to="/seasons" className="hover:text-[#C9A66B] flex items-center gap-1.5">
                <CalendarOutlined /> Seasonal Rates
              </Link>
              <Link to="/rooms/layout" className="hover:text-[#C9A66B] flex items-center gap-1.5">
                <HomeOutlined /> Floor Map
              </Link>
            </div>
            <span className="text-[11px] text-slate-400">Aurora Palace Operations Engine</span>
          </div>
        </>
      )}
    </div>
  );
}
