import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Tag,
  message,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { CardGridSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { HouseKeeping, Room } from "@/lib/types";
import { GOLD, NAVY, STATUS } from "@/lib/theme";

const cols = [
  { id: 0, label: "Turnover Pending", color: STATUS.cleaning, icon: <ClockCircleOutlined /> },
  { id: 1, label: "Cleaning In Progress", color: STATUS.reserved, icon: <PlayCircleOutlined /> },
  { id: 2, label: "Inspected & Ready", color: STATUS.vacant, icon: <CheckCircleOutlined /> },
];

export default function Housekeeping() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<HouseKeeping[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    return api.houseKeeping.list().then((res) => {
      setList(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    api.room.list().then(setRooms);
  }, []);

  const move = async (item: HouseKeeping, dir: 1 | -1) => {
    const next = Math.min(2, Math.max(0, item.status + dir));
    if (next === item.status) return;
    const updated = {
      ...item,
      status: next,
      jobEndDate: next === 2 ? new Date().toISOString() : item.jobEndDate,
    };
    await api.houseKeeping.update(updated);
    message.success(`Task moved to ${cols[next].label}`);
    load();
  };

  const handleCreateTask = async () => {
    const v = await form.validateFields();
    const payload: HouseKeeping = {
      houseKeepingId: newId(),
      objectTypeId: newId(),
      status: 0,
      jobStartDate: new Date().toISOString(),
      ...ctx,
      ...v,
    };
    await api.houseKeeping.add(payload);
    message.success("Housekeeping task scheduled");
    setOpen(false);
    form.resetFields();
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Housekeeping Board"
          subtitle="Real-time room turnover, sanitation tracking, and maid assignments"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: NAVY, borderColor: NAVY }}
          className="rounded-xl h-9 font-medium shadow-sm w-full sm:w-auto"
          onClick={() => {
            form.resetFields();
            setOpen(true);
          }}
        >
          Assign Turnover
        </Button>
      </div>

      {loading ? (
        <CardGridSkeleton count={3} />
      ) : (
        <Row gutter={[16, 16]}>
          {cols.map((col) => {
            const items = list.filter((h) => h.status === col.id);
            return (
              <Col xs={24} md={12} lg={8} key={col.id}>
                <Card
                  className="cz-card-shadow border-0 rounded-2xl bg-white/90 backdrop-blur"
                  styles={{ body: { padding: "16px 14px", minHeight: 460 } }}
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: col.color, boxShadow: `0 0 8px ${col.color}` }}
                        />
                        <span className="font-serif text-lg font-bold text-[#0B1F3A]">
                          {col.label}
                        </span>
                      </div>
                      <Tag className="rounded-full px-2 py-0.5 text-xs font-semibold m-0">
                        {items.length}
                      </Tag>
                    </div>
                  }
                >
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      <ClearOutlined className="text-2xl mb-2 text-slate-300 block" />
                      No rooms in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    <AnimatePresence>
                      <div className="flex flex-col gap-3">
                        {items.map((h) => {
                          const room = rooms.find((r) => r.roomId === h.objectId);
                          return (
                            <motion.div
                              key={h.houseKeepingId}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileHover={{ y: -2 }}
                            >
                              <Card
                                style={{ border: `1px solid ${col.color}40`, background: "#fff" }}
                                styles={{ body: { padding: "14px" } }}
                                className="rounded-xl shadow-xs"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <div className="font-serif text-xl font-bold text-[#0B1F3A]">
                                      Room #{room?.number ?? "—"}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 leading-snug">
                                      {h.notes || "Turnover & linen refresh"}
                                    </div>
                                  </div>
                                  <Avatar
                                    size="small"
                                    style={{ background: NAVY, color: GOLD, fontWeight: 700 }}
                                  >
                                    {h.assignee?.[0] || "M"}
                                  </Avatar>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                  <Tag color="gold" className="text-xs font-medium m-0" style={{ color: NAVY }}>
                                    {h.assignee || "Unassigned"}
                                  </Tag>
                                  <div className="flex items-center gap-1.5">
                                    {h.status > 0 && (
                                      <Button
                                        size="small"
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() => move(h, -1)}
                                        className="text-xs h-7 rounded"
                                      />
                                    )}
                                    {h.status < 2 && (
                                      <Button
                                        size="small"
                                        type="primary"
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => move(h, 1)}
                                        style={{ background: NAVY, borderColor: NAVY }}
                                        className="text-xs h-7 rounded"
                                      />
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </AnimatePresence>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Schedule Turnover Drawer */}
      <Drawer
        title="Schedule Housekeeping Task"
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 460}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Button
            type="primary"
            onClick={handleCreateTask}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-lg"
          >
            Assign Task
          </Button>
        }
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item
            label="Target Room"
            name="objectId"
            rules={[{ required: true, message: "Please choose a room" }]}
          >
            <Select
              placeholder="Select Room"
              options={rooms.map((r) => ({
                value: r.roomId,
                label: `Room #${r.number} (${r.reservationStatus || "Vacant"})`,
              }))}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label="Housekeeper Assignee"
            name="assignee"
            rules={[{ required: true, message: "Please assign a staff member" }]}
          >
            <Select
              options={[
                { value: "Maria Lopez", label: "Maria Lopez (Head Housekeeper)" },
                { value: "Carlos Perez", label: "Carlos Perez" },
                { value: "Anya Kostova", label: "Anya Kostova" },
                { value: "Devon Taylor", label: "Devon Taylor" },
                { value: "Fatima Ramos", label: "Fatima Ramos" },
              ]}
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item label="Instructions / Checklist Notes" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Deep clean, VIP welcome fruit basket setup, extra towels..."
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
