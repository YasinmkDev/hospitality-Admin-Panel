import { useEffect, useMemo, useState } from "react";
import { Card, Col, Drawer, Form, InputNumber, Row, Select, Table, Tag, Button, message } from "antd";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { api } from "@/lib/mockApi";
import type { RoomRate, RoomType, Season } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function RoomRates() {
  const [rates, setRates] = useState<RoomRate[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [editing, setEditing] = useState<RoomRate | null>(null);
  const [form] = Form.useForm();

  const load = () => api.roomRate.list().then(setRates);
  useEffect(() => { load(); api.roomType.list().then(setTypes); api.season.list().then(setSeasons); }, []);

  const matrix = useMemo(() => {
    const m = new Map<string, RoomRate>();
    rates.forEach(r => m.set(`${r.roomTypeId}::${r.seasonId}`, r));
    return m;
  }, [rates]);

  const dataSource = types.map(t => {
    const row: any = { key: t.roomTypeId, type: t.roomType };
    seasons.forEach(s => {
      row[s.seasonId] = matrix.get(`${t.roomTypeId}::${s.seasonId}`);
    });
    return row;
  });

  const cols = [
    { title: "Room Type", dataIndex: "type", fixed: "left", width: 180,
      render: (n: string) => <span style={{ fontWeight: 600, color: NAVY, fontFamily: "'Fraunces', serif", fontSize: 16 }}>{n}</span>
    },
    ...seasons.map(s => ({
      title: s.seasonName,
      dataIndex: s.seasonId,
      render: (r: RoomRate | undefined) => r ? (
        <motion.div whileHover={{ scale: 1.04 }} onClick={() => { setEditing(r); form.setFieldsValue(r); }}
          style={{
            padding: 12, borderRadius: 12, cursor: "pointer",
            background: "linear-gradient(135deg, #FFFFFF, #F7F4EE)",
            border: "1px solid rgba(11,31,58,0.06)",
          }}>
          <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1 }}>BASE</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: NAVY }} className="tabular-nums">${Math.round(r.tariff)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>+ ${Math.round(r.tariffTax)} tax</div>
        </motion.div>
      ) : <Tag>—</Tag>
    }))
  ];

  const onSave = async () => {
    const v = await form.validateFields();
    if (!editing) return;
    const updated = { ...editing, ...v };
    await api.roomRate.update(updated);
    message.success("Rate updated");
    setEditing(null);
    load();
  };

  return (
    <div>
      <PageHeader title="Room Rates" subtitle="Per-season tariffs with weekday breakdown" />
      <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
        <Table dataSource={dataSource} columns={cols as any} pagination={false} scroll={{ x: 800 }} />
      </Card>

      <Drawer
        title="Edit Rate"
        width={520}
        open={!!editing}
        onClose={() => setEditing(null)}
        extra={<Button type="primary" onClick={onSave}>Save</Button>}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Base Tariff" name="tariff"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Tax" name="tariffTax"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Half Tariff" name="halfTariff"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Half Tax" name="halfTariffTax"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Extra Adult" name="extraAdultTariff"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Extra Child" name="extraChildTariff"><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: NAVY, margin: "12px 0 8px" }}>Weekday Tariffs</div>
          <Row gutter={8}>
            {[
              ["Mon", "monTariff"], ["Tue", "tueTariff"], ["Wed", "wenTariff"], ["Thu", "thrTariff"],
              ["Fri", "friTariff"], ["Sat", "satTariff"], ["Sun", "sunTariff"],
            ].map(([l, n]) => (
              <Col span={12} key={n}>
                <Form.Item label={l} name={n}><InputNumber prefix="$" style={{ width: "100%" }} /></Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}
