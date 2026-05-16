import { useEffect, useState } from "react";
import { Button, Card, Col, Drawer, Form, Input, InputNumber, Popconfirm, Row, Switch, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, AppstoreOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { api, ctx, newId } from "@/lib/mockApi";
import { GOLD, NAVY } from "@/lib/theme";
import type { Floor, Room } from "@/lib/types";

export default function Floors() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Floor | null>(null);
  const [form] = Form.useForm();

  const load = () => { api.floor.list().then(setFloors); };
  useEffect(() => {
    load();
    api.room.list().then(setRooms);
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce((a: any, x: any) => ({ ...a, [x.key]: x.value }), {});
    const payload: Floor = {
      floorId: editing?.floorId || newId(),
      ...ctx,
      ...v,
      customFields: cf,
    };
    if (editing) await api.floor.update(payload);
    else await api.floor.add(payload);
    message.success(editing ? "Floor updated" : "Floor added");
    setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const onEdit = (f: Floor) => {
    setEditing(f);
    form.setFieldsValue({
      ...f,
      customFields: Object.entries(f.customFields || {}).map(([key, value]) => ({ key, value })),
    });
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    await api.floor.remove(id);
    message.success("Floor deleted");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Floors"
        subtitle="Manage every level of your property"
        extra={
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>
            New Floor
          </Button>
        }
      />

      <Row gutter={[20, 20]}>
        {floors.map((f, i) => {
          const fRooms = rooms.filter((r) => r.floor === f.floorId);
          const occ = fRooms.filter((r) => r.isOccupied).length;
          const pct = fRooms.length ? Math.round((occ / fRooms.length) * 100) : 0;
          return (
            <Col key={f.floorId} xs={24} sm={12} lg={8} xxl={6}>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className="cz-card-shadow"
                  style={{ border: 0, overflow: "hidden" }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div
                    className="cz-grain"
                    style={{
                      padding: "22px 22px 18px",
                      background: `linear-gradient(135deg, ${NAVY} 0%, #16315a 100%)`,
                      color: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ opacity: 0.7, fontSize: 12, letterSpacing: 2 }}>FLOOR {f.floorNumber}</div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, marginTop: 4 }}>
                          {f.floorName}
                        </div>
                      </div>
                      <AppstoreOutlined style={{ color: GOLD, fontSize: 22 }} />
                    </div>
                    <Tag color={f.isActive ? "gold" : "default"} style={{ marginTop: 12, color: f.isActive ? NAVY : undefined }}>
                      {f.isActive ? "Active" : "Inactive"}
                    </Tag>
                  </div>
                  <div style={{ padding: 22 }}>
                    <Row gutter={12}>
                      <Col span={12}>
                        <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>ROOMS</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: NAVY }} className="tabular-nums">
                          {f.numberRoomsOnFloor}
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>BEDS</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: NAVY }} className="tabular-nums">
                          {f.numberBedsOnFloor}
                        </div>
                      </Col>
                    </Row>
                    <div style={{ marginTop: 14, fontSize: 12, color: "#64748b" }}>
                      Occupancy <span style={{ color: NAVY, fontWeight: 600 }}>{pct}%</span> ({occ}/{fRooms.length})
                    </div>
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <Button block icon={<EditOutlined />} onClick={() => onEdit(f)}>Edit</Button>
                      <Popconfirm title="Delete floor?" onConfirm={() => onDelete(f.floorId)}>
                        <Button danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      <Drawer
        title={editing ? "Edit Floor" : "New Floor"}
        width={520}
        open={open}
        onClose={() => { setOpen(false); setEditing(null); form.resetFields(); }}
        extra={<Button type="primary" onClick={onSave}>Save</Button>}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Floor Name" name="floorName" rules={[{ required: true }]}>
            <Input placeholder="e.g. Sky Lounge" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Floor Number" name="floorNumber" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="# Rooms" name="numberRoomsOnFloor"><InputNumber style={{ width: "100%" }} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="# Beds" name="numberBedsOnFloor"><InputNumber style={{ width: "100%" }} /></Form.Item>
            </Col>
          </Row>
          <Form.Item label="Description" name="description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item label="Custom Fields"><CustomFieldsEditor /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
