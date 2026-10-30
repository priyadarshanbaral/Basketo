import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Leaf,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
  KeyRound,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { store } from "@/lib/flipkart-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in & Register — Basketo" }] }),
  component: AuthPage,
});

type AuthMode = "signin" | "signup" | "otp_verify" | "forgot_password" | "reset_password";

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { redirect_to?: string };
  const redirectTo = (search.redirect_to ?? "/account") as string;

  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState<string>("849201");
  const [otpInput, setOtpInput] = useState<string>("");
  const [timer, setTimer] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // OTP Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  function startOtpFlow(targetEmail: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(60);
    setTimerActive(true);
    setOtpInput("");
    setMode("otp_verify");
    toast.success(`Verification code sent to ${targetEmail}`);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all registration fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    startOtpFlow(email);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otpInput.trim() !== generatedOtp) {
      toast.error("Invalid verification code. Please check and try again.");
      return;
    }

    // Create user and activate account
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role: "customer" as const,
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      createdAt: new Date().toISOString(),
    };

    store.setCurrentUser(newUser);
    toast.success("Email verified! Account activated successfully. Welcome to Basketo! 🎉");
    navigate({ to: redirectTo });
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Log in demo user or match existing
      const loggedIn = store.currentUser || {
        id: `user-demo-customer`,
        name: email.split("@")[0] || "Customer",
        email,
        phone: "+91 98765 43210",
        role: "customer" as const,
        isVerified: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date().toISOString(),
      };
      store.setCurrentUser(loggedIn);
      toast.success("Signed in successfully!");
      navigate({ to: redirectTo });
    }, 400);
  }

  function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address");
      return;
    }
    startOtpFlow(email);
  }

  function quickDemoLogin(role: "customer" | "admin") {
    store.switchUser(role);
    toast.success(`Logged in as ${role === "admin" ? "Admin Manager" : "Aarav Sharma (Customer)"}`);
    navigate({ to: role === "admin" ? "/admin" : redirectTo });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left visual brand hero */}
      <div className="relative hidden gradient-hero lg:flex flex-col justify-between p-12 border-r border-border/80">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 shadow-md shadow-emerald-500/20">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-foreground">
            Basketo
          </span>
        </Link>

        <div className="max-w-md space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> India's Most Trusted Fresh Store
          </span>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-foreground md:text-5xl">
            Everything fresh.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              At your doorstep in 15 mins.
            </span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Join 10,000+ happy shoppers enjoying farm-fresh vegetables, organic fruits, daily
            essentials, and real-time visual courier tracking.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600 mb-1" />
              <div className="font-bold text-foreground">Secure OTP Verification</div>
              <div className="text-[11px] text-muted-foreground">End-to-end encrypted</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-xs">
              <Sparkles className="h-4 w-4 text-amber-500 mb-1" />
              <div className="font-bold text-foreground">Live Courier Checkpoints</div>
              <div className="text-[11px] text-muted-foreground">Shiprocket & BlueDart</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          © 2026 Basketo India • Farm to Fork Freshness
        </div>
      </div>

      {/* Right form container */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Quick Demo Switcher */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs flex items-center justify-between">
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              Instant Preview:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => quickDemoLogin("customer")}
                className="rounded-full bg-card border border-border px-3 py-1 font-bold text-foreground shadow-xs hover:bg-muted"
              >
                Demo Customer
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin("admin")}
                className="rounded-full bg-emerald-600 px-3 py-1 font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Demo Admin
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. SIGN IN MODE */}
            {mode === "signin" && (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                    Sign in to Basketo
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Access your orders, visual shipment tracking, and wishlist
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground">
                      Email or Mobile Number
                    </label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav.sharma@example.com"
                        className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-foreground">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot_password")}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 font-bold text-white shadow-md shadow-emerald-500/25 transition hover:scale-[1.02]"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <div className="text-center text-xs text-muted-foreground">
                  New to Basketo?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="font-bold text-primary hover:underline"
                  >
                    Create your account
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. SIGN UP / REGISTER MODE */}
            {mode === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                    Create Account
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Register with email verification to shop & track shipments
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold">Full Name *</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="h-10 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold">Email Address *</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aarav@example.com"
                        className="h-10 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold">Phone Number *</label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="h-10 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold">Password *</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="mt-1 h-10 w-full rounded-2xl border border-border bg-card px-3.5 text-xs outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">Confirm Password *</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="mt-1 h-10 w-full rounded-2xl border border-border bg-card px-3.5 text-xs outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 h-11 w-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 font-bold text-white shadow-md shadow-emerald-500/25 transition hover:scale-[1.02]"
                  >
                    Verify Email & Continue
                  </Button>
                </form>

                <div className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="font-bold text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. OTP VERIFICATION STEP */}
            {mode === "otp_verify" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-bold">Verify Your Email</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the 6-digit verification OTP sent to{" "}
                    <strong className="text-foreground">{email}</strong>
                  </p>
                </div>

                {/* Simulated Email Box Banner */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-xs text-center">
                  <span className="text-muted-foreground">Nodemailer Simulation: </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    Your OTP is {generatedOtp}
                  </span>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="h-12 w-full rounded-2xl border-2 border-primary/30 text-center font-mono text-xl font-bold tracking-widest outline-none focus:border-primary"
                    required
                  />

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-full bg-primary font-bold text-primary-foreground shadow-sm"
                  >
                    Activate Account
                  </Button>
                </form>

                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setMode("signup")}
                    className="text-muted-foreground hover:underline"
                  >
                    ← Edit Information
                  </button>

                  <button
                    disabled={timerActive}
                    onClick={() => startOtpFlow(email)}
                    className={`font-semibold ${
                      timerActive
                        ? "text-muted-foreground opacity-60"
                        : "text-primary hover:underline"
                    }`}
                  >
                    {timerActive ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. FORGOT PASSWORD */}
            {mode === "forgot_password" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold">Reset Password</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We will send an OTP to your email to verify and update your credentials
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold">Registered Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@example.com"
                      className="mt-1 h-10 w-full rounded-2xl border border-border bg-card px-3.5 text-xs outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-full bg-primary font-bold text-primary-foreground"
                  >
                    Send Reset OTP
                  </Button>
                </form>

                <div className="text-center text-xs">
                  <button
                    onClick={() => setMode("signin")}
                    className="font-semibold text-primary hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
