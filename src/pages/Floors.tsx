import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
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
  AppstoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { CardGridSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import { GOLD, NAVY } from "@/lib/theme";
import type { Floor, Room } from "@/lib/types";

export default function Floors() {
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Floor | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.floor.paginate({
        page,
        pageSize,
        search,
        searchFields: ["floorName", "description"],
        sortBy: "floorNumber",
        sortOrder: "asc",
      });
      setFloors(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed loading floors:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.room.list().then(setRooms);
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce((a: Record<string, string>, x: { key: string; value: string }) => ({ ...a, [x.key]: x.value }), {});
    const payload: Floor = {
      floorId: editing?.floorId || newId(),
      ...ctx,
      ...v,
      customFields: cf,
    };
    if (editing) await api.floor.update(payload);
    else await api.floor.add(payload);
    message.success(editing ? "Floor updated" : "Floor added");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Floor Levels"
          subtitle="Configure physical floors, room counts, and level occupancy"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search level name..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            className="w-48 sm:w-56 text-xs rounded-lg"
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
            New Floor
          </Button>
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={4} />
      ) : floors.length === 0 ? (
        <EmptyState
          title="No floors created yet"
          description="Create your first floor level to begin allocating rooms and guest beds."
          actionText="Add Floor"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {floors.map((f, i) => {
            const fRooms = rooms.filter((r) => r.floor === f.floorId);
            const occ = fRooms.filter((r) => r.isOccupied).length;
            const pct = fRooms.length ? Math.round((occ / fRooms.length) * 100) : 0;
            return (
              <Col key={f.floorId} xs={24} sm={12} lg={8} xl={6}>
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
                        padding: "20px 20px 16px",
                        background: `linear-gradient(135deg, ${NAVY} 0%, #16315a 100%)`,
                        color: "#fff",
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="text-slate-300 text-xs tracking-widest font-semibold uppercase">
                            FLOOR {f.floorNumber}
                          </div>
                          <div
                            className="font-serif text-xl sm:text-2xl mt-1 truncate"
                            title={f.floorName}
                          >
                            {f.floorName}
                          </div>
                        </div>
                        <AppstoreOutlined style={{ color: GOLD, fontSize: 20 }} className="shrink-0 mt-1" />
                      </div>
                      <Tag
                        color={f.isActive ? "gold" : "default"}
                        className="mt-3 text-xs font-medium"
                        style={{ color: f.isActive ? NAVY : undefined }}
                      >
                        {f.isActive ? "Active Level" : "Archived"}
                      </Tag>
                    </div>

                    <div className="p-5">
                      <Row gutter={12}>
                        <Col span={12}>
                          <div className="text-[11px] text-slate-400 tracking-wider font-semibold">ROOMS</div>
                          <div className="text-xl sm:text-2xl font-bold text-[#0B1F3A] tabular-nums mt-0.5">
                            {f.numberRoomsOnFloor || fRooms.length}
                          </div>
                        </Col>
                        <Col span={12}>
                          <div className="text-[11px] text-slate-400 tracking-wider font-semibold">BEDS</div>
                          <div className="text-xl sm:text-2xl font-bold text-[#0B1F3A] tabular-nums mt-0.5">
                            {f.numberBedsOnFloor || 0}
                          </div>
                        </Col>
                      </Row>

                      <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <span>Live Occupancy</span>
                        <span className="font-semibold text-[#0B1F3A]">
                          {pct}% ({occ}/{fRooms.length})
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          block
                          icon={<EditOutlined />}
                          onClick={() => onEdit(f)}
                          className="rounded-lg text-xs h-8"
                        >
                          Edit
                        </Button>
                        <Popconfirm
                          title="Delete floor?"
                          description="Are you sure you want to remove this floor level?"
                          onConfirm={() => onDelete(f.floorId)}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger icon={<DeleteOutlined />} className="rounded-lg h-8 px-2.5" />
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Pagination Footer */}
      {!loading && floors.length > 0 && (
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
            showTotal={(tot) => `Total ${tot} floor levels`}
          />
        </div>
      )}

      {/* Responsive Floor Drawer */}
      <Drawer
        title={editing ? "Edit Floor Level" : "Create New Floor"}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 480}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        extra={
          <Button
            type="primary"
            onClick={onSave}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-lg"
          >
            Save Floor
          </Button>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Floor Name"
            name="floorName"
            rules={[{ required: true, message: "Please provide a floor title" }]}
          >
            <Input placeholder="e.g. Garden Terrace" className="rounded-lg" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Floor #"
                name="floorNumber"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber style={{ width: "100%" }} className="rounded-lg" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Rooms" name="numberRoomsOnFloor">
                <InputNumber style={{ width: "100%" }} className="rounded-lg" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Beds" name="numberBedsOnFloor">
                <InputNumber style={{ width: "100%" }} className="rounded-lg" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Floor Description" name="description">
            <Input.TextArea rows={3} placeholder="Floor amenities, elevator access notes..." className="rounded-lg" />
          </Form.Item>

          <Form.Item label="Level Active" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item label="Custom Attributes">
            <CustomFieldsEditor />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
