import { useEffect, useMemo, useState } from "react";
import { Card, Col, Drawer, Form, InputNumber, Row, Select, Table, Tag, Button, Popconfirm, message } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, newId, ctx } from "@/lib/mockApi";
import type { RoomRate, RoomType, Season } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function RoomRates() {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RoomRate[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RoomRate | null>(null);
  const [form] = Form.useForm();

  const load = () =>
    api.roomRate.list().then((res) => { setRates(res); setLoading(false); });

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

  // Open drawer for editing an existing rate
  const openEdit = (r: RoomRate) => {
    setEditing(r);
    form.setFieldsValue(r);
    setDrawerOpen(true);
  };

  // Open drawer for creating a new rate, optionally pre-filling roomTypeId + seasonId
  const openCreate = (roomTypeId?: string, seasonId?: string) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      roomTypeId: roomTypeId ?? undefined,
      seasonId: seasonId ?? undefined,
      tariff: 0, tariffTax: 0, halfTariff: 0, halfTariffTax: 0,
      extraAdultTariff: 25, extraChildTariff: 10,
      monTariff: 0, tueTariff: 0, wenTariff: 0, thrTariff: 0,
      friTariff: 0, satTariff: 0, sunTariff: 0,
      monTariffTax: 0, tueTariffTax: 0, wenTariffTax: 0, thrTariffTax: 0,
      friTariffTax: 0, satTariffTax: 0, sunTariffTax: 0,
      extraAdultTariffTax: 0, extraChildTariffTax: 0,
    });
    setDrawerOpen(true);
  };

  const onSave = async () => {
    const v = await form.validateFields();
    if (editing) {
      await api.roomRate.update({ ...editing, ...v });
      message.success("Tariff updated");
    } else {
      const payload: RoomRate = { rRoomRatesId: newId(), typeId: 0, ...ctx, ...v };
      await api.roomRate.add(payload);
      message.success("Rate created");
    }
    setDrawerOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const onDelete = async (id: string) => {
    await api.roomRate.remove(id);
    message.success("Rate deleted");
    load();
  };

  const dataSource = types.map((t) => {
    const row: Record<string, unknown> = { key: t.roomTypeId, type: t.roomType, roomTypeId: t.roomTypeId };
    seasons.forEach((s) => { row[s.seasonId] = matrix.get(`${t.roomTypeId}::${s.seasonId}`); });
    return row;
  });

  const RateCell = ({ r, row, seasonId }: { r: RoomRate; row: Record<string, unknown>; seasonId: string }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: "relative" }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            padding: 12, borderRadius: 12, border: `1px solid ${hovered ? NAVY : "#e2e8f0"}`,
            background: "linear-gradient(135deg, #fff, #F7F4EE)", transition: "border-color 0.15s",
          }}
        >
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Base Tariff</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>${Math.round(r.tariff)}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>+ ${Math.round(r.tariffTax)} tax/night</div>
        </motion.div>

        {/* Action buttons — always in DOM, opacity controlled by hover state */}
        <div style={{
          position: "absolute", top: 6, right: 6,
          display: "flex", gap: 4,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          transition: "opacity 0.15s",
        }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => { e.stopPropagation(); openEdit(r); }}
            style={{ height: 26, width: 26, padding: 0, fontSize: 11, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
          />
          <Popconfirm
            title="Delete this rate?"
            onConfirm={() => onDelete(r.rRoomRatesId)}
            okButtonProps={{ danger: true }}
            okText="Delete"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
              style={{ height: 26, width: 26, padding: 0, fontSize: 11, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
            />
          </Popconfirm>
        </div>
      </div>
    );
  };

  const cols = [
    {
      title: "Room Type",
      dataIndex: "type",
      fixed: "left" as const,
      width: 160,
      render: (n: string) => (
        <span className="font-semibold text-[#0B1F3A] font-serif text-base">{n}</span>
      ),
    },
    ...seasons.map((s) => ({
      title: s.seasonName,
      dataIndex: s.seasonId,
      width: 200,
      render: (r: RoomRate | undefined, row: Record<string, unknown>) =>
        r ? (
          <RateCell r={r} row={row} seasonId={s.seasonId} />
        ) : (
          <button
            onClick={() => openCreate(row.roomTypeId as string, s.seasonId)}
            className="w-full h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#C9A66B] hover:bg-[#C9A66B]/5 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent"
          >
            <PlusOutlined style={{ color: "#94a3b8", fontSize: 14 }} />
            <span className="text-[10px] text-slate-400 font-medium">Add Rate</span>
          </button>
        ),
    })),
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Seasonal Room Rates"
          subtitle="Dynamic pricing matrix — click a cell to edit or add a new rate"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: NAVY, borderColor: NAVY }}
          className="rounded-xl h-9 font-medium shadow-sm w-full sm:w-auto"
          onClick={() => openCreate()}
        >
          New Rate
        </Button>
      </div>

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
            <span>Hover a rate card to edit or delete · Click empty cells to add a rate</span>
            <span className="hidden sm:inline">Scroll horizontally for all seasons →</span>
          </div>
          <Table dataSource={dataSource} columns={cols} pagination={false} scroll={{ x: 800 }} />
        </Card>
      )}

      <Drawer
        title={editing ? "Edit Seasonal Tariff" : "Create New Rate"}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 520}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); form.resetFields(); }}
        extra={
          <Button type="primary" onClick={onSave} style={{ background: NAVY, borderColor: NAVY }} className="rounded-lg">
            {editing ? "Save Changes" : "Create Rate"}
          </Button>
        }
      >
        <Form layout="vertical" form={form} className="pt-2">
          {/* Room type + season selectors — only shown when creating */}
          {!editing && (
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item label="Room Type" name="roomTypeId" rules={[{ required: true, message: "Select a room type" }]}>
                  <Select
                    placeholder="Select room type"
                    options={types.map((t) => ({ value: t.roomTypeId, label: t.roomType }))}
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Season" name="seasonId" rules={[{ required: true, message: "Select a season" }]}>
                  <Select
                    placeholder="Select season"
                    options={seasons.map((s) => ({ value: s.seasonId, label: s.seasonName }))}
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {editing && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex gap-4">
              <span><span className="font-semibold text-slate-800">Type:</span> {types.find((t) => t.roomTypeId === editing.roomTypeId)?.roomType ?? "—"}</span>
              <span><span className="font-semibold text-slate-800">Season:</span> {seasons.find((s) => s.seasonId === editing.seasonId)?.seasonName ?? "—"}</span>
            </div>
          )}

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
              <Form.Item label="Extra Adult" name="extraAdultTariff">
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Extra Child" name="extraChildTariff">
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <div className="font-serif text-base font-semibold text-[#0B1F3A] mt-2 mb-3 pb-1 border-b border-slate-100">
            Day-by-Day Tariffs
          </div>
          <Row gutter={8}>
            {[
              ["Mon", "monTariff"], ["Tue", "tueTariff"], ["Wed", "wenTariff"],
              ["Thu", "thrTariff"], ["Fri", "friTariff"], ["Sat", "satTariff"], ["Sun", "sunTariff"],
            ].map(([l, n]) => (
              <Col xs={12} sm={8} key={n}>
                <Form.Item label={l} name={n}>
                  <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
                </Form.Item>
              </Col>
            ))}
          </Row>

          {editing && (
            <div className="pt-4 border-t border-slate-100 mt-2">
              <Popconfirm
                title="Delete this rate?"
                description="This will permanently remove the tariff for this room type and season."
                onConfirm={() => { onDelete(editing.rRoomRatesId); setDrawerOpen(false); setEditing(null); }}
                okButtonProps={{ danger: true }}
                okText="Delete Rate"
              >
                <Button danger icon={<DeleteOutlined />} className="rounded-lg w-full">
                  Delete This Rate
                </Button>
              </Popconfirm>
            </div>
          )}
        </Form>
      </Drawer>
    </div>
  );
}
