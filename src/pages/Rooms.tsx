import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
  Popconfirm,
  Card,
  Tabs,
  Avatar,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  FilterOutlined,
  HomeFilled,
  EyeOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { TableSkeleton, CardGridSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import { GOLD, NAVY, STATUS, numberToHex } from "@/lib/theme";
import type { Floor, Room, RoomType } from "@/lib/types";

const statusColor = (s?: string) =>
  s === "Available"
    ? STATUS.vacant
    : s === "Occupied"
    ? STATUS.occupied
    : s === "Cleaning"
    ? STATUS.cleaning
    : STATUS.reserved;

export default function Rooms() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [view, setView] = useState<"Table" | "Cards">("Table");
  const [filterFloor, setFilterFloor] = useState<string>();
  const [filterType, setFilterType] = useState<string>();
  const [filterStatus, setFilterStatus] = useState<string>();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Room | null>(null);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    return api.room.list().then((res) => {
      setRooms(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    api.floor.list().then(setFloors);
    api.roomType.list().then(setTypes);
  }, []);

  const filtered = useMemo(
    () =>
      rooms.filter(
        (r) =>
          (!filterFloor || r.floor === filterFloor) &&
          (!filterType || r.roomTypeId === filterType) &&
          (!filterStatus || r.reservationStatus === filterStatus)
      ),
    [rooms, filterFloor, filterType, filterStatus]
  );

  const typeName = (id: string) => types.find((t) => t.roomTypeId === id)?.roomType ?? "—";
  const floorName = (id: string) => floors.find((f) => f.floorId === id)?.floorName ?? "—";

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce(
      (a: Record<string, string>, x: { key: string; value: string }) => ({ ...a, [x.key]: x.value }),
      {}
    );
    const payload: Room = { roomId: editing?.roomId || newId(), ...ctx, ...v, customFields: cf };
    if (editing) await api.room.update(payload);
    else await api.room.add(payload);
    message.success(editing ? "Room updated" : "Room added");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const onEdit = (r: Room) => {
    setEditing(r);
    form.setFieldsValue({
      ...r,
      customFields: Object.entries(r.customFields || {}).map(([key, value]) => ({ key, value })),
    });
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    await api.room.remove(id);
    message.success("Room deleted");
    load();
  };

  const columns = [
    {
      title: "Room",
      dataIndex: "number",
      key: "number",
      render: (n: string, r: Room) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-xs shadow-sm"
            style={{
              background: numberToHex(types.find((t) => t.roomTypeId === r.roomTypeId)?.color),
            }}
          >
            {n.slice(-2)}
          </div>
          <div>
            <div className="font-semibold text-[#0B1F3A] text-sm">Room #{n}</div>
            <div className="text-[11px] text-slate-400">{floorName(r.floor)}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "roomTypeId",
      render: (id: string) => (
        <Tag color="gold" className="text-xs font-medium" style={{ color: NAVY }}>
          {typeName(id)}
        </Tag>
      ),
    },
    {
      title: "Beds",
      dataIndex: "bedcount",
      render: (n: number) => <span className="tabular-nums font-semibold">{n}</span>,
    },
    {
      title: "Occupancy",
      render: (_: unknown, r: Room) => (
        <span className="tabular-nums text-xs text-slate-600">
          {r.adultsNo} Adults · {r.childNo} Kids
        </span>
      ),
    },
    {
      title: "Extension",
      dataIndex: "phoneExtension",
      render: (ext: string) => <span className="text-xs text-slate-500 font-mono">{ext || "—"}</span>,
    },
    {
      title: "Status",
      dataIndex: "reservationStatus",
      render: (s: string) => (
        <Tag color={statusColor(s)} className="text-xs font-medium" style={{ color: "#fff", border: 0 }}>
          {s || "Available"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 140,
      render: (_: unknown, r: Room) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(r)} />
          <Popconfirm
            title="Delete Room?"
            description="Are you sure you want to remove this room?"
            onConfirm={() => onDelete(r.roomId)}
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
          title="Room Directory"
          subtitle={`${rooms.length} rooms listed across ${floors.length} levels`}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <Segmented
            options={["Table", "Cards"]}
            value={view}
            onChange={(v) => setView(v as "Table" | "Cards")}
            className="p-1 bg-white border border-slate-200"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-xl h-9 font-medium shadow-sm"
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setOpen(true);
            }}
          >
            New Room
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card
        className="cz-card-shadow mb-5"
        style={{ border: 0 }}
        styles={{ body: { padding: "14px 18px" } }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A]">
            <FilterOutlined /> Filter By:
          </div>
          <Select
            allowClear
            placeholder="All Floors"
            className="w-36 sm:w-44 text-xs"
            value={filterFloor}
            onChange={setFilterFloor}
            options={floors.map((f) => ({ value: f.floorId, label: f.floorName }))}
          />
          <Select
            allowClear
            placeholder="All Room Types"
            className="w-36 sm:w-44 text-xs"
            value={filterType}
            onChange={setFilterType}
            options={types.map((t) => ({ value: t.roomTypeId, label: t.roomType }))}
          />
          <Select
            allowClear
            placeholder="Live Status"
            className="w-32 sm:w-40 text-xs"
            value={filterStatus}
            onChange={setFilterStatus}
            options={["Available", "Reserved", "Occupied", "Cleaning"].map((s) => ({
              value: s,
              label: s,
            }))}
          />
          {(filterFloor || filterType || filterStatus) && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setFilterFloor(undefined);
                setFilterType(undefined);
                setFilterStatus(undefined);
              }}
              className="text-xs text-slate-500"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Content Area */}
      {loading ? (
        view === "Table" ? (
          <TableSkeleton columns={6} rows={6} />
        ) : (
          <CardGridSkeleton count={8} />
        )
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No rooms match your filter"
          description="Try clearing your status or floor filter, or register a new room."
          actionText="Add New Room"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : view === "Table" ? (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="roomId"
            dataSource={filtered}
            columns={columns}
            pagination={{ pageSize: 12, responsive: true }}
            scroll={{ x: 720 }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((r, i) => {
            const t = types.find((tp) => tp.roomTypeId === r.roomTypeId);
            return (
              <Col xs={12} sm={8} md={6} lg={4} key={r.roomId}>
                <motion.div
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card
                    hoverable
                    styles={{ body: { padding: 14 } }}
                    onClick={() => setDetail(r)}
                    className="border-0 shadow-sm rounded-xl overflow-hidden cursor-pointer"
                  >
                    <div
                      style={{
                        height: 72,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${numberToHex(t?.color)}, ${NAVY})`,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontFamily: "'Fraunces', serif",
                        fontSize: 24,
                        fontWeight: 700,
                      }}
                    >
                      {r.number}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-1">
                      <span className="text-xs text-slate-500 truncate" title={t?.roomType}>
                        {t?.roomType}
                      </span>
                      <Tag
                        color={statusColor(r.reservationStatus)}
                        className="text-[10px] m-0 border-0 font-medium"
                      >
                        {r.reservationStatus || "Available"}
                      </Tag>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Room Drawer Form */}
      <Drawer
        title={editing ? `Edit Room #${editing.number}` : "Register New Room"}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 540}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        extra={
          <Button
            type="primary"
            onClick={onSave}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-lg"
          >
            Save Room
          </Button>
        }
      >
        <Form layout="vertical" form={form}>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Room Number" name="number" rules={[{ required: true }]}>
                <Input placeholder="e.g. 304" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Extension" name="phoneExtension">
                <Input placeholder="e.g. 1304" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Floor Level" name="floor" rules={[{ required: true }]}>
                <Select
                  options={floors.map((f) => ({ value: f.floorId, label: f.floorName }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Room Category" name="roomTypeId" rules={[{ required: true }]}>
                <Select
                  options={types.map((t) => ({ value: t.roomTypeId, label: t.roomType }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item label="Beds" name="bedcount">
                <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item label="Adults" name="adultsNo">
                <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item label="Children" name="childNo">
                <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Status" name="reservationStatus">
                <Select
                  options={["Available", "Reserved", "Occupied", "Cleaning"].map((s) => ({
                    value: s,
                    label: s,
                  }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Adjoining Room" name="connectRoomId">
                <Select
                  allowClear
                  options={rooms.map((r) => ({ value: r.roomId, label: `Room #${r.number}` }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea rows={2} placeholder="Balcony view, corner suite, etc." className="rounded-lg" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={8}>
              <Form.Item label="Occupied" name="isOccupied" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item label="Shared" name="isSharedroom" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item label="On Layout" name="isOnlayout" valuePropName="checked" initialValue>
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Custom Fields">
            <CustomFieldsEditor />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Room Detail View Drawer */}
      <Drawer
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 500}
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Room #${detail.number}` : ""}
      >
        {detail && (
          <div className="space-y-4">
            <Card style={{ background: NAVY, color: "#fff", border: 0 }} className="cz-grain rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-serif text-3xl font-bold">Room #{detail.number}</div>
                  <div className="opacity-80 text-xs mt-1">
                    {floorName(detail.floor)} · {typeName(detail.roomTypeId)}
                  </div>
                </div>
                <Avatar size={48} style={{ background: GOLD, color: NAVY }} icon={<HomeFilled />} />
              </div>
            </Card>

            <Tabs
              defaultActiveKey="o"
              items={[
                {
                  key: "o",
                  label: "Overview",
                  children: (
                    <div className="grid grid-cols-2 gap-3.5 pt-2">
                      {[
                        ["Beds Count", detail.bedcount],
                        ["Adult Capacity", detail.adultsNo],
                        ["Child Capacity", detail.childNo],
                        ["Extension", detail.phoneExtension || "—"],
                        ["Reservation Status", detail.reservationStatus || "Available"],
                        ["Currently Occupied", detail.isOccupied ? "Yes" : "No"],
                        ["Adjoining Connect", detail.connectRoomId ? "Configured" : "None"],
                        ["Floor Plan Visible", detail.isOnlayout ? "Enabled" : "Hidden"],
                      ].map(([k, v]) => (
                        <div key={k as string} className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                            {k as string}
                          </div>
                          <div className="font-semibold text-[#0B1F3A] text-sm mt-0.5">
                            {String(v)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "f",
                  label: "Features",
                  children: (
                    <div className="text-xs text-slate-500 py-3">
                      En-suite bathroom, high-speed Wi-Fi, air conditioning, and mini-bar enabled for this room category.
                    </div>
                  ),
                },
                {
                  key: "r",
                  label: "Tariff",
                  children: (
                    <div className="text-xs text-slate-500 py-3">
                      Tariff synced with current season and base room category rate card.
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
