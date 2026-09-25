import { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomEntry } from "@/lib/types";
import { RESERVATION_STATUS_LABELS } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

const statusTagColor = (s: number) => ["gold", "green", "default", "red"][s] || "default";

export default function Reservations() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<RoomEntry[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchGuest, setSearchGuest] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<RoomEntry | null>(null);
  const [editing, setEditing] = useState<RoomEntry | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    return api.reservation.list().then((res) => {
      setList(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    api.room.list().then(setRooms);
  }, []);

  const filtered = useMemo(() => {
    return list.filter((r) => {
      const matchSearch =
        !searchGuest ||
        r.customerName?.toLowerCase().includes(searchGuest.toLowerCase()) ||
        r.registrationNo?.toLowerCase().includes(searchGuest.toLowerCase());
      const matchStatus = statusFilter === undefined || r.reservationStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [list, searchGuest, statusFilter]);

  const onSave = async () => {
    const v = await form.validateFields();
    const payload: RoomEntry = {
      roomEntryId: editing?.roomEntryId || newId(),
      ...ctx,
      ...v,
      arrivalDate: v.arrivalDate?.toISOString(),
      departureDate: v.departureDate?.toISOString(),
      customerId: editing?.customerId || newId(),
      roomEntryNo: editing?.roomEntryNo || Math.floor(Math.random() * 9000 + 1000),
    };
    if (editing) await api.reservation.update(payload);
    else await api.reservation.add(payload);
    message.success(editing ? "Reservation updated" : "Reservation confirmed");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const handleQuickStatusChange = async (r: RoomEntry, newStatus: number) => {
    const updated = { ...r, reservationStatus: newStatus };
    await api.reservation.update(updated);
    message.success(`Status updated to ${RESERVATION_STATUS_LABELS[newStatus]}`);
    load();
  };

  const cols = [
    {
      title: "Guest Details",
      dataIndex: "customerName",
      render: (n: string, r: RoomEntry) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="small" style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>
            {n?.[0] || "G"}
          </Avatar>
          <div>
            <div className="font-semibold text-[#0B1F3A] text-sm">{n || "Valued Guest"}</div>
            <div className="text-[11px] text-slate-400">Reg: {r.registrationNo}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Assigned Room",
      dataIndex: "roomId",
      render: (id: string) => {
        const rm = rooms.find((r) => r.roomId === id);
        return rm ? (
          <span className="font-semibold text-slate-800">Room #{rm.number}</span>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        );
      },
    },
    {
      title: "Stay Window",
      dataIndex: "arrivalDate",
      render: (d: string, r: RoomEntry) => (
        <div className="text-xs">
          <div className="font-medium text-slate-700">
            {dayjs(d).format("MMM D")} &rarr; {dayjs(r.departureDate).format("MMM D")}
          </div>
          <div className="text-slate-400 text-[11px]">{r.noNights} Nights</div>
        </div>
      ),
    },
    {
      title: "Guests",
      render: (_: unknown, r: RoomEntry) => (
        <span className="text-xs text-slate-600 tabular-nums">
          {r.adultNo} Adults{r.childNo ? `, ${r.childNo} Kids` : ""}
        </span>
      ),
    },
    {
      title: "Folio Total",
      dataIndex: "totalOrder",
      render: (v: number) => (
        <span className="font-semibold text-[#0B1F3A] tabular-nums text-sm">
          ${v?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "reservationStatus",
      render: (s: number) => (
        <Tag color={statusTagColor(s)} className="text-xs font-semibold px-2 py-0.5">
          {RESERVATION_STATUS_LABELS[s] || "Reserved"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "a",
      fixed: "right" as const,
      width: 170,
      render: (_: unknown, r: RoomEntry) => (
        <Space size="small">
          {r.reservationStatus === 0 && (
            <Button
              size="small"
              icon={<CheckOutlined />}
              title="Check In Guest"
              onClick={() => handleQuickStatusChange(r, 1)}
              style={{ color: "#2E9E6E" }}
            />
          )}
          {r.reservationStatus === 1 && (
            <Button
              size="small"
              icon={<LogoutOutlined />}
              title="Check Out Guest"
              onClick={() => handleQuickStatusChange(r, 2)}
              style={{ color: "#E26A6A" }}
            />
          )}
          <Button size="small" onClick={() => setDetail(r)}>
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(r);
              form.setFieldsValue({
                ...r,
                arrivalDate: dayjs(r.arrivalDate),
                departureDate: dayjs(r.departureDate),
              });
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Cancel & Delete Reservation?"
            description="Are you sure you want to remove this booking?"
            onConfirm={async () => {
              await api.reservation.remove(r.roomEntryId);
              message.success("Reservation removed");
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
          title="Guest Reservations"
          subtitle={`${list.length} booking entries across all dates`}
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
          New Booking
        </Button>
      </div>

      {/* Filter toolbar */}
      <Card
        className="cz-card-shadow mb-5"
        style={{ border: 0 }}
        styles={{ body: { padding: "14px 18px" } }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search guest or reg #..."
            className="w-full sm:w-64 text-xs rounded-xl"
            value={searchGuest}
            onChange={(e) => setSearchGuest(e.target.value)}
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <FilterOutlined /> Status:
          </div>
          <Select
            allowClear
            placeholder="All Statuses"
            className="w-36 text-xs"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 0, label: "Reserved" },
              { value: 1, label: "Checked-In" },
              { value: 2, label: "Checked-Out" },
              { value: 3, label: "Cancelled" },
            ]}
          />
        </div>
      </Card>

      {loading ? (
        <TableSkeleton columns={7} rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No reservations found"
          description="Create a new guest booking or clear your search criteria."
          actionText="New Reservation"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="roomEntryId"
            dataSource={filtered}
            columns={cols}
            pagination={{ pageSize: 10, responsive: true }}
            scroll={{ x: 840 }}
          />
        </Card>
      )}

      {/* Responsive Booking Drawer */}
      <Drawer
        title={editing ? "Edit Booking Details" : "Create New Reservation"}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 580}
        extra={
          <Button
            type="primary"
            onClick={onSave}
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-lg"
          >
            Confirm Booking
          </Button>
        }
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Tabs
            items={[
              {
                key: "g",
                label: "Guest Information",
                children: (
                  <div className="space-y-2 pt-1">
                    <Form.Item
                      label="Guest Full Name"
                      name="customerName"
                      rules={[{ required: true, message: "Please provide guest name" }]}
                    >
                      <Input placeholder="e.g. Lady Evelyn Montgomery" className="rounded-lg" />
                    </Form.Item>
                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Registration #" name="registrationNo" initialValue={`REG-${Date.now().toString().slice(-4)}`}>
                          <Input className="rounded-lg" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Voucher #" name="voucherNo" initialValue={`V-${Date.now().toString().slice(-4)}`}>
                          <Input className="rounded-lg" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: "s",
                label: "Stay & Allocation",
                children: (
                  <div className="space-y-1 pt-1">
                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Assign Room" name="roomId">
                          <Select
                            placeholder="Select Room"
                            options={rooms.map((r) => ({
                              value: r.roomId,
                              label: `Room #${r.number} (${r.reservationStatus || "Available"})`,
                            }))}
                            className="rounded-lg"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Booking Status" name="reservationStatus" initialValue={0}>
                          <Select
                            options={Object.entries(RESERVATION_STATUS_LABELS).map(([v, l]) => ({
                              value: +v,
                              label: l,
                            }))}
                            className="rounded-lg"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Arrival Date" name="arrivalDate" rules={[{ required: true }]}>
                          <DatePicker showTime style={{ width: "100%" }} className="rounded-lg" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="Departure Date" name="departureDate" rules={[{ required: true }]}>
                          <DatePicker showTime style={{ width: "100%" }} className="rounded-lg" />
                        </Form.Item>
                      </Col>
                      <Col xs={8}>
                        <Form.Item label="Nights" name="noNights" initialValue={2}>
                          <InputNumber min={1} style={{ width: "100%" }} className="rounded-lg" />
                        </Form.Item>
                      </Col>
                      <Col xs={8}>
                        <Form.Item label="Adults" name="adultNo" initialValue={2}>
                          <InputNumber min={1} style={{ width: "100%" }} className="rounded-lg" />
                        </Form.Item>
                      </Col>
                      <Col xs={8}>
                        <Form.Item label="Children" name="childNo" initialValue={0}>
                          <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: "b",
                label: "Folio & Rates",
                children: (
                  <Row gutter={12} className="pt-1">
                    <Col xs={24} sm={12}>
                      <Form.Item label="Total Folio Amount" name="totalOrder" initialValue={380}>
                        <InputNumber prefix="$" min={0} style={{ width: "100%" }} className="rounded-lg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="Room Charges Total" name="totalOrderRooms" initialValue={320}>
                        <InputNumber prefix="$" min={0} style={{ width: "100%" }} className="rounded-lg" />
                      </Form.Item>
                    </Col>
                  </Row>
                ),
              },
            ]}
          />
          <Form.Item label="Guest Notes / Concierge Instructions" name="remarks">
            <Input.TextArea rows={2} placeholder="Late check-in, allergy notes, airport transfer..." className="rounded-lg" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Reservation Detail View Drawer */}
      <Drawer
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 520}
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Booking #${detail.registrationNo}` : ""}
      >
        {detail && (
          <div className="space-y-4">
            <Card className="cz-grain rounded-xl" style={{ background: NAVY, color: "#fff", border: 0 }}>
              <div className="flex items-center gap-3">
                <Avatar size={48} style={{ background: GOLD, color: NAVY, fontWeight: 700 }} icon={<UserOutlined />}>
                  {detail.customerName?.[0]}
                </Avatar>
                <div>
                  <div className="font-serif text-2xl font-bold">{detail.customerName}</div>
                  <div className="opacity-80 text-xs mt-0.5">
                    {dayjs(detail.arrivalDate).format("MMM D")} &rarr; {dayjs(detail.departureDate).format("MMM D, YYYY")}
                  </div>
                </div>
              </div>
            </Card>

            <div className="px-2 pt-2">
              <div className="text-xs font-semibold text-slate-500 mb-2">Guest Journey Status:</div>
              <Steps
                current={detail.reservationStatus}
                items={[
                  { title: "Reserved" },
                  { title: "Checked-In" },
                  { title: "Checked-Out" },
                  { title: "Settled" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                ["Assigned Room", rooms.find((r) => r.roomId === detail.roomId)?.number || "Unassigned"],
                ["Total Stay", `${detail.noNights} Nights`],
                ["Party Size", `${detail.adultNo} Adults, ${detail.childNo} Kids`],
                ["Folio Balance", `$${detail.totalOrder?.toLocaleString() || 0}`],
                ["Settlement Status", detail.isPaid ? "Pre-Paid" : "Pending Departure"],
                ["Voucher Reference", detail.voucherNo || "Direct Booking"],
              ].map(([k, v]) => (
                <div key={k as string} className="p-3 bg-slate-50 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                    {k as string}
                  </div>
                  <div className="font-semibold text-[#0B1F3A] text-sm mt-0.5">{String(v)}</div>
                </div>
              ))}
            </div>

            {detail.remarks && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Guest Remarks:</span>
                {detail.remarks}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
