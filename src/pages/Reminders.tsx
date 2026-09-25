import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Timeline,
  message,
  Pagination,
} from "antd";
import {
  BellFilled,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { ListSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomReminder } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function Reminders() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<RoomReminder[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [filterDone, setFilterDone] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomReminder | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (filterDone !== undefined) filters.isDone = filterDone;

      const res = await api.reminder.paginate({
        page,
        pageSize,
        search,
        searchFields: ["reminderSubject", "reminderDescription"],
        filters,
        sortBy: "reminderStartingTime",
        sortOrder: "desc",
      });
      setList(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed loading reminders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filterDone]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api.room.list().then(setRooms);
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomReminder = {
      roomReminderId: editing?.roomReminderId || newId(),
      ...ctx,
      ...v,
      reminderStartingTime: v.reminderStartingTime?.toISOString(),
      reminderEndingTime: v.reminderEndingTime?.toISOString(),
    };
    if (editing) await api.reminder.update(payload);
    else await api.reminder.add(payload);
    message.success(editing ? "Reminder updated" : "Reminder scheduled");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const toggleDone = async (r: RoomReminder) => {
    const nextDone = !r.isDone;
    await api.reminder.update({ ...r, isDone: nextDone });
    message.success(nextDone ? "Marked as completed" : "Reopened reminder");
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Operational Reminders"
          subtitle="Time-sensitive room alerts, guest amenities, and staff handover tasks"
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
          New Reminder
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="cz-card-shadow mb-5" style={{ border: 0 }} styles={{ body: { padding: "14px 18px" } }}>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search reminder subject..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            className="w-48 sm:w-64 text-xs rounded-lg"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <FilterOutlined /> Status:
          </div>
          <Select
            allowClear
            placeholder="All Alerts"
            className="w-36 text-xs"
            value={filterDone === undefined ? undefined : filterDone ? "done" : "pending"}
            onChange={(v) => {
              setFilterDone(v === "done" ? true : v === "pending" ? false : undefined);
              setPage(1);
            }}
            options={[
              { value: "pending", label: "Pending" },
              { value: "done", label: "Completed" },
            ]}
          />
          {(filterDone !== undefined || search) && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setFilterDone(undefined);
                setSearch("");
                setPage(1);
              }}
              className="text-xs text-slate-500"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <ListSkeleton count={5} />
      ) : list.length === 0 ? (
        <EmptyState
          title="No operational reminders"
          description="Schedule reminders for VIP arrivals, birthday amenity baskets, or room inspections."
          actionText="Add Reminder"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }}>
          <Timeline
            className="pt-2"
            items={list.map((r) => {
              const room = rooms.find((x) => x.roomId === r.roomId);
              return {
                dot: r.isDone ? (
                  <CheckCircleOutlined style={{ color: "#2E9E6E", fontSize: 16 }} />
                ) : (
                  <BellFilled style={{ color: GOLD, fontSize: 16 }} />
                ),
                children: (
                  <div className="bg-slate-50/70 border border-slate-200/60 p-4 rounded-xl mb-4 hover:border-slate-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-serif text-lg font-bold text-[#0B1F3A]">
                            {r.reminderSubject}
                          </span>
                          {r.isEachDay && (
                            <Tag
                              color="gold"
                              style={{ color: NAVY }}
                              icon={<ReloadOutlined />}
                              className="text-xs font-semibold"
                            >
                              Daily Recurrence
                            </Tag>
                          )}
                          {r.isDone ? (
                            <Tag color="green" className="text-xs font-semibold">
                              Completed
                            </Tag>
                          ) : (
                            <Tag color="blue" className="text-xs font-semibold">
                              Pending
                            </Tag>
                          )}
                        </div>

                        {r.reminderDescription && (
                          <div className="text-xs text-slate-600 mt-1">{r.reminderDescription}</div>
                        )}

                        <div className="text-[11px] text-slate-400 mt-2 flex flex-wrap items-center gap-2">
                          <span>
                            {dayjs(r.reminderStartingTime).format("MMM D, h:mm A")} &rarr;{" "}
                            {dayjs(r.reminderEndingTime).format("h:mm A")}
                          </span>
                          {room && (
                            <span className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 font-medium">
                              Room #{room.number}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                        <Button
                          size="small"
                          onClick={() => toggleDone(r)}
                          className="rounded-lg text-xs"
                        >
                          {r.isDone ? "Reopen" : "Done"}
                        </Button>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          className="rounded-lg"
                          onClick={() => {
                            setEditing(r);
                            form.setFieldsValue({
                              ...r,
                              reminderStartingTime: dayjs(r.reminderStartingTime),
                              reminderEndingTime: dayjs(r.reminderEndingTime),
                            });
                            setOpen(true);
                          }}
                        />
                        <Popconfirm
                          title="Delete Reminder?"
                          description="Remove this operational alert?"
                          onConfirm={async () => {
                            await api.reminder.remove(r.roomReminderId);
                            message.success("Reminder removed");
                            load();
                          }}
                          okButtonProps={{ danger: true }}
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} className="rounded-lg" />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                ),
              };
            })}
          />
        </Card>
      )}

      {/* Pagination Footer */}
      {!loading && list.length > 0 && (
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
            showTotal={(tot) => `Total ${tot} operational alerts`}
          />
        </div>
      )}

      {/* Responsive Modal */}
      <Modal
        open={open}
        title={editing ? "Edit Reminder" : "Schedule Room Alert"}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "95%" : 540}
        okText="Save Reminder"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item label="Subject / Action" name="reminderSubject" rules={[{ required: true }]}>
            <Input placeholder="e.g. VIP Champagne Service Setup" className="rounded-lg" />
          </Form.Item>
          <Form.Item label="Instructions" name="reminderDescription">
            <Input.TextArea rows={2} placeholder="Deliver before 4:00 PM check-in..." className="rounded-lg" />
          </Form.Item>
          <Form.Item label="Associated Room" name="roomId" rules={[{ required: true }]}>
            <Select
              options={rooms.map((r) => ({ value: r.roomId, label: `Room #${r.number}` }))}
              className="rounded-lg"
            />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Start Window" name="reminderStartingTime">
                <DatePicker showTime style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="End Window" name="reminderEndingTime">
                <DatePicker showTime style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Repeat Daily" name="isEachDay" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Completed" name="isDone" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
