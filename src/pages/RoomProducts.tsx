import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ShoppingFilled } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomProduct } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function RoomProducts() {
  const [products, setProducts] = useState<RoomProduct[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomProduct | null>(null);
  const [form] = Form.useForm();

  const load = () => api.roomProduct.list().then(setProducts);
  useEffect(() => { load(); api.room.list().then(setRooms); }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomProduct = {
      rRoomProductsId: editing?.rRoomProductsId || newId(),
      roomProductsId: editing?.roomProductsId || newId(),
      menuProductId: editing?.menuProductId || newId(),
      objectType: 1, value: true, ...ctx, ...v,
    };
    editing ? await api.roomProduct.update(payload) : await api.roomProduct.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const cols = [
    { title: "Product", dataIndex: "name", render: (n: string) => <Space><ShoppingFilled style={{ color: GOLD }} /><span style={{ fontWeight: 600, color: NAVY }}>{n}</span></Space> },
    { title: "Linked Room", dataIndex: "objectId", render: (id: string) => rooms.find(r => r.roomId === id)?.number ?? "—" },
    { title: "Qty", dataIndex: "quantity", render: (n: number) => <span className="tabular-nums">{n}</span> },
    { title: "Price", dataIndex: "defaultPrice", render: (p: number) => <Tag color="gold" style={{ color: NAVY }}>${p}</Tag> },
    {
      title: "Actions", key: "a", render: (_: any, p: RoomProduct) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditing(p); form.setFieldsValue(p); setOpen(true); }} />
          <Popconfirm title="Delete?" onConfirm={async () => { await api.roomProduct.remove(p.rRoomProductsId); load(); }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Room Products" subtitle="Mini-bar, add-ons, and in-room offerings"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Product</Button>}
      />
      <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
        <Table rowKey="rRoomProductsId" dataSource={products} columns={cols as any} />
      </Card>

      <Modal open={open} title={editing ? "Edit Product" : "New Product"} onCancel={() => setOpen(false)} onOk={onSave}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Linked Room" name="objectId" rules={[{ required: true }]}>
              <Select options={rooms.map(r => ({ value: r.roomId, label: `Room ${r.number}` }))} /></Form.Item></Col>
            <Col span={6}><Form.Item label="Quantity" name="quantity"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={6}><Form.Item label="Price" name="defaultPrice"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
