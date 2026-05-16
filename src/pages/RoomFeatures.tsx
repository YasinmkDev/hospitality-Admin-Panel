import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, StarFilled } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomFeature } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function RoomFeatures() {
  const [features, setFeatures] = useState<RoomFeature[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomFeature | null>(null);
  const [form] = Form.useForm();

  const load = () => api.roomFeature.list().then(setFeatures);
  useEffect(() => { load(); api.room.list().then(setRooms); }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomFeature = { rRoomFeaturesId: editing?.rRoomFeaturesId || newId(), roomFeatureId: editing?.roomFeatureId || newId(), objectType: 1, ...ctx, ...v };
    editing ? await api.roomFeature.update(payload) : await api.roomFeature.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const cols = [
    { title: "Feature", dataIndex: "name", render: (n: string) => <Space><StarFilled style={{ color: GOLD }} /><span style={{ fontWeight: 600, color: NAVY }}>{n}</span></Space> },
    { title: "Linked Room", dataIndex: "objectId", render: (id: string) => rooms.find(r => r.roomId === id)?.number ?? "—" },
    { title: "Type", dataIndex: "objectType", render: (t: number) => <Tag>{t === 1 ? "Room" : "Bed"}</Tag> },
    {
      title: "Actions", key: "a", render: (_: any, f: RoomFeature) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(f); form.setFieldsValue(f); setOpen(true); }} />
          <Popconfirm title="Delete?" onConfirm={async () => { await api.roomFeature.remove(f.rRoomFeaturesId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Room Features" subtitle="Amenities & in-room features library"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Feature</Button>}
      />
      <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
        <Table rowKey="rRoomFeaturesId" dataSource={features} columns={cols as any} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal open={open} title={editing ? "Edit Feature" : "New Feature"} onCancel={() => setOpen(false)} onOk={onSave}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Feature Name" name="name" rules={[{ required: true }]}><Input placeholder="e.g. Sea View" /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Linked Room" name="objectId" rules={[{ required: true }]}>
              <Select options={rooms.map(r => ({ value: r.roomId, label: `Room ${r.number}` }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Object Type" name="objectType" initialValue={1}>
              <Select options={[{ value: 1, label: "Room" }, { value: 2, label: "Bed" }]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
