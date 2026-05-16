import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Switch, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, CloudFilled } from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Season } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Seasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [form] = Form.useForm();

  const load = () => { api.season.list().then(setSeasons); };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: Season = { seasonId: editing?.seasonId || newId(), ...ctx, ...v };
    editing ? await api.season.update(payload) : await api.season.add(payload);
    message.success("Saved"); setOpen(false); setEditing(null); form.resetFields(); load();
  };

  const colors = ["#7C5CFF", "#2E9E6E", "#E0A93E", "#E26A6A", GOLD];

  return (
    <div>
      <PageHeader title="Seasons" subtitle="Define rate periods that drive your pricing"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Season</Button>}
      />

      <Card className="cz-card-shadow" style={{ border: 0, marginBottom: 18 }}>
        <div style={{ position: "relative", height: 80 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", height: 28, borderRadius: 8, overflow: "hidden", background: "#F7F4EE" }}>
            {monthNames.map((m, i) => (
              <div key={m} style={{ borderRight: i < 11 ? "1px solid #fff" : 0, display: "grid", placeItems: "center", fontSize: 11, color: "#64748b", fontWeight: 600 }}>{m}</div>
            ))}
          </div>
          {seasons.map((s, idx) => {
            const start = (s.startMonth - 1) + (s.startDay - 1) / 31;
            const end = (s.endMonth - 1) + (s.endDay - 1) / 31;
            const wraps = end < start;
            const segs = wraps ? [[start, 12], [0, end + 1]] : [[start, end + 1]];
            return segs.map(([a, b], k) => (
              <motion.div
                key={`${s.seasonId}-${k}`}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.08 }}
                style={{
                  position: "absolute",
                  top: 38 + idx * 0,
                  left: `${(a / 12) * 100}%`,
                  width: `${((b - a) / 12) * 100}%`,
                  height: 28,
                  background: `linear-gradient(135deg, ${colors[idx % colors.length]}, ${NAVY})`,
                  borderRadius: 6,
                  color: "#fff", fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", padding: "0 10px",
                }}
              >
                {k === 0 ? s.seasonName : ""}
              </motion.div>
            ));
          })}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {seasons.map((s, i) => (
          <Col xs={24} sm={12} lg={8} key={s.seasonId}>
            <motion.div whileHover={{ y: -3 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="cz-card-shadow" style={{ border: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <CloudFilled style={{ color: colors[i % colors.length], fontSize: 22 }} />
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: NAVY, marginTop: 6 }}>{s.seasonName}</div>
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                      {monthNames[s.startMonth - 1]} {s.startDay} → {monthNames[s.endMonth - 1]} {s.endDay}
                    </div>
                  </div>
                  <Tag color={s.isActive ? "gold" : "default"} style={{ color: s.isActive ? NAVY : undefined }}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Tag>
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <Button block icon={<EditOutlined />} onClick={() => { setEditing(s); form.setFieldsValue(s); setOpen(true); }}>Edit</Button>
                  <Popconfirm title="Delete?" onConfirm={async () => { await api.season.remove(s.seasonId); load(); }}>
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Modal open={open} title={editing ? "Edit Season" : "New Season"} onCancel={() => setOpen(false)} onOk={onSave}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Name" name="seasonName" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Description" name="description"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={12}>
            <Col span={6}><Form.Item label="Start Day" name="startDay"><InputNumber min={1} max={31} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={6}><Form.Item label="Start Month" name="startMonth"><InputNumber min={1} max={12} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={6}><Form.Item label="End Day" name="endDay"><InputNumber min={1} max={31} style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={6}><Form.Item label="End Month" name="endMonth"><InputNumber min={1} max={12} style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Form.Item label="Active" name="isActive" valuePropName="checked" initialValue><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
