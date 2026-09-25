import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Modal,
  Button,
  Form,
  Input,
  InputNumber,
  Drawer,
  Popconfirm,
  Pagination,
  message,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClearOutlined,
  SearchOutlined,
  AppstoreOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { FloorPlanSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { api, ctx, newId } from "@/lib/mockApi";
import { GOLD, NAVY, STATUS, numberToHex } from "@/lib/theme";
import type { Floor, Room, RoomType, HouseKeeping } from "@/lib/types";

const statusColor = (s?: string) =>
  s === "Available"
    ? STATUS.vacant
    : s === "Occupied"
    ? STATUS.occupied
    : s === "Cleaning"
    ? STATUS.cleaning
    : STATUS.reserved;

export default function RoomLayout() {
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [floorId, setFloorId] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Paginated rooms state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);
  const [total, setTotal] = useState<number>(0);

  // Selected room for overview / quick status update
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Drawer states for Create & Edit
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Load floors and room types once
  useEffect(() => {
    let mounted = true;
    Promise.all([api.floor.list(), api.roomType.list()])
      .then(([f, t]) => {
        if (mounted) {
          setFloors(f);
          setTypes(t);
          if (f.length > 0) {
            setFloorId(f[0].floorId);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Server-side paginated room loading for current floor
  const fetchFloorRooms = useCallback(
    async (targetFloorId?: string, targetPage = page, targetPageSize = pageSize) => {
      const fId = targetFloorId || floorId;
      if (!fId) return;

      setRoomsLoading(true);
      try {
        const filters: Record<string, unknown> = { floor: fId };
        if (statusFilter && statusFilter !== "all") {
          filters.reservationStatus = statusFilter;
        }

        const res = await api.room.paginate({
          page: targetPage,
          pageSize: targetPageSize,
          filters,
          search: searchQuery,
          searchFields: ["number", "remarks", "phoneExtension"],
          sortBy: "number",
          sortOrder: "asc",
        });

        setRooms(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error("Failed fetching floor layout rooms:", err);
      } finally {
        setRoomsLoading(false);
      }
    },
    [floorId, statusFilter, searchQuery, page, pageSize]
  );

  useEffect(() => {
    if (floorId) {
      fetchFloorRooms(floorId, page, pageSize);
    }
  }, [floorId, statusFilter, page, pageSize, fetchFloorRooms]);

  // Handle floor switch
  const handleFloorChange = (newFloorId: string) => {
    setFloorId(newFloorId);
    setPage(1);
  };

  // Quick status change handler
  const handleQuickStatusChange = async (room: Room, newStatus: string) => {
    try {
      const updated = {
        ...room,
        reservationStatus: newStatus,
        isOccupied: newStatus === "Occupied",
      };
      await api.room.update(updated);
      message.success(`Room #${room.number} marked as ${newStatus}`);
      if (selectedRoom?.roomId === room.roomId) {
        setSelectedRoom(updated);
      }
      fetchFloorRooms();
    } catch {
      message.error("Failed updating room status");
    }
  };

  // Quick Housekeeping Dispatch
  const handleScheduleCleaning = async (room: Room) => {
    try {
      const updatedRoom = {
        ...room,
        reservationStatus: "Cleaning",
        isOccupied: false,
      };
      await api.room.update(updatedRoom);

      const hkTask: HouseKeeping = {
        houseKeepingId: newId(),
        objectId: room.roomId,
        objectTypeId: newId(),
        status: 0, // Turnover Pending
        jobStartDate: new Date().toISOString(),
        notes: `Turnover requested from Floor Plan for Room #${room.number}`,
        assignee: "Housekeeping Staff",
        ...ctx,
      };
      await api.houseKeeping.add(hkTask);

      message.success(`Housekeeping dispatched for Room #${room.number}`);
      if (selectedRoom?.roomId === room.roomId) {
        setSelectedRoom(updatedRoom);
      }
      fetchFloorRooms();
    } catch {
      message.error("Failed to schedule housekeeping");
    }
  };

  // Create room on this floor
  const handleCreateRoom = async () => {
    try {
      const v = await createForm.validateFields();
      const cf = (v.customFields || []).reduce(
        (a: Record<string, string>, x: { key: string; value: string }) => ({
          ...a,
          [x.key]: x.value,
        }),
        {}
      );

      const payload: Room = {
        roomId: newId(),
        floor: floorId || "",
        isOnlayout: true,
        isOccupied: v.reservationStatus === "Occupied",
        ...ctx,
        ...v,
        customFields: cf,
      };

      await api.room.add(payload);
      message.success(`Room #${v.number} registered on ${activeFloor?.floorName}`);
      setCreateDrawerOpen(false);
      createForm.resetFields();
      fetchFloorRooms();
    } catch {
      // validation error
    }
  };

  // Edit existing room
  const handleOpenEdit = (room: Room) => {
    setRoomToEdit(room);
    editForm.setFieldsValue({
      ...room,
      customFields: Object.entries(room.customFields || {}).map(([key, value]) => ({
        key,
        value,
      })),
    });
    setEditDrawerOpen(true);
    setSelectedRoom(null);
  };

  const handleSaveEdit = async () => {
    if (!roomToEdit) return;
    try {
      const v = await editForm.validateFields();
      const cf = (v.customFields || []).reduce(
        (a: Record<string, string>, x: { key: string; value: string }) => ({
          ...a,
          [x.key]: x.value,
        }),
        {}
      );

      const payload: Room = {
        ...roomToEdit,
        ...v,
        isOccupied: v.reservationStatus === "Occupied",
        customFields: cf,
      };

      await api.room.update(payload);
      message.success(`Room #${payload.number} updated successfully`);
      setEditDrawerOpen(false);
      setRoomToEdit(null);
      editForm.resetFields();
      fetchFloorRooms();
    } catch {
      // validation error
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId: string) => {
    try {
      await api.room.remove(roomId);
      message.success("Room removed from floor");
      setSelectedRoom(null);
      fetchFloorRooms();
    } catch {
      message.error("Failed to delete room");
    }
  };

  const activeFloor = floors.find((f) => f.floorId === floorId);

  // Status breakdown on current floor page
  const counts = {
    available: rooms.filter((r) => r.reservationStatus === "Available" || !r.reservationStatus).length,
    occupied: rooms.filter((r) => r.reservationStatus === "Occupied").length,
    cleaning: rooms.filter((r) => r.reservationStatus === "Cleaning").length,
    reserved: rooms.filter((r) => r.reservationStatus === "Reserved").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Floor Selector & Add Room action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Floor Plan Layout"
          subtitle={`Interactive visual matrix of room occupancy and live statuses on Level ${activeFloor?.floorNumber || 1}`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={floorId}
            onChange={handleFloorChange}
            className="w-full sm:w-64"
            size="large"
            options={floors.map((f) => ({
              value: f.floorId,
              label: `${f.floorName} (Level ${f.floorNumber})`,
            }))}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ background: NAVY, borderColor: NAVY }}
            className="rounded-xl font-medium shadow-sm"
            onClick={() => {
              createForm.resetFields();
              createForm.setFieldsValue({
                floor: floorId,
                bedcount: 1,
                adultsNo: 2,
                childNo: 0,
                reservationStatus: "Available",
                isOnlayout: true,
              });
              setCreateDrawerOpen(true);
            }}
          >
            Add Room to Level
          </Button>
        </div>
      </div>

      {loading ? (
        <FloorPlanSkeleton />
      ) : floors.length === 0 ? (
        <EmptyState
          title="No building levels found"
          description="Create at least one floor level in Floor Management before inspecting layouts."
        />
      ) : (
        <Card className="cz-card-shadow cz-grain" style={{ border: 0, background: "#fff" }}>
          {/* Controls & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            {/* Search & Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search room number..."
                prefix={<SearchOutlined className="text-slate-400" />}
                className="w-48 sm:w-56 text-xs rounded-lg"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                allowClear
              />
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
              {[
                { key: "all", label: "All Rooms" },
                { key: "Available", label: `Available (${counts.available})`, color: STATUS.vacant },
                { key: "Occupied", label: `Occupied (${counts.occupied})`, color: STATUS.occupied },
                { key: "Cleaning", label: `Cleaning (${counts.cleaning})`, color: STATUS.cleaning },
                { key: "Reserved", label: `Reserved (${counts.reserved})`, color: STATUS.reserved },
              ].map((pill) => {
                const active = statusFilter === pill.key;
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(pill.key);
                      setPage(1);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      active
                        ? "bg-[#0B1F3A] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Total Indicator */}
            <div className="text-xs text-slate-400 font-medium">
              Showing {rooms.length} of {total} rooms on {activeFloor?.floorName || "level"}
            </div>
          </div>

          {/* Matrix Grid */}
          {roomsLoading ? (
            <FloorPlanSkeleton />
          ) : rooms.length === 0 ? (
            <EmptyState
              title={`No rooms found on ${activeFloor?.floorName}`}
              description="Add rooms to this level using the 'Add Room to Level' button or adjust your filter."
              actionText="Register Room on this Floor"
              onAction={() => {
                createForm.resetFields();
                createForm.setFieldsValue({
                  floor: floorId,
                  bedcount: 1,
                  adultsNo: 2,
                  childNo: 0,
                  reservationStatus: "Available",
                  isOnlayout: true,
                });
                setCreateDrawerOpen(true);
              }}
            />
          ) : (
            <>
              <Row gutter={[12, 12]}>
                {rooms.map((r, i) => {
                  const t = types.find((tp) => tp.roomTypeId === r.roomTypeId);
                  const sCol = statusColor(r.reservationStatus);

                  return (
                    <Col key={r.roomId} xs={12} sm={8} md={6} lg={4} xl={3}>
                      <Tooltip
                        title={
                          <div className="p-1">
                            <div className="font-bold text-sm">Room #{r.number}</div>
                            <div className="text-xs opacity-90">
                              {t?.roomType || "Standard"} · {r.bedcount} Bed(s)
                            </div>
                            <div className="text-xs mt-1">Status: {r.reservationStatus || "Available"}</div>
                            <div className="text-[10px] text-amber-200 mt-1">Click to manage & update</div>
                          </div>
                        }
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.015 }}
                          whileHover={{ y: -3, scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRoom(r)}
                          className="rounded-2xl p-3.5 text-white cursor-pointer relative min-h-[96px] shadow-sm select-none flex flex-col justify-between hover:shadow-md transition-shadow"
                          style={{
                            background: `linear-gradient(135deg, ${numberToHex(t?.color)}, ${NAVY})`,
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-serif text-2xl font-bold tracking-tight">
                              {r.number}
                            </div>
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                background: sCol,
                                boxShadow: `0 0 8px ${sCol}`,
                              }}
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[11px] opacity-90">
                            <span className="truncate max-w-[70%] font-medium">
                              {t?.roomType || "Standard"}
                            </span>
                            <span className="tabular-nums font-semibold bg-white/15 px-1.5 py-0.5 rounded text-[10px]">
                              {r.bedcount}B
                            </span>
                          </div>
                        </motion.div>
                      </Tooltip>
                    </Col>
                  );
                })}
              </Row>

              {/* Server-side Pagination Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.max(1, Math.ceil(total / pageSize))}
                  </span>{" "}
                  ({total} total rooms registered on Level {activeFloor?.floorNumber})
                </div>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger
                  pageSizeOptions={["12", "24", "48", "96"]}
                  onChange={(p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                  }}
                  size="small"
                />
              </div>
            </>
          )}
        </Card>
      )}

      {/* Interactive Quick Room Overview & Quick Update Modal */}
      <Modal
        title={
          selectedRoom ? (
            <div className="flex items-center justify-between pr-6">
              <span className="font-serif text-lg font-bold text-[#0B1F3A]">
                Room #{selectedRoom.number} Overview
              </span>
              <Tag
                color={
                  selectedRoom.reservationStatus === "Occupied"
                    ? "red"
                    : selectedRoom.reservationStatus === "Cleaning"
                    ? "orange"
                    : selectedRoom.reservationStatus === "Reserved"
                    ? "blue"
                    : "green"
                }
                className="text-xs font-semibold px-2.5 py-0.5"
              >
                ● {selectedRoom.reservationStatus || "Available"}
              </Tag>
            </div>
          ) : (
            "Room Overview"
          )
        }
        open={!!selectedRoom}
        onCancel={() => setSelectedRoom(null)}
        footer={null}
        width={460}
      >
        {selectedRoom && (
          <div className="py-2 space-y-4">
            {/* Quick Status Update Section */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-600">Quick Status Update:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { status: "Available", color: "green" },
                  { status: "Occupied", color: "red" },
                  { status: "Cleaning", color: "orange" },
                  { status: "Reserved", color: "blue" },
                ].map((s) => (
                  <Button
                    key={s.status}
                    size="small"
                    className={`text-xs font-medium rounded-lg h-8 ${
                      selectedRoom.reservationStatus === s.status
                        ? "border-[#0B1F3A] bg-white font-bold shadow-xs"
                        : ""
                    }`}
                    onClick={() => handleQuickStatusChange(selectedRoom, s.status)}
                  >
                    {s.status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Room Specifications Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 border border-slate-100 rounded-lg bg-white">
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {types.find((t) => t.roomTypeId === selectedRoom.roomTypeId)?.roomType || "Standard"}
                </span>
              </div>
              <div className="p-2.5 border border-slate-100 rounded-lg bg-white">
                <span className="text-slate-400 block">Total Beds</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedRoom.bedcount} Bed(s)
                </span>
              </div>
              <div className="p-2.5 border border-slate-100 rounded-lg bg-white">
                <span className="text-slate-400 block">Guest Capacity</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedRoom.adultsNo} Adults, {selectedRoom.childNo} Kids
                </span>
              </div>
              <div className="p-2.5 border border-slate-100 rounded-lg bg-white">
                <span className="text-slate-400 block">Phone Extension</span>
                <span className="font-semibold text-slate-800 font-mono text-sm">
                  {selectedRoom.phoneExtension || "—"}
                </span>
              </div>
            </div>

            {selectedRoom.remarks && (
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Remarks / Notes:</span>
                {selectedRoom.remarks}
              </div>
            )}

            <Divider className="my-2" />

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button
                icon={<ClearOutlined />}
                size="middle"
                className="rounded-lg text-xs"
                onClick={() => handleScheduleCleaning(selectedRoom)}
              >
                Dispatch Cleaning
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  style={{ background: NAVY, borderColor: NAVY }}
                  className="rounded-lg text-xs"
                  onClick={() => handleOpenEdit(selectedRoom)}
                >
                  Edit Room
                </Button>
                <Popconfirm
                  title="Remove Room?"
                  description={`Are you sure you want to remove Room #${selectedRoom.number}?`}
                  onConfirm={() => handleDeleteRoom(selectedRoom.roomId)}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />} size="middle" className="rounded-lg" />
                </Popconfirm>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Room Drawer */}
      <Drawer
        title={`Register Room on ${activeFloor?.floorName}`}
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        width={480}
        extra={
          <Button
            type="primary"
            style={{ background: NAVY, borderColor: NAVY }}
            onClick={handleCreateRoom}
          >
            Create Room
          </Button>
        }
      >
        <Form form={createForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="number"
                label="Room Number / Identifier"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input placeholder="e.g. 301" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roomTypeId"
                label="Room Category"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  placeholder="Select Category"
                  options={types.map((t) => ({ value: t.roomTypeId, label: t.roomType }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="bedcount" label="Bed Count" rules={[{ required: true }]}>
                <InputNumber min={1} max={20} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="adultsNo" label="Adult Capacity" rules={[{ required: true }]}>
                <InputNumber min={1} max={10} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="childNo" label="Child Capacity">
                <InputNumber min={0} max={10} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="phoneExtension" label="Phone Extension">
                <Input placeholder="e.g. 101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reservationStatus" label="Initial Status">
                <Select
                  options={["Available", "Reserved", "Occupied", "Cleaning"].map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Remarks / Housekeeping Instructions">
            <Input.TextArea rows={3} placeholder="Balcony view, corner suite, VIP guest ready..." />
          </Form.Item>

          <CustomFieldsEditor />
        </Form>
      </Drawer>

      {/* Edit Room Drawer */}
      <Drawer
        title={roomToEdit ? `Edit Room #${roomToEdit.number}` : "Edit Room"}
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setRoomToEdit(null);
        }}
        width={480}
        extra={
          <Button
            type="primary"
            style={{ background: NAVY, borderColor: NAVY }}
            onClick={handleSaveEdit}
          >
            Save Changes
          </Button>
        }
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="number"
                label="Room Number / Identifier"
                rules={[{ required: true, message: "Required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roomTypeId"
                label="Room Category"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  options={types.map((t) => ({ value: t.roomTypeId, label: t.roomType }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="bedcount" label="Bed Count" rules={[{ required: true }]}>
                <InputNumber min={1} max={20} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="adultsNo" label="Adult Capacity" rules={[{ required: true }]}>
                <InputNumber min={1} max={10} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="childNo" label="Child Capacity">
                <InputNumber min={0} max={10} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="phoneExtension" label="Phone Extension">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reservationStatus" label="Status">
                <Select
                  options={["Available", "Reserved", "Occupied", "Cleaning"].map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="remarks" label="Remarks / Housekeeping Instructions">
            <Input.TextArea rows={3} />
          </Form.Item>

          <CustomFieldsEditor />
        </Form>
      </Drawer>
    </div>
  );
}
