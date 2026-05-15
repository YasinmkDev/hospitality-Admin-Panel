import { Button, Form, Input } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

// Editable JSON-ish key/value editor for `customFields`
export default function CustomFieldsEditor({ name = "customFields" }: { name?: string }) {
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fields.map(({ key, name: n, ...rest }) => (
            <div key={key} style={{ display: "flex", gap: 8 }}>
              <Form.Item {...rest} name={[n, "key"]} style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="key" />
              </Form.Item>
              <Form.Item {...rest} name={[n, "value"]} style={{ flex: 2, marginBottom: 0 }}>
                <Input placeholder="value" />
              </Form.Item>
              <Button icon={<DeleteOutlined />} onClick={() => remove(n)} />
            </div>
          ))}
          <Button block icon={<PlusOutlined />} onClick={() => add({ key: "", value: "" })}>
            Add custom field
          </Button>
        </div>
      )}
    </Form.List>
  );
}
