import { useEffect, useState } from "react";
import { Avatar, Button, Card, Col, DatePicker, Form, Input, Modal, Popconfirm, Row, Select, Space, Switch, Tag, Timeline, message } from "antd";
import { BellFilled, CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomReminder } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function Reminders() {
  const [list, setList] = useState<RoomReminder[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomReminder | null>(null);
  const [form] = Form.useForm();

  const load = () => { api.reminder.list().then(setList); };
  useEffect(() => { load(); api.room.list().then(setRooms); }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomReminder = {
      roomReminderId: editing?.roomReminderId || newId(),
      ...ctx, ...v,
      reminderStartingTime: v.reminderStartingTime?.toISOString(),
      reminderEndingTime: v.reminderEndingTime?.toISOString(),
    };
    editing ? await api.reminder.update(payload) : await api.reminder.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const toggleDone = async (r: RoomReminder) => {
    await api.reminder.update({ ...r, isDone: !r.isDone });
    load();
  };

  return (
    <div>
      <PageHeader title="Room Reminders" subtitle="Operational tasks scheduled to specific rooms"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Reminder</Button>}
      />
      <Card className="cz-card-shadow" style={{ border: 0 }}>
        <Timeline
          items={list.map((r) => {
            const room = rooms.find(x => x.roomId === r.roomId);
            return {
              dot: r.isDone ? <CheckOutlined style={{ color: "#2E9E6E" }} /> : <BellFilled style={{ color: GOLD }} />,
              children: (
                <div style={{ background: "#fff", padding: 14, borderRadius: 12, border: "1px solid rgba(11,31,58,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <Space>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: NAVY }}>{r.reminderSubject}</span>
                        {r.isEachDay && <Tag color="gold" style={{ color: NAVY }} icon={<ReloadOutlined />}>Daily</Tag>}
                        {r.isDone && <Tag color="green">Done</Tag>}
                      </Space>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{r.reminderDescription}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                        {dayjs(r.reminderStartingTime).format("MMM D, h:mm a")} → {dayjs(r.reminderEndingTime).format("h:mm a")}
                        {room && ` · Room ${room.number}`}
                      </div>
                    </div>
                    <Space>
                      <Button size="small" onClick={() => toggleDone(r)}>{r.isDone ? "Reopen" : "Done"}</Button>
                      <Button size="small" icon={<EditOutlined />} onClick={() => {
                        setEditing(r);
                        form.setFieldsValue({ ...r, reminderStartingTime: dayjs(r.reminderStartingTime), reminderEndingTime: dayjs(r.reminderEndingTime) });
                        setOpen(true);
                      }} />
                      <Popconfirm title="Delete?" onConfirm={async () => { await api.reminder.remove(r.roomReminderId); load(); }}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              )
            };
          })}
        />
      </Card>

      <Modal open={open} title={editing ? "Edit Reminder" : "New Reminder"} onCancel={() => setOpen(false)} onOk={onSave} width={560}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Subject" name="reminderSubject" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Description" name="reminderDescription"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="Room" name="roomId" rules={[{ required: true }]}>
            <Select options={rooms.map(r => ({ value: r.roomId, label: `Room ${r.number}` }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Start" name="reminderStartingTime"><DatePicker showTime style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="End" name="reminderEndingTime"><DatePicker showTime style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Recurring Daily" name="isEachDay" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={12}><Form.Item label="Done" name="isDone" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
