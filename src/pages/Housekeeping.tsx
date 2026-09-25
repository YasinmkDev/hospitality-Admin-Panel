import { useEffect, useState, useCallback } from "react";
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
  Table,
  Space,
  Segmented,
  Popconfirm,
  Pagination,
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
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { CardGridSkeleton, TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
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
  const [view, setView] = useState<"Board" | "Table">("Board");
  const [list, setList] = useState<HouseKeeping[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HouseKeeping | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (filterStatus !== undefined) filters.status = filterStatus;

      const res = await api.houseKeeping.paginate({
        page,
        pageSize,
        search,
        searchFields: ["notes", "assignee"],
        filters,
        sortBy: "jobStartDate",
        sortOrder: "desc",
      });
      setList(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed loading housekeeping:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.room.list().then(setRooms);
  }, []);

  const move = async (item: HouseKeeping, dir: 1 | -1) => {
    const next = Math.min(2, Math.max(0, item.status + dir));
    if (next === item.status) return;
    const updated: HouseKeeping = {
      ...item,
      status: next,
      jobEndDate: next === 2 ? new Date().toISOString() : item.jobEndDate,
    };
    await api.houseKeeping.update(updated);

    // Also sync room status if ready or cleaning
    const room = rooms.find((r) => r.roomId === item.objectId);
    if (room) {
      const nextRoomStatus = next === 2 ? "Available" : next === 1 ? "Cleaning" : "Cleaning";
      await api.room.update({ ...room, reservationStatus: nextRoomStatus });
    }

    message.success(`Task moved to ${cols[next].label}`);
    load();
  };

  const handleCreateTask = async () => {
    const v = await createForm.validateFields();
    const payload: HouseKeeping = {
      houseKeepingId: newId(),
      objectTypeId: newId(),
      status: v.status !== undefined ? v.status : 0,
      jobStartDate: new Date().toISOString(),
      ...ctx,
      ...v,
    };
    await api.houseKeeping.add(payload);

    // Sync room reservation status to Cleaning
    const room = rooms.find((r) => r.roomId === v.objectId);
    if (room) {
      await api.room.update({ ...room, reservationStatus: "Cleaning" });
    }

    message.success("Housekeeping task scheduled");
    setCreateOpen(false);
    createForm.resetFields();
    load();
  };

  const handleOpenEdit = (task: HouseKeeping) => {
    setEditingTask(task);
    editForm.setFieldsValue({
      objectId: task.objectId,
      assignee: task.assignee,
      status: task.status,
      notes: task.notes,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;
    const v = await editForm.validateFields();
    const updated: HouseKeeping = {
      ...editingTask,
      ...v,
      jobEndDate: v.status === 2 ? new Date().toISOString() : editingTask.jobEndDate,
    };
    await api.houseKeeping.update(updated);

    // If marked ready, set room to Available
    if (v.status === 2) {
      const room = rooms.find((r) => r.roomId === updated.objectId);
      if (room) {
        await api.room.update({ ...room, reservationStatus: "Available" });
      }
    }

    message.success("Housekeeping assignment updated");
    setEditOpen(false);
    setEditingTask(null);
    editForm.resetFields();
    load();
  };

  const handleDelete = async (id: string) => {
    await api.houseKeeping.remove(id);
    message.success("Housekeeping task removed");
    load();
  };

  const tableColumns = [
    {
      title: "Room",
      dataIndex: "objectId",
      key: "room",
      render: (id: string) => {
        const r = rooms.find((rm) => rm.roomId === id);
        return (
          <div className="font-semibold text-[#0B1F3A]">
            Room #{r ? r.number : "—"}
          </div>
        );
      },
    },
    {
      title: "Assigned Staff",
      dataIndex: "assignee",
      key: "assignee",
      render: (a: string) => (
        <Space size="small">
          <Avatar size="small" style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>
            {a?.[0] || "H"}
          </Avatar>
          <span className="font-medium text-slate-700">{a || "Unassigned"}</span>
        </Space>
      ),
    },
    {
      title: "Sanitation Stage",
      dataIndex: "status",
      key: "status",
      render: (s: number) => {
        const c = cols[s] || cols[0];
        return (
          <Tag color={c.color} className="text-xs font-medium border-0 text-white">
            {c.label}
          </Tag>
        );
      },
    },
    {
      title: "Scheduled Date",
      dataIndex: "jobStartDate",
      key: "jobStartDate",
      render: (d: string) => (
        <span className="text-xs text-slate-500">
          {d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
        </span>
      ),
    },
    {
      title: "Notes & Instructions",
      dataIndex: "notes",
      key: "notes",
      render: (n: string) => (
        <span className="text-xs text-slate-600 line-clamp-1">{n || "Standard turnover & linens"}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 170,
      render: (_: unknown, task: HouseKeeping) => (
        <Space size="small">
          {task.status > 0 && (
            <Button
              size="small"
              icon={<ArrowLeftOutlined />}
              onClick={() => move(task, -1)}
              title="Move backward"
            />
          )}
          {task.status < 2 && (
            <Button
              size="small"
              type="primary"
              style={{ background: NAVY, borderColor: NAVY }}
              icon={<ArrowRightOutlined />}
              onClick={() => move(task, 1)}
              title="Move forward"
            />
          )}
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(task)} />
          <Popconfirm
            title="Delete turnover task?"
            onConfirm={() => handleDelete(task.houseKeepingId)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Housekeeping Board"
          subtitle="Real-time room turnover, sanitation tracking, and maid assignments"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            options={["Board", "Table"]}
            value={view}
            onChange={(v) => setView(v as "Board" | "Table")}
            className="p-1 bg-white border border-slate-200"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-xl h-9 font-medium shadow-sm w-full sm:w-auto"
            onClick={() => {
              createForm.resetFields();
              createForm.setFieldsValue({ status: 0, assignee: "Housekeeping Team" });
              setCreateOpen(true);
            }}
          >
            Assign Turnover
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="cz-card-shadow mb-5" style={{ border: 0 }} styles={{ body: { padding: "14px 18px" } }}>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search notes or maid..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            className="w-48 sm:w-56 text-xs rounded-lg"
          />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A]">
            <FilterOutlined /> Filter Status:
          </div>
          <Select
            allowClear
            placeholder="All Stages"
            className="w-48 text-xs"
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            options={cols.map((c) => ({ value: c.id, label: c.label }))}
          />
          {(filterStatus !== undefined || search) && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setFilterStatus(undefined);
                setSearch("");
                setPage(1);
              }}
              className="text-xs text-slate-500"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        view === "Board" ? <CardGridSkeleton count={3} /> : <TableSkeleton columns={5} rows={6} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No turnover tasks active"
          description="All rooms are clean and inspected, or no tasks match your filter."
          actionText="Assign Turnover"
          onAction={() => {
            createForm.resetFields();
            createForm.setFieldsValue({ status: 0 });
            setCreateOpen(true);
          }}
        />
      ) : view === "Board" ? (
        <div className="space-y-4">
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
                                    <Space size="small">
                                      <Button
                                        size="small"
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => handleOpenEdit(h)}
                                        className="text-slate-400 hover:text-slate-700"
                                      />
                                      <Popconfirm
                                        title="Delete turnover task?"
                                        onConfirm={() => handleDelete(h.houseKeepingId)}
                                        okText="Delete"
                                        cancelText="Cancel"
                                        okButtonProps={{ danger: true }}
                                      >
                                        <Button
                                          size="small"
                                          type="text"
                                          danger
                                          icon={<DeleteOutlined />}
                                        />
                                      </Popconfirm>
                                    </Space>
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
          <div className="flex justify-end p-3 bg-white rounded-xl shadow-xs">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={["12", "24", "48"]}
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
              showTotal={(tot) => `Total ${tot} housekeeping records`}
            />
          </div>
        </div>
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="houseKeepingId"
            dataSource={list}
            columns={tableColumns}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "12", "24", "48"],
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showTotal: (tot) => `Total ${tot} turnover records`,
              responsive: true,
            }}
            scroll={{ x: 700 }}
          />
        </Card>
      )}

      {/* Assign / Create Task Drawer */}
      <Drawer
        title="Schedule Housekeeping Task"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={420}
        extra={
          <Button
            type="primary"
            style={{ background: NAVY, borderColor: NAVY }}
            onClick={handleCreateTask}
          >
            Schedule
          </Button>
        }
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="objectId"
            label="Target Room"
            rules={[{ required: true, message: "Select a room" }]}
          >
            <Select
              placeholder="Select Room"
              options={rooms.map((r) => ({
                value: r.roomId,
                label: `Room #${r.number} (${r.reservationStatus || "Available"})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="assignee"
            label="Assigned Housekeeper"
            rules={[{ required: true, message: "Specify staff member" }]}
          >
            <Input placeholder="e.g. Maria Santos" />
          </Form.Item>
          <Form.Item name="status" label="Initial Status">
            <Select options={cols.map((c) => ({ value: c.id, label: c.label }))} />
          </Form.Item>
          <Form.Item name="notes" label="Special Instructions / Linen Requirements">
            <Input.TextArea rows={3} placeholder="Full linen change, minibar restock, deep sanitation..." />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Edit Task Drawer */}
      <Drawer
        title="Update Housekeeping Task"
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingTask(null);
        }}
        width={420}
        extra={
          <Button
            type="primary"
            style={{ background: NAVY, borderColor: NAVY }}
            onClick={handleSaveEdit}
          >
            Save Updates
          </Button>
        }
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="objectId"
            label="Target Room"
            rules={[{ required: true, message: "Select a room" }]}
          >
            <Select
              options={rooms.map((r) => ({
                value: r.roomId,
                label: `Room #${r.number}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="assignee"
            label="Assigned Housekeeper"
            rules={[{ required: true, message: "Specify staff member" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Turnover Stage">
            <Select options={cols.map((c) => ({ value: c.id, label: c.label }))} />
          </Form.Item>
          <Form.Item name="notes" label="Special Instructions / Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
