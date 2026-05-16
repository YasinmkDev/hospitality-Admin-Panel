import { useEffect, useState } from "react";
import { Avatar, Button, Card, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { api, ctx, newId } from "@/lib/mockApi";
import type { RoomEntryDnr } from "@/lib/types";
import { GOLD, NAVY, STATUS } from "@/lib/theme";

export default function ReservationsDnr() {
  const [list, setList] = useState<RoomEntryDnr[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomEntryDnr | null>(null);
  const [form] = Form.useForm();

  const load = () => { api.dnr.list().then(setList); };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomEntryDnr = {
      roomEntryDnrId: editing?.roomEntryDnrId || newId(),
      customerId: editing?.customerId || newId(),
      dnrId: editing?.dnrId || newId(),
      ...ctx, ...v,
    };
    editing ? await api.dnr.update(payload) : await api.dnr.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const cols = [
    {
      title: "Guest", dataIndex: "customerName",
      render: (n: string) => <Space><Avatar style={{ background: STATUS.occupied, color: "#fff" }}>{n?.[0]}</Avatar><span style={{ fontWeight: 600, color: NAVY }}>{n}</span></Space>
    },
    { title: "Reason", dataIndex: "reason" },
    { title: "Active", dataIndex: "value", render: (v: boolean) => <Tag color={v ? "red" : "default"} icon={<StopOutlined />}>{v ? "DNR" : "Cleared"}</Tag> },
    {
      title: "Actions", key: "a", render: (_: any, r: RoomEntryDnr) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setOpen(true); }} />
          <Popconfirm title="Delete?" onConfirm={async () => { await api.dnr.remove(r.roomEntryDnrId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Do Not Rent" subtitle="Guests flagged from booking"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>Add Entry</Button>}
      />
      <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
        <Table rowKey="roomEntryDnrId" dataSource={list} columns={cols as any} />
      </Card>

      <Modal open={open} title={editing ? "Edit DNR" : "New DNR"} onCancel={() => setOpen(false)} onOk={onSave}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Guest Name" name="customerName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Reason" name="reason"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Active" name="value" valuePropName="checked" initialValue><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
