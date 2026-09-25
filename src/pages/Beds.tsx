import { useEffect, useState, useMemo } from "react";
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
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, FilterOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Bed, Floor, Room } from "@/lib/types";
import { NAVY } from "@/lib/theme";

export default function Beds() {
  const [loading, setLoading] = useState(true);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [filterFloor, setFilterFloor] = useState<string>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bed | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    return api.bed.list().then((res) => {
      setBeds(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    api.room.list().then(setRooms);
    api.floor.list().then(setFloors);
  }, []);

  const filtered = useMemo(() => {
    return beds.filter((b) => !filterFloor || b.floor === filterFloor);
  }, [beds, filterFloor]);

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce(
      (a: Record<string, string>, x: { key: string; value: string }) => ({ ...a, [x.key]: x.value }),
      {}
    );
    const payload: Bed = { bedId: editing?.bedId || newId(), ...ctx, ...v, customFields: cf };
    if (editing) await api.bed.update(payload);
    else await api.bed.add(payload);
    message.success(editing ? "Bed updated" : "Bed added");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const cols = [
    {
      title: "Bed #",
      dataIndex: "number",
      render: (n: string) => <span className="font-semibold text-[#0B1F3A] text-sm">Bed {n}</span>,
    },
    {
      title: "Assigned Room",
      dataIndex: "roomId",
      render: (id: string) => {
        const r = rooms.find((rm) => rm.roomId === id);
        return r ? <span className="font-medium text-slate-700">Room #{r.number}</span> : "—";
      },
    },
    {
      title: "Level",
      dataIndex: "floor",
      render: (id: string) => floors.find((f) => f.floorId === id)?.floorName ?? "—",
    },
    {
      title: "Occupancy",
      dataIndex: "isOccupied",
      render: (b: boolean) => (
        <Tag color={b ? "red" : "green"} className="text-xs font-medium">
          {b ? "Occupied" : "Vacant"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isInactive",
      render: (b: boolean) => (
        <Tag color={b ? "default" : "gold"} className="text-xs font-medium">
          {b ? "Maintenance" : "Operational"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "a",
      width: 110,
      render: (_: unknown, b: Bed) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(b);
              form.setFieldsValue({
                ...b,
                customFields: Object.entries(b.customFields || {}).map(([key, value]) => ({
                  key,
                  value,
                })),
              });
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Delete Bed?"
            description="Remove this bed inventory entry?"
            onConfirm={async () => {
              await api.bed.remove(b.bedId);
              message.success("Bed removed");
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
        <PageHeader title="Bed Inventory" subtitle={`${beds.length} beds allocated across rooms`} />
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
          New Bed
        </Button>
      </div>

      {/* Filter toolbar */}
      <Card
        className="cz-card-shadow mb-5"
        style={{ border: 0 }}
        styles={{ body: { padding: "14px 18px" } }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A]">
            <FilterOutlined /> Filter Level:
          </div>
          <Select
            allowClear
            placeholder="All Floors"
            className="w-48 text-xs"
            value={filterFloor}
            onChange={setFilterFloor}
            options={floors.map((f) => ({ value: f.floorId, label: f.floorName }))}
          />
        </div>
      </Card>

      {loading ? (
        <TableSkeleton columns={6} rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No beds registered"
          description="Add beds to track individual bed assignments for guest rooms."
          actionText="Add Bed"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="bedId"
            dataSource={filtered}
            columns={cols}
            pagination={{ pageSize: 12, responsive: true }}
            scroll={{ x: 620 }}
          />
        </Card>
      )}

      {/* Responsive Bed Modal */}
      <Modal
        title={editing ? "Edit Bed Record" : "Add New Bed"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "95%" : 560}
        okText="Save Bed"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Bed Number / Label" name="number" rules={[{ required: true }]}>
                <Input placeholder="e.g. 101-A" className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Room" name="roomId" rules={[{ required: true }]}>
                <Select
                  options={rooms.map((r) => ({ value: r.roomId, label: `Room #${r.number}` }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Floor" name="floor">
                <Select
                  options={floors.map((f) => ({ value: f.floorId, label: f.floorName }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Adjoining Connect" name="connectRoomId">
                <Select
                  allowClear
                  options={rooms.map((r) => ({ value: r.roomId, label: `Room #${r.number}` }))}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea rows={2} placeholder="King size, pillow top, etc." className="rounded-lg" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={8}>
              <Form.Item label="Occupied" name="isOccupied" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item label="Maintenance" name="isInactive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item label="On Layout" name="isOnlayout" valuePropName="checked" initialValue>
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Custom Attributes">
            <CustomFieldsEditor />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
