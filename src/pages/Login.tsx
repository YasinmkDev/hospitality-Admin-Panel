import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleFilled,
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ShopOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { GOLD, NAVY, NAVY_2 } from "@/lib/theme";

type AuthMode = "login" | "signup" | "forgot-password" | "otp" | "reset-password";

export default function Login() {
  const { signIn, signUp, sendPasswordResetOtp, verifyOtp, updateUserPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode state: supports URL path (/signup) or query (?mode=signup)
  const pathname = window.location.pathname;
  let defaultMode: AuthMode = "login";
  if (pathname.includes("signup")) defaultMode = "signup";
  else if (pathname.includes("forgot")) defaultMode = "forgot-password";
  else if (pathname.includes("reset")) defaultMode = "reset-password";
  else if (searchParams.get("mode")) defaultMode = searchParams.get("mode") as AuthMode;

  const [mode, setMode] = useState<AuthMode>(defaultMode);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("Alexander Vance");
  const [propertyName, setPropertyName] = useState("Grand Aurora Palace");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP State
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === "otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendCountdown]);

  // Reset errors on mode change
  const switchMode = (newMode: AuthMode) => {
    setError("");
    setSuccessMessage("");
    setMode(newMode);
    if (newMode === "otp") {
      setResendCountdown(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  };

  // Quick fill demo credentials
  const fillDemoCredentials = (role: "admin" | "manager") => {
    if (role === "admin") {
      setEmail("admin@cizaro.hotel");
      setPassword("password123");
    } else {
      setEmail("concierge@aurora.com");
      setPassword("concierge2026");
    }
    setError("");
  };

  // Password strength calculator
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: "None", color: "#e2e8f0" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "#f87171" };
    if (score <= 3) return { score: 2, label: "Moderate", color: "#fbbf24" };
    if (score <= 4) return { score: 3, label: "Strong", color: "#34d399" };
    return { score: 4, label: "Very Strong", color: "#10b981" };
  };

  const passwordStrength = calculateStrength(password);

  // OTP Input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto move to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // 1. Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message || "Failed to authenticate. Please check your credentials.");
        setLoading(false);
      } else {
        setSuccessMessage("Authenticated successfully! Loading hotel dashboard...");
        setTimeout(() => navigate("/"), 400);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  // 2. Submit Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Valid work email is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept the terms of service to continue.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error: err } = await signUp(email, password, {
        data: { name: fullName, property: propertyName },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
      } else {
        setSuccessMessage("Account created successfully!");
        setTimeout(() => navigate("/"), 500);
      }
    } catch (err: any) {
      setError(err?.message || "Sign up failed.");
      setLoading(false);
    }
  };

  // 3. Submit Forgot Password (Request OTP)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !email.includes("@")) {
      setError("Please enter your registered email address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { error: err } = await sendPasswordResetOtp(email);
      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        switchMode("otp");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send reset code.");
      setLoading(false);
    }
  };

  // 4. Submit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of your verification code.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { error: err } = await verifyOtp(email, code);
      setLoading(false);
      if (err) {
        setError(err.message || "Invalid or expired code.");
      } else {
        setSuccessMessage("Identity verified successfully!");
        setPassword("");
        setConfirmPassword("");
        switchMode("reset-password");
      }
    } catch (err: any) {
      setError(err?.message || "Verification failed.");
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError("");
    setLoading(true);
    await sendPasswordResetOtp(email);
    setLoading(false);
    setResendCountdown(30);
    setCanResend(false);
    setSuccessMessage("New security code sent!");
  };

  // 5. Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { error: err } = await updateUserPassword(password, email);
      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        setSuccessMessage("Password changed successfully! Redirecting to workspace...");
        setTimeout(() => navigate("/"), 700);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F7F4EE] text-[#0E1A2B] font-sans antialiased overflow-x-hidden selection:bg-[#C9A66B]/30">
      {/* LEFT SIDE: Brand Showcase (Visible on Large screens, elegant hospitality aesthetics) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative bg-[#0B1F3A] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Background decorative luxury glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 20%, rgba(201,166,107,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(20,43,77,0.8) 0%, transparent 60%)`,
          }}
        />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, #fff5d6)`,
                color: NAVY,
                fontFamily: "'Fraunces', serif",
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              C
            </div>
            <div>
              <div className="text-xl font-bold tracking-wide font-serif text-white flex items-center gap-2">
                Cizaro <span className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider bg-[#C9A66B]/20 text-[#C9A66B] font-sans font-semibold">Grand Suite</span>
              </div>
              <div className="text-xs text-slate-400 tracking-widest uppercase">Hospitality Management System</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Cloud Operations
          </div>
        </div>

        {/* Center Editorial Showcase */}
        <div className="relative z-10 max-w-xl my-auto py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium text-[#C9A66B] bg-[#C9A66B]/10 border border-[#C9A66B]/20 mb-6">
              <SafetyCertificateOutlined /> Forbes 5-Star Hospitality Standard
            </div>

            <h1 className="font-serif text-3xl xl:text-5xl font-medium tracking-tight text-white leading-tight mb-6">
              Precision management for high-caliber hotels & private resorts.
            </h1>

            <p className="text-slate-300 text-sm xl:text-base leading-relaxed mb-8">
              Unify front-desk reservations, housekeeping workflows, dynamic seasonal tariffs,
              and guest experience analytics into one synchronized executive command center.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div>
                <div className="text-2xl xl:text-3xl font-bold text-[#C9A66B] font-serif">99.8%</div>
                <div className="text-xs text-slate-400 mt-1">Occupancy Tracking</div>
              </div>
              <div>
                <div className="text-2xl xl:text-3xl font-bold text-white font-serif">&lt; 15s</div>
                <div className="text-xs text-slate-400 mt-1">Guest Check-In Speed</div>
              </div>
              <div>
                <div className="text-2xl xl:text-3xl font-bold text-[#C9A66B] font-serif">100%</div>
                <div className="text-xs text-slate-400 mt-1">Room Status Sync</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Testimonial / Security Footnote */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700/80 border border-white/15 flex items-center justify-center text-white font-serif font-bold text-xs">
              AV
            </div>
            <div>
              <div className="text-white font-medium">Aurora Palace & Luxury Suites</div>
              <div className="text-[11px] text-slate-400">General Manager Operations Hub</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <SafetyCertificateOutlined className="text-[#C9A66B]" /> 256-bit Encrypted Session
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Auth Forms */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 py-8 sm:py-12 relative overflow-y-auto">
        {/* Mobile Header Brand (Only visible on small/medium screens) */}
        <div className="lg:hidden w-full max-w-md flex items-center justify-between mb-8 pb-4 border-b border-[#0B1F3A]/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, #fff5d6)`,
                color: NAVY,
                fontFamily: "'Fraunces', serif",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              C
            </div>
            <div>
              <div className="text-lg font-bold font-serif text-[#0B1F3A]">Cizaro</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Hospitality Admin</div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-[#0B1F3A]/5 font-medium text-[#0B1F3A]">
            v2.4
          </span>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8 relative">
          {/* Quick Demo Switcher Banner */}
          {!isSupabaseConfigured && (
            <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-2.5">
              <ThunderboltOutlined className="text-amber-600 mt-0.5 text-sm shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-amber-950">Demo Sandbox Active:</span> Pre-loaded with hotel dataset. Quick login is pre-filled below.
                {mode === "login" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials("admin")}
                      className="px-2 py-1 bg-amber-100/90 hover:bg-amber-200 text-amber-900 rounded font-medium text-[11px] transition-colors"
                    >
                      Fill Admin Login
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials("manager")}
                      className="px-2 py-1 bg-amber-100/90 hover:bg-amber-200 text-amber-900 rounded font-medium text-[11px] transition-colors"
                    >
                      Fill Concierge Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Content animated with Framer Motion */}
          <AnimatePresence mode="wait">
            {/* 1. LOGIN SCREEN */}
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-serif font-bold text-[#0B1F3A] tracking-tight">
                    Welcome to Cizaro
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Sign in to access your hotel command center.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircleFilled className="text-emerald-600" />
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MailOutlined />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="manager@hotel.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode("forgot-password")}
                        className="text-xs font-medium text-[#C9A66B] hover:text-[#b38f55] transition"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <LockOutlined />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0B1F3A] border-slate-300 focus:ring-[#0B1F3A]"
                      />
                      <span className="text-xs text-slate-600">Remember this workstation</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium text-sm transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: NAVY }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Sign In to Operations"
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Need new property access?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-semibold text-[#0B1F3A] hover:underline"
                    >
                      Register hotel branch
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. SIGN UP SCREEN */}
            {mode === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-serif font-bold text-[#0B1F3A] tracking-tight">
                    Register Hotel Branch
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Setup a new hospitality management organization.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <UserOutlined />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Johnathan Smith"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Property Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <ShopOutlined />
                        </div>
                        <input
                          type="text"
                          required
                          value={propertyName}
                          onChange={(e) => setPropertyName(e.target.value)}
                          placeholder="e.g. Grand Resort"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Business Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MailOutlined />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="manager@resort.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <LockOutlined />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className="h-full transition-all duration-300"
                              style={{
                                backgroundColor:
                                  step <= passwordStrength.score ? passwordStrength.color : "#e2e8f0",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[11px] font-semibold transition-colors"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <LockOutlined />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <span className="text-[11px] text-red-500 mt-1 block">Passwords do not match yet</span>
                    )}
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-[#0B1F3A] border-slate-300 focus:ring-[#0B1F3A]"
                      />
                      <span className="text-xs text-slate-600">
                        I agree to the Hospitality System Service Terms & Data Protection Policy.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl text-white font-medium text-sm transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: NAVY }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Hotel Workspace"
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-semibold text-[#0B1F3A] hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD SCREEN */}
            {mode === "forgot-password" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4 transition font-medium"
                >
                  <ArrowLeftOutlined /> Back to Sign In
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-serif font-bold text-[#0B1F3A] tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter your authorized staff email. We will send a 6-digit verification code.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MailOutlined />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="manager@hotel.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: NAVY }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 4. OTP / VERIFICATION SCREEN */}
            {mode === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => switchMode("forgot-password")}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-4 transition font-medium"
                >
                  <ArrowLeftOutlined /> Change Email
                </button>

                <div className="mb-5 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center text-xl mb-3">
                    <SafetyCertificateOutlined />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#0B1F3A] tracking-tight">
                    Verify Identity
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    We sent a 6-digit confirmation code to{" "}
                    <span className="font-semibold text-slate-700">{email}</span>
                  </p>
                </div>

                {!isSupabaseConfigured && (
                  <div className="mb-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                      Demo verification code: <code className="font-mono text-sm tracking-widest">123456</code>
                    </span>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  {/* 6 Digit Inputs */}
                  <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 sm:w-12 h-12 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#0B1F3A]/20 focus:outline-none transition shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join("").length < 6}
                    className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: NAVY }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>

                  <div className="text-center pt-2">
                    {resendCountdown > 0 ? (
                      <p className="text-xs text-slate-400">
                        Resend code in{" "}
                        <span className="font-semibold text-slate-600">{resendCountdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xs font-semibold text-[#0B1F3A] hover:underline"
                      >
                        Didn&apos;t receive code? Resend
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {/* 5. RESET PASSWORD SCREEN */}
            {mode === "reset-password" && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-5 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3">
                    <CheckOutlined />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#0B1F3A] tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Your identity is verified. Create a secure password to protect hotel operations.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircleFilled className="text-emerald-600" />
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <LockOutlined />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className="h-full transition-all duration-300"
                              style={{
                                backgroundColor:
                                  step <= passwordStrength.score ? passwordStrength.color : "#e2e8f0",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[11px] font-semibold transition-colors"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <LockOutlined />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type password"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: NAVY }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      "Save Password & Enter Dashboard"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security watermark footer */}
        <div className="w-full max-w-md mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <span>&copy; {new Date().getFullYear()} Cizaro Hospitality Systems Inc.</span>
          <span>&bull;</span>
          <span>Encrypted Gateway</span>
        </div>
      </div>
    </div>
  );
}
