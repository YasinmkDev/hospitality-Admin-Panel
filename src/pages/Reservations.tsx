import { useEffect, useState } from "react";
import { Avatar, Button, Card, Col, DatePicker, Drawer, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Steps, Table, Tabs, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomEntry } from "@/lib/types";
import { RESERVATION_STATUS_LABELS } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

const statusTagColor = (s: number) => ["gold", "green", "default", "red"][s] || "default";

export default function Reservations() {
  const [list, setList] = useState<RoomEntry[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<RoomEntry | null>(null);
  const [editing, setEditing] = useState<RoomEntry | null>(null);
  const [form] = Form.useForm();

  const load = () => api.reservation.list().then(setList);
  useEffect(() => { load(); api.room.list().then(setRooms); }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomEntry = {
      roomEntryId: editing?.roomEntryId || newId(),
      ...ctx,
      ...v,
      arrivalDate: v.arrivalDate?.toISOString(),
      departureDate: v.departureDate?.toISOString(),
      customerId: editing?.customerId || newId(),
      roomEntryNo: editing?.roomEntryNo || Math.floor(Math.random() * 9000 + 1000),
    };
    editing ? await api.reservation.update(payload) : await api.reservation.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const cols = [
    { title: "Guest", dataIndex: "customerName",
      render: (n: string) => <Space><Avatar size="small" style={{ background: NAVY, color: GOLD }}>{n?.[0]}</Avatar><span style={{ fontWeight: 600, color: NAVY }}>{n}</span></Space>
    },
    { title: "Reg #", dataIndex: "registrationNo" },
    { title: "Room", dataIndex: "roomId", render: (id: string) => rooms.find(r => r.roomId === id)?.number ?? "—" },
    { title: "Arrival", dataIndex: "arrivalDate", render: (d: string) => dayjs(d).format("MMM D") },
    { title: "Nights", dataIndex: "noNights", render: (n: number) => <span className="tabular-nums">{n}</span> },
    { title: "Guests", render: (_: any, r: RoomEntry) => <span className="tabular-nums">{r.adultNo}A · {r.childNo}C</span> },
    { title: "Total", dataIndex: "totalOrder", render: (v: number) => <span className="tabular-nums" style={{ fontWeight: 600 }}>${v}</span> },
    { title: "Status", dataIndex: "reservationStatus", render: (s: number) => <Tag color={statusTagColor(s)}>{RESERVATION_STATUS_LABELS[s]}</Tag> },
    {
      title: "Actions", key: "a", render: (_: any, r: RoomEntry) => (
        <Space>
          <Button size="small" onClick={() => setDetail(r)}>View</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue({ ...r, arrivalDate: dayjs(r.arrivalDate), departureDate: dayjs(r.departureDate) }); setOpen(true); }} />
          <Popconfirm title="Delete?" onConfirm={async () => { await api.reservation.remove(r.roomEntryId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Reservations" subtitle={`${list.length} active room entries`}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Reservation</Button>}
      />
      <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
        <Table rowKey="roomEntryId" dataSource={list} columns={cols as any} />
      </Card>

      <Drawer
        title={editing ? `Edit Reservation` : "New Reservation"}
        open={open} onClose={() => { setOpen(false); setEditing(null); form.resetFields(); }}
        width={620}
        extra={<Button type="primary" onClick={onSave}>Save</Button>}
      >
        <Form layout="vertical" form={form}>
          <Tabs
            items={[
              { key: "g", label: "Guest", children: (
                <>
                  <Form.Item label="Guest Name" name="customerName" rules={[{ required: true }]}><Input /></Form.Item>
                  <Row gutter={12}>
                    <Col span={12}><Form.Item label="Registration #" name="registrationNo"><Input /></Form.Item></Col>
                    <Col span={12}><Form.Item label="Voucher #" name="voucherNo"><Input /></Form.Item></Col>
                  </Row>
                </>
              )},
              { key: "s", label: "Stay", children: (
                <>
                  <Row gutter={12}>
                    <Col span={12}><Form.Item label="Room" name="roomId">
                      <Select options={rooms.map(r => ({ value: r.roomId, label: `Room ${r.number}` }))} /></Form.Item></Col>
                    <Col span={12}><Form.Item label="Status" name="reservationStatus" initialValue={0}>
                      <Select options={Object.entries(RESERVATION_STATUS_LABELS).map(([v, l]) => ({ value: +v, label: l }))} /></Form.Item></Col>
                    <Col span={12}><Form.Item label="Arrival" name="arrivalDate" rules={[{ required: true }]}><DatePicker showTime style={{ width: "100%" }} /></Form.Item></Col>
                    <Col span={12}><Form.Item label="Departure" name="departureDate" rules={[{ required: true }]}><DatePicker showTime style={{ width: "100%" }} /></Form.Item></Col>
                    <Col span={8}><Form.Item label="Nights" name="noNights"><InputNumber min={1} style={{ width: "100%" }} /></Form.Item></Col>
                    <Col span={8}><Form.Item label="Adults" name="adultNo"><InputNumber min={1} style={{ width: "100%" }} /></Form.Item></Col>
                    <Col span={8}><Form.Item label="Children" name="childNo"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
                  </Row>
                </>
              )},
              { key: "b", label: "Billing", children: (
                <Row gutter={12}>
                  <Col span={12}><Form.Item label="Total" name="totalOrder"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
                  <Col span={12}><Form.Item label="Rooms Total" name="totalOrderRooms"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
                </Row>
              )},
            ]}
          />
          <Form.Item label="Remarks" name="remarks"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Drawer>

      <Drawer width={560} open={!!detail} onClose={() => setDetail(null)} title={detail ? `Reservation #${detail.registrationNo}` : ""}>
        {detail && (
          <div>
            <Card className="cz-grain" style={{ background: NAVY, color: "#fff", border: 0 }}>
              <Space>
                <Avatar size={48} style={{ background: GOLD, color: NAVY }} icon={<UserOutlined />}>{detail.customerName?.[0]}</Avatar>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>{detail.customerName}</div>
                  <div style={{ opacity: 0.7 }}>{dayjs(detail.arrivalDate).format("MMM D")} → {dayjs(detail.departureDate).format("MMM D")}</div>
                </div>
              </Space>
            </Card>
            <Steps
              style={{ marginTop: 24 }}
              current={detail.reservationStatus}
              items={[
                { title: "Reserved" }, { title: "Checked-In" }, { title: "Checked-Out" }, { title: "Closed" },
              ]}
            />
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                ["Room", rooms.find(r => r.roomId === detail.roomId)?.number ?? "—"],
                ["Nights", detail.noNights],
                ["Guests", `${detail.adultNo}A · ${detail.childNo}C`],
                ["Total", `$${detail.totalOrder}`],
                ["Paid", detail.isPaid ? "Yes" : "No"],
                ["Voucher", detail.voucherNo],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>{(k as string).toUpperCase()}</div>
                  <div style={{ fontWeight: 600, color: NAVY }}>{v as any}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
