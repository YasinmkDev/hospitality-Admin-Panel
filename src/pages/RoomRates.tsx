import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Col,
  Drawer,
  Form,
  InputNumber,
  Row,
  Select,
  Table,
  Tag,
  Button,
  Popconfirm,
  message,
  Segmented,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, newId, ctx } from "@/lib/mockApi";
import type { RoomRate, RoomType, Season } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function RoomRates() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"Matrix" | "Table">("Matrix");
  const [rates, setRates] = useState<RoomRate[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  // Server-side pagination states for Table view
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState<string>();
  const [filterSeason, setFilterSeason] = useState<string>();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<RoomRate | null>(null);
  const [form] = Form.useForm();

  // Load paginated rates
  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (filterType) filters.roomTypeId = filterType;
      if (filterSeason) filters.seasonId = filterSeason;

      const res = await api.roomRate.paginate({
        page,
        pageSize,
        filters,
        sortBy: "tariff",
        sortOrder: "desc",
      });
      setRates(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed loading rates:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterType, filterSeason]);

  // Load all rates for matrix mode when in matrix view
  const loadAllForMatrix = useCallback(async () => {
    try {
      const all = await api.roomRate.list();
      setRates(all);
    } catch (err) {
      console.error("Failed loading matrix rates:", err);
    }
  }, []);

  useEffect(() => {
    if (view === "Table") {
      loadRates();
    } else {
      loadAllForMatrix();
    }
  }, [view, loadRates, loadAllForMatrix]);

  useEffect(() => {
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

  // Open drawer for creating a new rate
  const openCreate = (roomTypeId?: string, seasonId?: string) => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      roomTypeId: roomTypeId ?? undefined,
      seasonId: seasonId ?? undefined,
      tariff: 0,
      tariffTax: 0,
      halfTariff: 0,
      halfTariffTax: 0,
      extraAdultTariff: 25,
      extraChildTariff: 10,
      monTariff: 0,
      tueTariff: 0,
      wenTariff: 0,
      thrTariff: 0,
      friTariff: 0,
      satTariff: 0,
      sunTariff: 0,
      monTariffTax: 0,
      tueTariffTax: 0,
      wenTariffTax: 0,
      thrTariffTax: 0,
      friTariffTax: 0,
      satTariffTax: 0,
      sunTariffTax: 0,
      extraAdultTariffTax: 0,
      extraChildTariffTax: 0,
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
    if (view === "Table") loadRates();
    else loadAllForMatrix();
  };

  const onDelete = async (id: string) => {
    await api.roomRate.remove(id);
    message.success("Rate deleted");
    if (view === "Table") loadRates();
    else loadAllForMatrix();
  };

  const dataSource = types.map((t) => {
    const row: Record<string, unknown> = { key: t.roomTypeId, type: t.roomType, roomTypeId: t.roomTypeId };
    seasons.forEach((s) => {
      row[s.seasonId] = matrix.get(`${t.roomTypeId}::${s.seasonId}`);
    });
    return row;
  });

  const RateCell = ({ r }: { r: RoomRate }) => {
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
            padding: 12,
            borderRadius: 12,
            border: `1px solid ${hovered ? NAVY : "#e2e8f0"}`,
            background: "linear-gradient(135deg, #fff, #F7F4EE)",
            transition: "border-color 0.15s",
          }}
        >
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Base Tariff
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: NAVY, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
            ${Math.round(r.tariff)}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>+ ${Math.round(r.tariffTax)} tax/night</div>
        </motion.div>

        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            display: "flex",
            gap: 4,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.15s",
          }}
        >
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              openEdit(r);
            }}
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

  const matrixCols = [
    {
      title: "Room Type",
      dataIndex: "type",
      fixed: "left" as const,
      width: 160,
      render: (n: string) => <span className="font-semibold text-[#0B1F3A] font-serif text-base">{n}</span>,
    },
    ...seasons.map((s) => ({
      title: s.seasonName,
      dataIndex: s.seasonId,
      width: 200,
      render: (r: RoomRate | undefined, row: Record<string, unknown>) =>
        r ? (
          <RateCell r={r} />
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

  const tableCols = [
    {
      title: "Room Category",
      dataIndex: "roomTypeId",
      render: (id: string) => (
        <span className="font-semibold text-[#0B1F3A]">
          {types.find((t) => t.roomTypeId === id)?.roomType || "—"}
        </span>
      ),
    },
    {
      title: "Seasonal Period",
      dataIndex: "seasonId",
      render: (id: string) => (
        <Tag color="gold" style={{ color: NAVY }} className="font-medium">
          {seasons.find((s) => s.seasonId === id)?.seasonName || "—"}
        </Tag>
      ),
    },
    {
      title: "Standard Tariff",
      dataIndex: "tariff",
      render: (v: number) => <span className="font-bold text-[#0B1F3A] tabular-nums">${v}</span>,
    },
    {
      title: "Tax / Night",
      dataIndex: "tariffTax",
      render: (v: number) => <span className="tabular-nums text-slate-500">${v}</span>,
    },
    {
      title: "Extra Adult / Child",
      render: (_: unknown, r: RoomRate) => (
        <span className="text-xs text-slate-600">
          +${r.extraAdultTariff} / +${r.extraChildTariff}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (_: unknown, r: RoomRate) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm
            title="Delete this rate?"
            onConfirm={() => onDelete(r.rRoomRatesId)}
            okButtonProps={{ danger: true }}
            okText="Delete"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Seasonal Room Rates"
          subtitle="Dynamic pricing matrix and server-paginated tariff schedule"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            options={["Matrix", "Table"]}
            value={view}
            onChange={(v) => setView(v as "Matrix" | "Table")}
            className="p-1 bg-white border border-slate-200"
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
      </div>

      {view === "Table" && (
        <Card className="cz-card-shadow mb-5" style={{ border: 0 }} styles={{ body: { padding: "14px 18px" } }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <FilterOutlined /> Filter By:
            </div>
            <Select
              allowClear
              placeholder="All Room Categories"
              className="w-48 text-xs"
              value={filterType}
              onChange={(v) => {
                setFilterType(v);
                setPage(1);
              }}
              options={types.map((t) => ({ value: t.roomTypeId, label: t.roomType }))}
            />
            <Select
              allowClear
              placeholder="All Seasons"
              className="w-48 text-xs"
              value={filterSeason}
              onChange={(v) => {
                setFilterSeason(v);
                setPage(1);
              }}
              options={seasons.map((s) => ({ value: s.seasonId, label: s.seasonName }))}
            />
            {(filterType || filterSeason) && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setFilterType(undefined);
                  setFilterSeason(undefined);
                  setPage(1);
                }}
                className="text-xs text-slate-500"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </Card>
      )}

      {loading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : types.length === 0 ? (
        <EmptyState
          title="No room types available"
          description="Create room types first to populate the tariff pricing matrix."
        />
      ) : view === "Matrix" ? (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Hover a rate card to edit or delete · Click empty cells to add a rate</span>
            <span className="hidden sm:inline">Scroll horizontally for all seasons →</span>
          </div>
          <Table dataSource={dataSource} columns={matrixCols} pagination={false} scroll={{ x: 800 }} />
        </Card>
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="rRoomRatesId"
            dataSource={rates}
            columns={tableCols}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showTotal: (tot) => `Total ${tot} tariff records`,
              responsive: true,
            }}
            scroll={{ x: 750 }}
          />
        </Card>
      )}

      <Drawer
        title={editing ? "Edit Seasonal Tariff" : "Create New Rate"}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 520}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        extra={
          <Button type="primary" onClick={onSave} style={{ background: NAVY, borderColor: NAVY }} className="rounded-lg">
            {editing ? "Save Changes" : "Create Rate"}
          </Button>
        }
      >
        <Form layout="vertical" form={form} className="pt-2">
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
              <span>
                <span className="font-semibold text-slate-800">Type:</span>{" "}
                {types.find((t) => t.roomTypeId === editing.roomTypeId)?.roomType ?? "—"}
              </span>
              <span>
                <span className="font-semibold text-slate-800">Season:</span>{" "}
                {seasons.find((s) => s.seasonId === editing.seasonId)?.seasonName ?? "—"}
              </span>
            </div>
          )}

          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item label="Base Tariff" name="tariff" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full rounded-lg" prefix="$" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Tariff Tax" name="tariffTax">
                <InputNumber min={0} className="w-full rounded-lg" prefix="$" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item label="Extra Adult Tariff" name="extraAdultTariff">
                <InputNumber min={0} className="w-full rounded-lg" prefix="$" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Extra Child Tariff" name="extraChildTariff">
                <InputNumber min={0} className="w-full rounded-lg" prefix="$" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}
