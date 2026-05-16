import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Switch, Table, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Bed, Floor, Room } from "@/lib/types";
import { NAVY } from "@/lib/theme";

export default function Beds() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bed | null>(null);
  const [form] = Form.useForm();

  const load = () => api.bed.list().then(setBeds);
  useEffect(() => {
    load();
    api.room.list().then(setRooms);
    api.floor.list().then(setFloors);
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce((a: any, x: any) => ({ ...a, [x.key]: x.value }), {});
    const payload: Bed = { bedId: editing?.bedId || newId(), ...ctx, ...v, customFields: cf };
    editing ? await api.bed.update(payload) : await api.bed.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const cols = [
    { title: "Bed #", dataIndex: "number", render: (n: string) => <span style={{ fontWeight: 600, color: NAVY }}>{n}</span> },
    { title: "Room", dataIndex: "roomId", render: (id: string) => rooms.find(r => r.roomId === id)?.number ?? "—" },
    { title: "Floor", dataIndex: "floor", render: (id: string) => floors.find(f => f.floorId === id)?.floorName ?? "—" },
    { title: "Occupied", dataIndex: "isOccupied", render: (b: boolean) => <Tag color={b ? "red" : "green"}>{b ? "Yes" : "No"}</Tag> },
    { title: "Active", dataIndex: "isInactive", render: (b: boolean) => <Tag color={b ? "default" : "gold"}>{b ? "Inactive" : "Active"}</Tag> },
    {
      title: "Actions", key: "a", render: (_: any, b: Bed) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => {
            setEditing(b);
            form.setFieldsValue({ ...b, customFields: Object.entries(b.customFields || {}).map(([key, value]) => ({ key, value })) });
            setOpen(true);
          }} />
          <Popconfirm title="Delete?" onConfirm={async () => { await api.bed.remove(b.bedId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Beds" subtitle={`${beds.length} beds tracked across the property`}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Bed</Button>}
      />
      <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
        <Table rowKey="bedId" dataSource={beds} columns={cols as any} pagination={{ pageSize: 12 }} />
      </Card>

      <Modal title={editing ? "Edit Bed" : "New Bed"} open={open} onCancel={() => setOpen(false)} onOk={onSave} width={620}>
        <Form layout="vertical" form={form}>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Bed Number" name="number" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Room" name="roomId" rules={[{ required: true }]}>
              <Select options={rooms.map(r => ({ value: r.roomId, label: `Room ${r.number}` }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Floor" name="floor"><Select options={floors.map(f => ({ value: f.floorId, label: f.floorName }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Connect Room" name="connectRoomId">
              <Select allowClear options={rooms.map(r => ({ value: r.roomId, label: r.number }))} /></Form.Item></Col>
          </Row>
          <Form.Item label="Remarks" name="remarks"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="Occupied" name="isOccupied" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={8}><Form.Item label="Inactive" name="isInactive" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={8}><Form.Item label="On Layout" name="isOnlayout" valuePropName="checked" initialValue><Switch /></Form.Item></Col>
          </Row>
          <Form.Item label="Custom Fields"><CustomFieldsEditor /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
