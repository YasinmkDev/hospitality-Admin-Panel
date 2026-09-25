import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Switch,
  Tag,
  message,
  Pagination,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CloudFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { CardGridSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Season } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Seasons() {
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.season.paginate({
        page,
        pageSize,
        search,
        searchFields: ["seasonName", "description"],
        sortBy: "startMonth",
        sortOrder: "asc",
      });
      setSeasons(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed loading seasons:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: Season = { seasonId: editing?.seasonId || newId(), ...ctx, ...v };
    if (editing) await api.season.update(payload);
    else await api.season.add(payload);
    message.success(editing ? "Season updated" : "Season created");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const colors = ["#7C5CFF", "#2E9E6E", "#E0A93E", "#E26A6A", GOLD];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Seasons & Periods"
          subtitle="Define peak, shoulder, and low-season periods for rate multipliers"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search season name..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            className="w-48 sm:w-64 text-xs rounded-lg"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-xl h-9 font-medium shadow-sm w-full sm:w-auto"
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setOpen(true);
            }}
          >
            New Season
          </Button>
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : seasons.length === 0 ? (
        <EmptyState
          title="No seasons defined"
          description="Create seasonal periods (e.g. Summer Peak, Winter Holidays) to assign custom rates."
          actionText="Add Season"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <>
          {/* Annual Timeline Visualizer */}
          <Card className="cz-card-shadow mb-6" style={{ border: 0 }}>
            <div className="text-xs font-semibold text-[#0B1F3A] mb-3 flex items-center justify-between">
              <span>Annual Period Coverage</span>
              <span className="text-slate-400 font-normal text-[11px]">12 Month Distribution</span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[580px] relative pb-6">
                <div className="grid grid-cols-12 h-7 rounded-lg overflow-hidden bg-[#F7F4EE] border border-slate-100">
                  {monthNames.map((m, i) => (
                    <div
                      key={m}
                      className={`grid place-items-center text-[10px] font-semibold text-slate-500 uppercase ${
                        i < 11 ? "border-r border-white/80" : ""
                      }`}
                    >
                      {m}
                    </div>
                  ))}
                </div>

                <div className="relative mt-2 h-10">
                  {seasons.map((s, idx) => {
                    const start = s.startMonth - 1 + (s.startDay - 1) / 31;
                    const end = s.endMonth - 1 + (s.endDay - 1) / 31;
                    const wraps = end < start;
                    const segs = wraps
                      ? [
                          [start, 12],
                          [0, end + 1],
                        ]
                      : [[start, end + 1]];

                    return segs.map(([a, b], k) => (
                      <motion.div
                        key={`${s.seasonId}-${k}`}
                        initial={{ opacity: 0, scaleY: 0.8 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="absolute h-8 rounded-lg text-white text-xs font-semibold flex items-center px-2.5 shadow-sm truncate"
                        style={{
                          left: `${(a / 12) * 100}%`,
                          width: `${((b - a) / 12) * 100}%`,
                          background: `linear-gradient(135deg, ${colors[idx % colors.length]}, ${NAVY})`,
                        }}
                      >
                        <span className="truncate">{k === 0 ? s.seasonName : ""}</span>
                      </motion.div>
                    ));
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Season Cards Grid */}
          <Row gutter={[16, 16]}>
            {seasons.map((s, i) => (
              <Col xs={24} sm={12} lg={8} key={s.seasonId}>
                <motion.div
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="cz-card-shadow rounded-2xl border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <CloudFilled
                          style={{ color: colors[i % colors.length], fontSize: 22 }}
                          className="mb-1"
                        />
                        <div className="font-serif text-xl font-bold text-[#0B1F3A] mt-1">
                          {s.seasonName}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {monthNames[s.startMonth - 1]} {s.startDay} &rarr;{" "}
                          {monthNames[s.endMonth - 1]} {s.endDay}
                        </div>
                        {s.description && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-1">{s.description}</p>
                        )}
                      </div>
                      <Tag
                        color={s.isActive ? "gold" : "default"}
                        className="text-xs font-medium"
                        style={{ color: s.isActive ? NAVY : undefined }}
                      >
                        {s.isActive ? "Active" : "Archived"}
                      </Tag>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                      <Button
                        block
                        icon={<EditOutlined />}
                        className="rounded-lg text-xs h-8"
                        onClick={() => {
                          setEditing(s);
                          form.setFieldsValue(s);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete Season?"
                        description="Are you sure you want to remove this season?"
                        onConfirm={async () => {
                          await api.season.remove(s.seasonId);
                          message.success("Season removed");
                          load();
                        }}
                        okButtonProps={{ danger: true }}
                      >
                        <Button danger icon={<DeleteOutlined />} className="rounded-lg h-8 px-2.5" />
                      </Popconfirm>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Pagination Footer */}
      {!loading && seasons.length > 0 && (
        <div className="flex justify-end p-3 bg-white rounded-xl shadow-xs mt-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            pageSizeOptions={["8", "16", "32"]}
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            showTotal={(tot) => `Total ${tot} seasonal periods`}
          />
        </div>
      )}

      {/* Responsive Modal */}
      <Modal
        open={open}
        title={editing ? "Edit Season Period" : "Create New Season"}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "95%" : 500}
        okText="Save Season"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item label="Season Name" name="seasonName" rules={[{ required: true }]}>
            <Input placeholder="e.g. Summer High Season" className="rounded-lg" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} placeholder="Optional notes about tariff strategy..." className="rounded-lg" />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={12} sm={6}>
              <Form.Item label="Start Day" name="startDay" initialValue={1}>
                <InputNumber min={1} max={31} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="Start Month" name="startMonth" initialValue={6}>
                <InputNumber min={1} max={12} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="End Day" name="endDay" initialValue={31}>
                <InputNumber min={1} max={31} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="End Month" name="endMonth" initialValue={8}>
                <InputNumber min={1} max={12} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Active Status" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
