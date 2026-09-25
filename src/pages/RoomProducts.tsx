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
  ShoppingFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { Room, RoomProduct } from "@/lib/types";
import { GOLD, NAVY } from "@/lib/theme";

export default function RoomProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<RoomProduct[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomProduct | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.roomProduct.paginate({
        page,
        pageSize,
        search,
        searchFields: ["name"],
        sortBy: "name",
        sortOrder: "asc",
      });
      setProducts(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed loading products:", err);
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
    const payload: RoomProduct = {
      rRoomProductsId: editing?.rRoomProductsId || newId(),
      roomProductsId: editing?.roomProductsId || newId(),
      menuProductId: editing?.menuProductId || newId(),
      objectType: 1,
      value: true,
      ...ctx,
      ...v,
    };
    if (editing) await api.roomProduct.update(payload);
    else await api.roomProduct.add(payload);
    message.success(editing ? "Product updated" : "Product added");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const cols = [
    {
      title: "Product Offering",
      dataIndex: "name",
      render: (n: string) => (
        <Space>
          <ShoppingFilled style={{ color: GOLD }} />
          <span className="font-semibold text-[#0B1F3A]">{n}</span>
        </Space>
      ),
    },
    {
      title: "Linked Room",
      dataIndex: "objectId",
      render: (id: string) => {
        const r = rooms.find((rm) => rm.roomId === id);
        return r ? <span className="font-medium text-slate-700">Room #{r.number}</span> : "All Rooms";
      },
    },
    {
      title: "Stock / Qty",
      dataIndex: "quantity",
      render: (n: number) => <span className="tabular-nums font-semibold">{n}</span>,
    },
    {
      title: "Unit Price",
      dataIndex: "defaultPrice",
      render: (p: number) => (
        <Tag color="gold" className="font-semibold" style={{ color: NAVY }}>
          ${p}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "a",
      width: 110,
      render: (_: unknown, p: RoomProduct) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(p);
              form.setFieldsValue(p);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Delete Product?"
            description="Remove this product item?"
            onConfirm={async () => {
              await api.roomProduct.remove(p.rRoomProductsId);
              message.success("Product removed");
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
          title="Room Products & Add-Ons"
          subtitle="Minibar selections, amenity packages, and guest enhancement items"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search product..."
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
            New Product
          </Button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton columns={5} rows={6} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No minibar items or products"
          description="Register room products like Vintage Champagne, Welcome Spa Kits, or Artisan Chocolates."
          actionText="Add Product"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Card className="cz-card-shadow" style={{ border: 0 }} styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="rRoomProductsId"
            dataSource={products}
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
              showTotal: (tot) => `Total ${tot} room products`,
              responsive: true,
            }}
            scroll={{ x: 600 }}
          />
        </Card>
      )}

      <Modal
        open={open}
        title={editing ? "Edit Product" : "Register Product Offering"}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "95%" : 500}
        okText="Save Product"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Ruinart Blanc de Blancs Champagne" className="rounded-lg" />
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
            <Col xs={12} sm={6}>
              <Form.Item label="Quantity" name="quantity" initialValue={1}>
                <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item label="Price ($)" name="defaultPrice" initialValue={45}>
                <InputNumber min={0} prefix="$" style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
