import { useEffect, useState } from "react";
import { Button, Card, Col, ColorPicker, Form, Input, InputNumber, Modal, Popconfirm, Row, Switch, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { api, ctx, newId } from "@/lib/mockApi";
import type { RoomType } from "@/lib/types";
import { GOLD, NAVY, numberToHex } from "@/lib/theme";

export default function RoomTypes() {
  const [types, setTypes] = useState<RoomType[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form] = Form.useForm();

  const load = () => { api.roomType.list().then(setTypes); };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce((a: any, x: any) => ({ ...a, [x.key]: x.value }), {});
    const colorNum = typeof v.color === "string"
      ? parseInt(v.color.replace("#", ""), 16)
      : (v.color?.toHexString ? parseInt(v.color.toHexString().replace("#", ""), 16) : v.color);
    const payload: RoomType = { roomTypeId: editing?.roomTypeId || newId(), ...ctx, ...v, color: colorNum, customFields: cf };
    editing ? await api.roomType.update(payload) : await api.roomType.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  return (
    <div>
      <PageHeader title="Room Types" subtitle="Define your inventory categories"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Type</Button>}
      />
      <Row gutter={[20, 20]}>
        {types.map((t, i) => (
          <Col xs={24} sm={12} lg={8} xxl={6} key={t.roomTypeId}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
              <Card className="cz-card-shadow" styles={{ body: { padding: 0 } }} style={{ border: 0, overflow: "hidden" }}>
                <div style={{
                  height: 130,
                  background: `linear-gradient(135deg, ${numberToHex(t.color)}, ${NAVY})`,
                  position: "relative", display: "flex", alignItems: "flex-end", padding: 18, color: "#fff",
                }}>
                  <div>
                    <Tag color="gold" style={{ color: NAVY, marginBottom: 6 }}>${t.defaultPrice}/night</Tag>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, lineHeight: 1.1 }}>{t.roomType}</div>
                  </div>
                  <div style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 8, background: numberToHex(t.color), border: "2px solid #fff" }} />
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", gap: 16, color: "#64748b", fontSize: 13 }}>
                    <span><UserOutlined /> {t.adultsNo} adults</span>
                    {t.childNo > 0 && <span>· {t.childNo} children</span>}
                    {t.isSharedroom && <Tag>Shared</Tag>}
                  </div>
                  <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                    <Button block icon={<EditOutlined />} onClick={() => {
                      setEditing(t);
                      form.setFieldsValue({ ...t, color: numberToHex(t.color), customFields: Object.entries(t.customFields || {}).map(([key, value]) => ({ key, value })) });
                      setOpen(true);
                    }}>Edit</Button>
                    <Popconfirm title="Delete?" onConfirm={async () => { await api.roomType.remove(t.roomTypeId); load(); }}>
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Modal open={open} title={editing ? "Edit Room Type" : "New Room Type"} onCancel={() => setOpen(false)} onOk={onSave} width={560}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Type Name" name="roomType" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col span={8}><Form.Item label="Default Price" name="defaultPrice"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Adults" name="adultsNo"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="Children" name="childNo"><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Color" name="color"><ColorPicker showText /></Form.Item></Col>
            <Col span={12}><Form.Item label="Shared Room" name="isSharedroom" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
          <Form.Item label="Image URL" name="imageData"><Input placeholder="https://..." /></Form.Item>
          <Form.Item label="Custom Fields"><CustomFieldsEditor /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
