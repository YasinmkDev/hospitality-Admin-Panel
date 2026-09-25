import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Switch,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import CustomFieldsEditor from "@/components/common/CustomFieldsEditor";
import { CardGridSkeleton, EmptyState } from "@/components/common/SkeletonLoaders";
import { api, ctx, newId } from "@/lib/mockApi";
import type { RoomType } from "@/lib/types";
import { NAVY, numberToHex } from "@/lib/theme";

export default function RoomTypes() {
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<RoomType[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    return api.roomType.list().then((res) => {
      setTypes(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    const v = await form.validateFields();
    const cf = (v.customFields || []).reduce(
      (a: Record<string, string>, x: { key: string; value: string }) => ({ ...a, [x.key]: x.value }),
      {}
    );
    const colorNum =
      typeof v.color === "string"
        ? parseInt(v.color.replace("#", ""), 16)
        : v.color?.toHexString
        ? parseInt(v.color.toHexString().replace("#", ""), 16)
        : v.color;
    const payload: RoomType = {
      roomTypeId: editing?.roomTypeId || newId(),
      ...ctx,
      ...v,
      color: colorNum,
      customFields: cf,
    };
    if (editing) await api.roomType.update(payload);
    else await api.roomType.add(payload);
    message.success(editing ? "Room category updated" : "Room category added");
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <PageHeader
          title="Room Categories"
          subtitle="Inventory classification, baseline tariffs, and guest capacity"
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
          New Category
        </Button>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : types.length === 0 ? (
        <EmptyState
          title="No room types defined"
          description="Create room categories like Deluxe Suite, Standard King, or Presidential Penthouse."
          actionText="Add Room Type"
          onAction={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {types.map((t, i) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={t.roomTypeId}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className="cz-card-shadow border-0 overflow-hidden rounded-2xl"
                  styles={{ body: { padding: 0 } }}
                >
                  <div
                    style={{
                      height: 124,
                      background: `linear-gradient(135deg, ${numberToHex(t.color)}, ${NAVY})`,
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 16,
                      color: "#fff",
                    }}
                  >
                    <div>
                      <Tag color="gold" className="font-semibold text-xs mb-1" style={{ color: NAVY }}>
                        ${t.defaultPrice} / night
                      </Tag>
                      <div className="font-serif text-2xl font-bold tracking-tight leading-tight">
                        {t.roomType}
                      </div>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: numberToHex(t.color),
                        border: "2px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 text-slate-500 text-xs">
                      <span className="flex items-center gap-1 font-medium">
                        <UserOutlined /> {t.adultsNo} Adults
                      </span>
                      {t.childNo > 0 && <span>· {t.childNo} Kids</span>}
                      {t.isSharedroom && <Tag className="text-[10px] m-0">Shared</Tag>}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        block
                        icon={<EditOutlined />}
                        className="rounded-lg text-xs h-8"
                        onClick={() => {
                          setEditing(t);
                          form.setFieldsValue({
                            ...t,
                            color: numberToHex(t.color),
                            customFields: Object.entries(t.customFields || {}).map(([key, value]) => ({
                              key,
                              value,
                            })),
                          });
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete Room Type?"
                        description="Are you sure you want to remove this category?"
                        onConfirm={async () => {
                          await api.roomType.remove(t.roomTypeId);
                          message.success("Category deleted");
                          load();
                        }}
                        okButtonProps={{ danger: true }}
                      >
                        <Button danger icon={<DeleteOutlined />} className="rounded-lg h-8 px-2.5" />
                      </Popconfirm>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}

      {/* Responsive Modal */}
      <Modal
        open={open}
        title={editing ? "Edit Room Category" : "New Room Category"}
        onCancel={() => setOpen(false)}
        onOk={onSave}
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "95%" : 540}
        okText="Save Category"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item label="Category Name" name="roomType" rules={[{ required: true }]}>
            <Input placeholder="e.g. Presidential Suite" className="rounded-lg" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} sm={8}>
              <Form.Item label="Base Tariff" name="defaultPrice" rules={[{ required: true }]}>
                <InputNumber prefix="$" min={0} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item label="Adult Capacity" name="adultsNo">
                <InputNumber min={1} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item label="Child Capacity" name="childNo">
                <InputNumber min={0} style={{ width: "100%" }} className="rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item label="Accent Theme Color" name="color">
                <ColorPicker showText />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item label="Shared Room" name="isSharedroom" valuePropName="checked">
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
