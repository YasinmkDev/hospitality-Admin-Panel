import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { RoomEntryDnr } from "@/lib/types";
import { NAVY, STATUS } from "@/lib/theme";

export default function ReservationsDnr() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<RoomEntryDnr[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomEntryDnr | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    return api.dnr.list().then((res) => {
      setList(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomEntryDnr = {
      roomEntryDnrId: editing?.roomEntryDnrId || newId(),
      customerId: editing?.customerId || newId(),
      dnrId: editing?.dnrId || newId(),
      ...ctx,
      ...v,
    };
    if (editing) await api.dnr.update(payload);
    else await api.dnr.add(payload);
    message.success(editing ? "DNR entry updated" : "Guest flagged in DNR record");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const cols = [
    {
      title: "Flagged Guest",
      dataIndex: "customerName",
      render: (n: string) => (
        <Space>
          <Avatar style={{ background: STATUS.occupied, color: "#fff", fontWeight: 700 }}>
            {n?.[0] || "G"}
          </Avatar>
          <span className="font-semibold text-[#0B1F3A]">{n}</span>
        </Space>
      ),
    },
    {
      title: "Reason / Incident Notes",
      dataIndex: "reason",
      render: (r: string) => <span className="text-xs text-slate-600">{r || "Security incident flagged"}</span>,
    },
    {
      title: "Flag Status",
      dataIndex: "value",
      render: (v: boolean) => (
        <Tag
          color={v ? "red" : "default"}
          icon={<StopOutlined />}
          className="text-xs font-semibold px-2 py-0.5"
        >
          {v ? "Blocked from Booking" : "Resolved / Cleared"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "a",
      width: 110,
      render: (_: unknown, r: RoomEntryDnr) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(r);
              form.setFieldsValue(r);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Remove DNR Flag?"
            description="Allow this guest to make bookings again?"
            onConfirm={async () => {
              await api.dnr.remove(r.roomEntryDnrId);
              message.success("DNR record removed");
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
          title="Do Not Rent (DNR) Registry"
          subtitle="Restricted guest registry to protect hotel property, staff, and guests"
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
          Add DNR Flag
        </Button>
      </div>

      {loading ? (
        <TableSkeleton columns={4} rows={4} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No guests on DNR list"
          description="The restricted registry is currently empty."
          actionText="Add DNR Flag"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="roomEntryDnrId"
            dataSource={list}
            columns={cols}
            pagination={{ pageSize: 10, responsive: true }}
            scroll={{ x: 550 }}
          />
        </Card>
      )}

      <Modal
        open={open}
        title={editing ? "Edit DNR Record" : "Add Guest to DNR Registry"}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "95%" : 500}
        okText="Save Entry"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item
            label="Guest Full Name"
            name="customerName"
            rules={[{ required: true, message: "Guest name is required" }]}
          >
            <Input placeholder="e.g. Johnathan Doe" className="rounded-lg" />
          </Form.Item>
          <Form.Item label="Detailed Reason" name="reason" rules={[{ required: true }]}>
            <Input.TextArea
              rows={3}
              placeholder="Damage to suite, disruptive conduct, unpaid folio charges..."
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item
            label="Active Block"
            name="value"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
