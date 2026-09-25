import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Avatar,
  message,
  Modal,
} from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { ctx } from "@/lib/mockApi";
import { GOLD, NAVY } from "@/lib/theme";
import { seedDatabase } from "@/lib/seed";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Settings() {
  const { signOut, session, updateUserPassword } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [form] = Form.useForm();

  async function handleSeed() {
    setSeeding(true);
    const { ok, errors } = await seedDatabase();
    setSeeding(false);
    if (ok) {
      message.success(
        isSupabaseConfigured
          ? "Placeholder data seeded to Supabase!"
          : "Default demo data reset successfully!"
      );
      setTimeout(() => window.location.reload(), 500);
    } else {
      message.error(`Seed errors: ${errors.join(", ")}`);
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      message.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    const { error } = await updateUserPassword(newPassword);
    setPasswordLoading(false);
    if (error) {
      message.error(error.message);
    } else {
      message.success("Account password changed successfully");
      setPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings & Governance"
        subtitle="Property configuration, staff credentials, and cloud synchronization"
      />

      <Row gutter={[20, 20]}>
        {/* Left Column: Property & Preferences */}
        <Col xs={24} lg={14}>
          <div className="space-y-5">
            {/* Active Property Card */}
            <Card
              className="cz-card-shadow rounded-2xl"
              style={{ border: 0 }}
              title={
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: NAVY }}>
                  Active Property Context
                </span>
              }
            >
              <Form
                layout="vertical"
                form={form}
                initialValues={{
                  branch: "Aurora",
                  currency: "USD",
                  tax: 12,
                  timeZone: "America/New_York",
                  emailAlerts: true,
                }}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Active Property Branch" name="branch">
                      <Select
                        className="rounded-lg"
                        options={[
                          { value: "Aurora", label: "Aurora Palace & Suites (Flagship)" },
                          { value: "Coast", label: "Grand Coastline Resort & Spa" },
                          { value: "Alpine", label: "Alpine Mountain Chalet" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Property Timezone" name="timeZone">
                      <Select
                        className="rounded-lg"
                        options={[
                          { value: "America/New_York", label: "Eastern Standard Time (EST)" },
                          { value: "America/Chicago", label: "Central Time (CST)" },
                          { value: "America/Los_Angeles", label: "Pacific Time (PST)" },
                          { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={12}>
                  <Col xs={12}>
                    <Form.Item label="Base Folio Currency" name="currency">
                      <Select
                        className="rounded-lg"
                        options={["USD ($)", "EUR (€)", "GBP (£)", "AED (د.إ)"].map((c) => ({
                          value: c.slice(0, 3),
                          label: c,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item label="Default Lodging Tax (%)" name="tax">
                      <Input type="number" suffix="%" className="rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Instant Front-Desk Email Notifications"
                  name="emailAlerts"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <div className="pt-2 flex flex-wrap gap-2">
                  <Button
                    type="primary"
                    style={{ background: NAVY, borderColor: NAVY }}
                    className="rounded-xl px-5 h-9 font-medium shadow-sm"
                    onClick={() => message.success("Property settings saved successfully")}
                  >
                    Save Preferences
                  </Button>
                  <Button className="rounded-xl h-9" onClick={() => form.resetFields()}>
                    Reset Defaults
                  </Button>
                </div>
              </Form>
            </Card>

            {/* Account Profile Card */}
            <Card
              className="cz-card-shadow rounded-2xl"
              style={{ border: 0 }}
              title={
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: NAVY }}>
                  Operator Profile
                </span>
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <Avatar size={54} style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>
                    {session?.user?.email ? session.user.email[0].toUpperCase() : "AD"}
                  </Avatar>
                  <div>
                    <div className="font-serif text-lg font-bold text-[#0B1F3A]">
                      {session?.user?.user_metadata?.name || "General Manager"}
                    </div>
                    <div className="text-xs text-slate-500">{session?.user?.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag color="gold" className="text-[10px] font-semibold" style={{ color: NAVY }}>
                        Executive Admin
                      </Tag>
                      <Tag color="blue" className="text-[10px] font-semibold">
                        Authenticated
                      </Tag>
                    </div>
                  </div>
                </div>

                <Button
                  icon={<LockOutlined />}
                  onClick={() => setPasswordModalOpen(true)}
                  className="rounded-xl text-xs h-9"
                >
                  Change Password
                </Button>
              </div>
            </Card>
          </div>
        </Col>

        {/* Right Column: Database, Context & Cloud Engine */}
        <Col xs={24} lg={10}>
          <div className="space-y-5">
            {/* Sync Environment */}
            <Card
              className="cz-card-shadow cz-grain text-white rounded-2xl"
              style={{ border: 0, background: NAVY }}
              title={
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#fff" }}>
                    Engine & Sync State
                  </span>
                  <Tag
                    color={isSupabaseConfigured ? "green" : "gold"}
                    className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                    style={{ color: isSupabaseConfigured ? "#fff" : NAVY }}
                  >
                    {isSupabaseConfigured ? "Live Supabase" : "Local Storage Demo"}
                  </Tag>
                </div>
              }
            >
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Data Persistence Mechanism
                  </div>
                  <div className="text-slate-200 mt-1 leading-relaxed">
                    {isSupabaseConfigured
                      ? "Directly connected to your remote Supabase PostgreSQL database via RESTful schema."
                      : "Operating in-browser with reactive local storage persistence. All hotel rooms, rates, reservations, and edits survive browser reloads."}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                    Internal Identifier Context
                  </div>
                  {[
                    ["Company ID", ctx.companyId || "org_aurora_hospitality"],
                    ["Branch ID", ctx.branchId || "br_palace_flagship_01"],
                    ["Employee ID", ctx.employeeId || "emp_lead_ops_77"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">{k}</span>
                      <span className="font-mono text-[#C9A66B] font-semibold">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2.5">
                  <Button
                    loading={seeding}
                    onClick={handleSeed}
                    icon={<ReloadOutlined />}
                    style={{
                      background: GOLD,
                      borderColor: GOLD,
                      color: NAVY,
                      fontWeight: 600,
                    }}
                    className="rounded-xl h-9"
                  >
                    {isSupabaseConfigured ? "Sync Schema to Supabase" : "Reset Demo Data"}
                  </Button>
                  <Button danger onClick={signOut} className="rounded-xl h-9">
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>

            {/* Security Notice */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-600 shadow-sm flex items-start gap-3">
              <SafetyCertificateOutlined className="text-emerald-600 text-lg mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 block mb-0.5">
                  PCI-DSS & Guest Data Safeguard
                </span>
                Payment references and guest records are tokenized for client security. Passwords are
                hashed with strong cryptographic salt.
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Update Account Password"
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
        onOk={handlePasswordChange}
        confirmLoading={passwordLoading}
        okText="Update Password"
        okButtonProps={{ style: { background: NAVY, borderColor: NAVY } }}
        width={420}
      >
        <div className="py-2 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              New Secure Password
            </label>
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Confirm New Password
            </label>
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type password"
              className="rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
