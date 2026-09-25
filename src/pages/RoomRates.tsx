import { useEffect, useMemo, useState } from "react";
import { Card, Col, Drawer, Form, InputNumber, Row, Table, Tag, Button, message } from "antd";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api } from "@/lib/mockApi";
import type { RoomRate, RoomType, Season } from "@/lib/types";
import { NAVY } from "@/lib/theme";

export default function RoomRates() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RoomRate[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [editing, setEditing] = useState<RoomRate | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    return api.roomRate.list().then((res) => {
      setRates(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    api.roomType.list().then(setTypes);
    api.season.list().then(setSeasons);
  }, []);

  const matrix = useMemo(() => {
    const m = new Map<string, RoomRate>();
    rates.forEach((r) => m.set(`${r.roomTypeId}::${r.seasonId}`, r));
    return m;
  }, [rates]);

  const dataSource = types.map((t) => {
    const row: Record<string, unknown> = { key: t.roomTypeId, type: t.roomType };
    seasons.forEach((s) => {
      row[s.seasonId] = matrix.get(`${t.roomTypeId}::${s.seasonId}`);
    });
    return row;
  });

  const cols = [
    {
      title: "Category",
      dataIndex: "type",
      fixed: "left" as const,
      width: 170,
      render: (n: string) => (
        <span className="font-semibold text-[#0B1F3A] font-serif text-base">{n}</span>
      ),
    },
    ...seasons.map((s) => ({
      title: s.seasonName,
      dataIndex: s.seasonId,
      width: 190,
      render: (r: RoomRate | undefined) =>
        r ? (
          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              setEditing(r);
              form.setFieldsValue(r);
            }}
            className="p-3 rounded-xl cursor-pointer border border-slate-200/70 hover:border-[#0B1F3A] transition shadow-xs bg-gradient-to-br from-white to-[#F7F4EE]"
          >
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Standard Tariff
            </div>
            <div className="text-xl font-bold text-[#0B1F3A] tabular-nums mt-0.5">
              ${Math.round(r.tariff)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              + ${Math.round(r.tariffTax)} tax/night
            </div>
          </motion.div>
        ) : (
          <Tag className="text-xs">No rate defined</Tag>
        ),
    })),
  ];

  const onSave = async () => {
    const v = await form.validateFields();
    if (!editing) return;
    const updated = { ...editing, ...v };
    await api.roomRate.update(updated);
    message.success("Tariff updated successfully");
    setEditing(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Seasonal Room Rates"
        subtitle="Dynamic pricing matrix, weekend multipliers, and seasonal rate plans"
      />

      {loading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : types.length === 0 ? (
        <EmptyState
          title="No room types available"
          description="Create room types first to populate the tariff pricing matrix."
        />
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Click any rate card to adjust weekday and weekend pricing</span>
            <span className="hidden sm:inline">Scroll horizontally for all seasons &rarr;</span>
          </div>
          <Table
            dataSource={dataSource}
            columns={cols}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Responsive Rate Drawer */}
      <Drawer
        title="Edit Seasonal Tariff"
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 500}
        open={!!editing}
        onClose={() => setEditing(null)}
        extra={
          <Button
            type="primary"
            onClick={onSave}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-lg"
          >
            Save Tariff
          </Button>
        }
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item label="Base Tariff" name="tariff" rules={[{ required: true }]}>
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Tariff Tax" name="tariffTax">
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Half Day Tariff" name="halfTariff">
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Half Day Tax" name="halfTariffTax">
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Extra Adult ($)" name="extraAdultTariff">
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Extra Child ($)" name="extraChildTariff">
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <div className="font-serif text-base font-semibold text-[#0B1F3A] mt-4 mb-2 pb-1 border-b border-slate-100">
            Day-by-Day Tariff Adjustments
          </div>
          <Row gutter={8}>
            {[
              ["Monday", "monTariff"],
              ["Tuesday", "tueTariff"],
              ["Wednesday", "wenTariff"],
              ["Thursday", "thrTariff"],
              ["Friday", "friTariff"],
              ["Saturday", "satTariff"],
              ["Sunday", "sunTariff"],
            ].map(([l, n]) => (
              <Col xs={12} sm={8} key={n}>
                <Form.Item label={l} name={n}>
                  <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}
