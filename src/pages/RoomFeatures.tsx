import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomFeature } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function RoomFeatures() {
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<RoomFeature[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomFeature | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.roomFeature.paginate({
        page,
        pageSize,
        search,
        searchFields: ["name"],
        sortBy: "name",
        sortOrder: "asc",
      });
      setFeatures(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed loading features:", err);
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
    const payload: RoomFeature = {
      rRoomFeaturesId: editing?.rRoomFeaturesId || newId(),
      roomFeatureId: editing?.roomFeatureId || newId(),
      objectType: 1,
      ...ctx,
      ...v,
    };
    if (editing) await api.roomFeature.update(payload);
    else await api.roomFeature.add(payload);
    message.success(editing ? "Feature updated" : "Feature added");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const cols = [
    {
      title: "Feature / Amenity",
      dataIndex: "name",
      render: (n: string) => (
        <Space>
          <StarFilled style={{ color: GOLD }} />
          <span className="font-semibold text-[#0B1F3A]">{n}</span>
        </Space>
      ),
    },
    {
      title: "Assigned Room",
      dataIndex: "objectId",
      render: (id: string) => {
        const r = rooms.find((rm) => rm.roomId === id);
        return r ? <span className="font-medium text-slate-700">Room #{r.number}</span> : "All Rooms";
      },
    },
    {
      title: "Object Type",
      dataIndex: "objectType",
      render: (t: number) => (
        <Tag color="blue" className="text-xs font-medium">
          {t === 1 ? "Room Level" : "Bed Level"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "a",
      width: 110,
      render: (_: unknown, f: RoomFeature) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(f);
              form.setFieldsValue(f);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Delete Feature?"
            description="Remove this feature linkage?"
            onConfirm={async () => {
              await api.roomFeature.remove(f.rRoomFeaturesId);
              message.success("Feature removed");
              load();
            }}
            okButtonProps={{ danger: true }}
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
          title="Room Features & Amenities"
          subtitle="Catalogue of in-room luxury amenities and architectural highlights"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search feature..."
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
            New Feature
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton columns={4} rows={6} />
      ) : features.length === 0 ? (
        <EmptyState
          title="No features listed"
          description="Add features like Balcony, Ocean View, or Spa Bath to highlight in rooms."
          actionText="Add Feature"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="rRoomFeaturesId"
            dataSource={features}
            columns={cols}
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
              showTotal: (tot) => `Total ${tot} room features`,
              responsive: true,
            }}
            scroll={{ x: 550 }}
          />
        </Card>
      )}

      <Modal
        open={open}
        title={editing ? "Edit Room Feature" : "Register New Feature"}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "95%" : 500}
        okText="Save Feature"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item label="Feature Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Panoramic Ocean Terrace" className="rounded-lg" />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Linked Room" name="objectId" rules={[{ required: true }]}>
                <Select
                  options={rooms.map((r) => ({ value: r.roomId, label: `Room #${r.number}` }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Scope Type" name="objectType" initialValue={1}>
                <Select
                  options={[
                    { value: 1, label: "Room Level" },
                    { value: 2, label: "Bed Level" },
                  ]}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
