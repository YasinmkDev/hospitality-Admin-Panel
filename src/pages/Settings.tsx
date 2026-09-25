import { useState } from "react";
import { Button, Card, Col, Form, Input, Row, Select, Space, Switch, message } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { ctx } from "@/lib/mockApi";
import { GOLD, NAVY } from "@/lib/theme";
import { seedDatabase } from "@/lib/seed";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { signOut, session } = useAuth();
  const [seeding, setSeeding] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    const { ok, errors } = await seedDatabase();
    setSeeding(false);
    if (ok) message.success("Placeholder data seeded to Supabase!");
    else message.error(`Seed errors: ${errors.join(", ")}`);
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Branch context, profile & preferences" />
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card className="cz-card-shadow" style={{ border: 0 }} title={<span style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>Branch Context</span>}>
            <Form layout="vertical" initialValues={{ branch: "Aurora", currency: "USD", tax: 10, dark: false }}>
              <Form.Item label="Active Branch" name="branch">
                <Select options={[{ value: "Aurora", label: "Aurora · Central" }, { value: "Coast", label: "Coast Resort" }]} />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}><Form.Item label="Currency" name="currency"><Select options={["USD", "EUR", "GBP"].map(c => ({ value: c, label: c }))} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Default Tax %" name="tax"><Input type="number" /></Form.Item></Col>
              </Row>
              <Form.Item label="Dark mode preview" name="dark" valuePropName="checked"><Switch /></Form.Item>
              <Space>
                <Button type="primary">Save</Button>
                <Button>Reset</Button>
              </Space>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="cz-card-shadow cz-grain" style={{ border: 0, background: NAVY, color: "#fff" }}
            title={<span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#fff" }}>API Context</span>}
          >
            {[
              ["Company ID", ctx.companyId],
              ["Branch ID", ctx.branchId],
              ["Employee ID", ctx.employeeId],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1 }}>{k}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: GOLD, marginTop: 2 }}>{v}</div>
              </div>
            ))}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 12 }}>
              Connected to Supabase. Seed placeholder data or sign out below.
            </div>
            <Space style={{ marginTop: 16 }}>
              <Button loading={seeding} onClick={handleSeed} style={{ background: GOLD, borderColor: GOLD, color: NAVY, fontWeight: 600 }}>
                Seed Data to Supabase
              </Button>
              <Button danger onClick={signOut}>Sign Out ({session?.user?.email})</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
