import { useEffect, useState } from "react";
import { Card, Col, Row, Select, Space, Tag, Tooltip, Modal, Badge } from "antd";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { FloorPlanSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api } from "@/lib/mockApi";
import { GOLD, NAVY, STATUS, numberToHex } from "@/lib/theme";
import type { Floor, Room, RoomType } from "@/lib/types";

export default function RoomLayout() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [floorId, setFloorId] = useState<string>();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.room.list(), api.floor.list(), api.roomType.list()])
      .then(([r, f, t]) => {
        if (mounted) {
          setRooms(r);
          setFloors(f);
          setTypes(t);
          if (f.length > 0) setFloorId(f[0].floorId);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const fr = rooms.filter((r) => r.floor === floorId);
  const activeFloor = floors.find((f) => f.floorId === floorId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Floor Plan Layout"
          subtitle="Interactive visual matrix of room occupancy and statuses"
        />
        <div className="w-full sm:w-auto">
          <Select
            value={floorId}
            onChange={setFloorId}
            className="w-full sm:w-60"
            options={floors.map((f) => ({
              value: f.floorId,
              label: `${f.floorName} (Level ${f.floorNumber})`,
            }))}
          />
        </div>
      </div>

      {loading ? (
        <FloorPlanSkeleton />
      ) : floors.length === 0 ? (
        <EmptyState
          title="No building levels found"
          description="Create at least one floor level to inspect floor plans."
        />
      ) : (
        <Card className="cz-card-shadow cz-grain" style={{ border: 0, background: "#fff" }}>
          {/* Status Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Status Legend:</span>
              {[
                ["Available", STATUS.vacant],
                ["Occupied", STATUS.occupied],
                ["Cleaning", STATUS.cleaning],
                ["Reserved", STATUS.reserved],
              ].map(([l, c]) => (
                <Tag
                  key={l as string}
                  color={c as string}
                  className="text-xs font-medium rounded-full px-2.5 py-0.5 border-0 text-white"
                >
                  ● {l}
                </Tag>
              ))}
            </div>

            <div className="text-xs text-slate-400">
              Showing {fr.length} rooms on {activeFloor?.floorName || "selected level"}
            </div>
          </div>

          {fr.length === 0 ? (
            <EmptyState
              title={`No rooms assigned to ${activeFloor?.floorName}`}
              description="Add rooms to this level from the Room Directory."
            />
          ) : (
            <Row gutter={[12, 12]}>
              {fr.map((r, i) => {
                const t = types.find((tp) => tp.roomTypeId === r.roomTypeId);
                const sCol =
                  r.reservationStatus === "Occupied"
                    ? STATUS.occupied
                    : r.reservationStatus === "Cleaning"
                    ? STATUS.cleaning
                    : r.reservationStatus === "Reserved"
                    ? STATUS.reserved
                    : STATUS.vacant;

                return (
                  <Col key={r.roomId} xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Tooltip
                      title={
                        <div className="p-1">
                          <div className="font-bold text-sm">Room #{r.number}</div>
                          <div className="text-xs opacity-90">{t?.roomType} · {r.bedcount} Beds</div>
                          <div className="text-xs mt-1">Status: {r.reservationStatus || "Available"}</div>
                        </div>
                      }
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.015 }}
                        whileHover={{ y: -3, scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRoom(r)}
                        className="rounded-2xl p-3.5 text-white cursor-pointer relative min-h-[92px] shadow-sm select-none flex flex-col justify-between"
                        style={{
                          background: `linear-gradient(135deg, ${numberToHex(t?.color)}, ${NAVY})`,
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className="font-serif text-2xl font-bold tracking-tight"
                          >
                            {r.number}
                          </div>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: sCol,
                              boxShadow: `0 0 8px ${sCol}`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] opacity-85">
                          <span className="truncate max-w-[80%]">{t?.roomType}</span>
                          <span>{r.bedcount}B</span>
                        </div>
                      </motion.div>
                    </Tooltip>
                  </Col>
                );
              })}
            </Row>
          )}
        </Card>
      )}

      {/* Quick Room Modal */}
      <Modal
        title={selectedRoom ? `Room #${selectedRoom.number} Overview` : "Room"}
        open={!!selectedRoom}
        onCancel={() => setSelectedRoom(null)}
        footer={null}
        width={420}
      >
        {selectedRoom && (
          <div className="py-2 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Current Status</div>
                <div className="font-bold text-[#0B1F3A] text-lg">
                  {selectedRoom.reservationStatus || "Available"}
                </div>
              </div>
              <Tag
                color={
                  selectedRoom.reservationStatus === "Occupied"
                    ? "red"
                    : selectedRoom.reservationStatus === "Cleaning"
                    ? "orange"
                    : "green"
                }
                className="text-xs font-semibold px-2.5 py-0.5"
              >
                {selectedRoom.reservationStatus || "Available"}
              </Tag>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800">
                  {types.find((t) => t.roomTypeId === selectedRoom.roomTypeId)?.roomType || "Standard"}
                </span>
              </div>
              <div className="p-2.5 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block">Total Beds</span>
                <span className="font-semibold text-slate-800">{selectedRoom.bedcount} Beds</span>
              </div>
              <div className="p-2.5 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block">Capacity</span>
                <span className="font-semibold text-slate-800">
                  {selectedRoom.adultsNo} Adults, {selectedRoom.childNo} Children
                </span>
              </div>
              <div className="p-2.5 border border-slate-100 rounded-lg">
                <span className="text-slate-400 block">Extension</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {selectedRoom.phoneExtension || "—"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
