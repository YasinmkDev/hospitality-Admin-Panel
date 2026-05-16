import { useEffect, useMemo, useState } from "react";
import {
  Button, Col, Drawer, Form, Input, InputNumber, Row, Segmented, Select, Space, Switch, Table, Tag, message, Popconfirm, Card, Tabs, Avatar,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, FilterOutlined, HomeFilled } from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { api, ctx, newId } from "@/lib/mockApi";
import { GOLD, NAVY, STATUS, numberToHex } from "@/lib/theme";
import type { Floor, Room, RoomType } from "@/lib/types";

const statusColor = (s?: string) =>
  s === "Available" ? STATUS.vacant : s === "Occupied" ? STATUS.occupied : s === "Cleaning" ? STATUS.cleaning : STATUS.reserved;

export default function Rooms() {
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

  const load = () => api.room.list().then(setRooms);
  useEffect(() => {
    load();
    api.floor.list().then(setFloors);
    api.roomType.list().then(setTypes);
  }, []);

  const filtered = useMemo(() => rooms.filter(
    (r) =>
      (!filterFloor || r.floor === filterFloor) &&
      (!filterType || r.roomTypeId === filterType) &&
      (!filterStatus || r.reservationStatus === filterStatus)
  ), [rooms, filterFloor, filterType, filterStatus]);

  const typeName = (id: string) => types.find((t) => t.roomTypeId === id)?.roomType ?? "—";
  const floorName = (id: string) => floors.find((f) => f.floorId === id)?.floorName ?? "—";

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce((a: any, x: any) => ({ ...a, [x.key]: x.value }), {});
    const payload: Room = { roomId: editing?.roomId || newId(), ...ctx, ...v, customFields: cf };
    editing ? await api.room.update(payload) : await api.room.add(payload);
    message.success(editing ? "Room updated" : "Room added");
    setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const onEdit = (r: Room) => {
    setEditing(r);
    form.setFieldsValue({
      ...r,
      customFields: Object.entries(r.customFields || {}).map(([key, value]) => ({ key, value })),
    });
    setOpen(true);
  };

  const onDelete = async (id: string) => { await api.room.remove(id); message.success("Deleted"); load(); };

  const columns = [
    {
      title: "Room", dataIndex: "number", key: "number",
      render: (n: string, r: Room) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: numberToHex(types.find(t => t.roomTypeId === r.roomTypeId)?.color),
            color: "#fff", display: "grid", placeItems: "center", fontWeight: 700,
          }}>{n.slice(-2)}</div>
          <div>
            <div style={{ fontWeight: 600, color: NAVY }}>#{n}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{floorName(r.floor)}</div>
          </div>
        </div>
      )
    },
    { title: "Type", dataIndex: "roomTypeId", render: (id: string) => <Tag color="gold" style={{ color: NAVY }}>{typeName(id)}</Tag> },
    { title: "Beds", dataIndex: "bedcount", render: (n: number) => <span className="tabular-nums">{n}</span> },
    { title: "Capacity", render: (_: any, r: Room) => <span className="tabular-nums">{r.adultsNo}A · {r.childNo}C</span> },
    { title: "Phone", dataIndex: "phoneExtension" },
    {
      title: "Status", dataIndex: "reservationStatus",
      render: (s: string) => <Tag color={statusColor(s)} style={{ color: "#fff", border: 0 }}>{s}</Tag>
    },
    {
      title: "Actions", key: "actions",
      render: (_: any, r: Room) => (
        <Space>
          <Button size="small" onClick={() => setDetail(r)}>View</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(r)} />
          <Popconfirm title="Delete?" onConfirm={() => onDelete(r.roomId)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} rooms across ${floors.length} floors`}
        extra={
          <Space>
            <Segmented options={["Table", "Cards"]} value={view} onChange={(v) => setView(v as any)} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
              New Room
            </Button>
          </Space>
        }
      />

      <Card className="cz-card-shadow" style={{ border: 0, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <Space wrap>
          <FilterOutlined style={{ color: NAVY }} />
          <Select allowClear placeholder="Floor" style={{ width: 180 }} value={filterFloor} onChange={setFilterFloor}
            options={floors.map(f => ({ value: f.floorId, label: f.floorName }))} />
          <Select allowClear placeholder="Type" style={{ width: 180 }} value={filterType} onChange={setFilterType}
            options={types.map(t => ({ value: t.roomTypeId, label: t.roomType }))} />
          <Select allowClear placeholder="Status" style={{ width: 180 }} value={filterStatus} onChange={setFilterStatus}
            options={["Available", "Reserved", "Occupied", "Cleaning"].map(s => ({ value: s, label: s }))} />
        </Space>
      </Card>

      {view === "Table" ? (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table rowKey="roomId" dataSource={filtered} columns={columns as any} pagination={{ pageSize: 10 }} />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((r, i) => {
            const t = types.find(t => t.roomTypeId === r.roomTypeId);
            return (
              <Col xs={12} sm={8} md={6} lg={4} key={r.roomId}>
                <motion.div whileHover={{ y: -4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <Card hoverable styles={{ body: { padding: 14 } }} onClick={() => setDetail(r)}
                    style={{ border: 0, background: "#fff" }}>
                    <div style={{
                      height: 70, borderRadius: 10,
                      background: `linear-gradient(135deg, ${numberToHex(t?.color)}, ${NAVY})`,
                      color: "#fff", display: "grid", placeItems: "center",
                      fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700,
                    }}>{r.number}</div>
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{t?.roomType}</span>
                      <Tag color={statusColor(r.reservationStatus)} style={{ color: "#fff", border: 0, margin: 0 }}>
                        {r.reservationStatus}
                      </Tag>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}

      <Drawer
        title={editing ? `Edit Room ${editing.number}` : "New Room"}
        width={560}
        open={open}
        onClose={() => { setOpen(false); setEditing(null); form.resetFields(); }}
        extra={<Button type="primary" onClick={onSave}>Save</Button>}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Number" name="number" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Phone Extension" name="phoneExtension"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Floor" name="floor" rules={[{ required: true }]}>
              <Select options={floors.map(f => ({ value: f.floorId, label: f.floorName }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Room Type" name="roomTypeId" rules={[{ required: true }]}>
              <Select options={types.map(t => ({ value: t.roomTypeId, label: t.roomType }))} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Beds" name="bedcount"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Adults" name="adultsNo"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Children" name="childNo"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Reservation Status" name="reservationStatus">
              <Select options={["Available", "Reserved", "Occupied", "Cleaning"].map(s => ({ value: s, label: s }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Connect Room" name="connectRoomId">
              <Select allowClear options={rooms.map(r => ({ value: r.roomId, label: r.number }))} /></Form.Item></Col>
          </Row>
          <Form.Item label="Remarks" name="remarks"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="Occupied" name="isOccupied" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={8}><Form.Item label="Shared" name="isSharedroom" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={8}><Form.Item label="On Layout" name="isOnlayout" valuePropName="checked" initialValue><Switch /></Form.Item></Col>
          </Row>
          <Form.Item label="Custom Fields"><CustomFieldsEditor /></Form.Item>
        </Form>
      </Drawer>

      <Drawer
        width={520}
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Room #${detail.number}` : ""}
      >
        {detail && (
          <div>
            <Card style={{ background: NAVY, color: "#fff", border: 0 }} className="cz-grain">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32 }}>{detail.number}</div>
                  <div style={{ opacity: 0.7 }}>{floorName(detail.floor)} · {typeName(detail.roomTypeId)}</div>
                </div>
                <Avatar size={56} style={{ background: GOLD, color: NAVY }} icon={<HomeFilled />} />
              </div>
            </Card>
            <Tabs
              defaultActiveKey="o"
              items={[
                { key: "o", label: "Overview", children: (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
                    {[
                      ["Beds", detail.bedcount], ["Adults", detail.adultsNo], ["Children", detail.childNo],
                      ["Phone", detail.phoneExtension || "—"], ["Status", detail.reservationStatus || "—"], ["Occupied", detail.isOccupied ? "Yes" : "No"],
                    ].map(([k, v]) => (
                      <div key={k as string}>
                        <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>{(k as string).toUpperCase()}</div>
                        <div style={{ fontWeight: 600, color: NAVY }}>{v as any}</div>
                      </div>
                    ))}
                  </div>
                )},
                { key: "f", label: "Features", children: <div style={{ color: "#64748b" }}>Linked features will appear here.</div> },
                { key: "p", label: "Products", children: <div style={{ color: "#64748b" }}>Linked products will appear here.</div> },
                { key: "r", label: "Rates", children: <div style={{ color: "#64748b" }}>Rate matrix from this room's type.</div> },
                { key: "h", label: "History", children: <div style={{ color: "#64748b" }}>Reservation history.</div> },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
