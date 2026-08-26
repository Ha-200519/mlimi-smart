import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Globe,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Cpu,
  HelpCircle,
  KeyRound,
  X,
  Phone,
  Mail,
  Compass,
  Radio,
  Map,
  Activity,
  Layers,
  Sprout
} from "lucide-react";
import { MwachTechLogo } from "./MwachTechLogo";
import { UserRole } from "../types";

interface EnterpriseLoginPageProps {
  onLoginSuccess: (role: UserRole, user: any) => void;
}

export const EnterpriseLoginPage: React.FC<EnterpriseLoginPageProps> = ({ onLoginSuccess }) => {
  // Form Input States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("officer");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<"en" | "ny" | "tum">("en");

  // Auth Process States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Modal / Recovery Dialog
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  // Language Translations Dictionary
  const i18n = {
    en: {
      subtitle: "Malawi Integrated Smart Farming Engine",
      usernameLabel: "Username / Phone / Email",
      usernamePlaceholder: "e.g. +265888123452 or admin",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      rememberMe: "Remember session on this device",
      signIn: "Sign In to MLIMI SMART AI",
      authenticating: "Authenticating...",
      authSuccess: "Authentication Successful",
      loadingDashboard: "Loading MLIMI SMART AI Engine...",
      forgotPassword: "Forgot Password?",
      secureEnv: "Secure MLIMI SMART AI Environment (TLS 256-Bit)",
      poweredBy: "Powered by MwachTech Solutions",
      selectRole: "Select Portal Access Role:",
      roles: {
        admin: "System Administrator",
        manager: "Farm Manager",
        officer: "Field Officer",
        agronomist: "Agronomist",
        farmer: "Farmer",
        analyst: "Data/Research Officer",
      },
    },
    ny: {
      subtitle: "Mulingo Wachidziwitso Waulimi Wanzeru M'Malawi",
      usernameLabel: "Dzina Lolowera / Nambala Yafoni / Imelo",
      usernamePlaceholder: "mwachitsanzo +265888123452 kapena admin",
      passwordLabel: "Mawu Achinsinsi",
      passwordPlaceholder: "••••••••",
      rememberMe: "Kumbukirani pakompyuta ino",
      signIn: "Lowa mu MLIMI SMART AI",
      authenticating: "Kutsimikizira...",
      authSuccess: "Zatsimikizidwa Bwino",
      loadingDashboard: "Kutsegula MLIMI SMART AI...",
      forgotPassword: "Mwaywala Mawu Achinsinsi?",
      secureEnv: "Malire Otetezedwa a MLIMI SMART AI (TLS 256-Bit)",
      poweredBy: "Zapangidwa ndi MwachTech Solutions",
      selectRole: "Sankhani Maudindo Am'malo:",
      roles: {
        admin: "Mtsogoleri Wa Makina (Admin)",
        manager: "Mtsogoleri Wa Munda",
        officer: "Mlangizi Wa Ulimi",
        agronomist: "Mphunzitsi Wa Nthaka Ndi Mbewu",
        farmer: "Mlimi",
        analyst: "Wofufuza Data Ndi Zoyendetsa",
      },
    },
    tum: {
      subtitle: "Nthowa Yachilengiwa Ya Ulimi Wa Nzeru Mu Malawi",
      usernameLabel: "Dzina La Kuvuluka / Nambala Ya Foni",
      usernamePlaceholder: "mwachitsanzo +265888123452 kapena admin",
      passwordLabel: "Mawu Ya Chinsinsi",
      passwordPlaceholder: "••••••••",
      rememberMe: "Kumbukirani pa foni iyi",
      signIn: "Lutani mu MLIMI SMART AI",
      authenticating: "Kusanda mawu...",
      authSuccess: "Kusanda Kwamala Makora",
      loadingDashboard: "Kujula MLIMI SMART AI...",
      forgotPassword: "Mualuwa Mawu Ya Chinsinsi?",
      secureEnv: "Malo Yakuvikilirika Ya MLIMI SMART AI",
      poweredBy: "Kupangika na MwachTech Solutions",
      selectRole: "Sankhani Nchito Yanu:",
      roles: {
        admin: "Mulara Wa Makina (Admin)",
        manager: "Mulara Wa Munda",
        officer: "Mlangizi Wa Ulimi",
        agronomist: "Wosanda Nthaka Na Mbewu",
        farmer: "Mlimi",
        analyst: "Wosanda Ma Record",
      },
    },
  };

  const t = i18n[language];

  // Preset Role Quick Configs
  const ROLE_PRESETS: { role: UserRole; usernameKey: string; label: string; desc: string }[] = [
    { role: "admin", usernameKey: "admin", label: t.roles.admin, desc: "Full System Governance & Infrastructure" },
    { role: "manager", usernameKey: "manager", label: t.roles.manager, desc: "Cooperative & Farm Resource Planning" },
    { role: "agronomist" as any, usernameKey: "agronomist", label: t.roles.agronomist, desc: "Crop Pathology, Soil & Advisory" },
    { role: "officer", usernameKey: "officer", label: t.roles.officer, desc: "Field Inspections & Farmer Support" },
    { role: "farmer", usernameKey: "+265888123452", label: t.roles.farmer, desc: "Smart Farm Records & AI Advisory" },
    { role: "analyst", usernameKey: "analyst", label: t.roles.analyst, desc: "Regional Yield & GIS Analytics" },
  ];

  const handleSelectRolePreset = (r: UserRole, defaultUsername: string) => {
    setSelectedRole(r);
    setUsername(defaultUsername);
    if (r === "admin") setPassword("admin123");
    else if (r === "manager") setPassword("manager123");
    else if (r === "officer") setPassword("officer123");
    else if ((r as string) === "agronomist") setPassword("agronomist123");
    else if (r === "analyst") setPassword("analyst123");
    else setPassword("password123");
    setAuthError(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setAuthError("Please check your username and password.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccess(false);
    setLoadingStep("Validating credentials against MwachTech enterprise gateway...");

    try {
      // Simulate step 1 delay
      await new Promise((res) => setTimeout(res, 400));
      setLoadingStep("Checking role permissions & security policy...");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLoadingStep("Initializing TLS 256-Bit encrypted session token...");
        await new Promise((res) => setTimeout(res, 400));

        setAuthSuccess(true);
        setIsLoading(false);

        // Store session
        if (rememberMe) {
          localStorage.setItem("sifms_role", data.role);
          localStorage.setItem("sifms_user", JSON.stringify(data.user));
        }

        // Trigger parent callback after brief success message
        setTimeout(() => {
          onLoginSuccess(data.role, data.user);
        }, 900);
      } else {
        setIsLoading(false);
        setAuthError(data.error || "Invalid credentials. Please check your username and password.");
      }
    } catch (err) {
      setIsLoading(false);
      setAuthError("Invalid credentials. Please check your username and password.");
    }
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySent(true);
    setTimeout(() => {
      setRecoverySent(false);
      setShowForgotModal(false);
      setRecoveryEmail("");
    }, 2500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070D1B] text-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 overflow-x-hidden select-none font-sans antialiased">
      {/* BACKGROUND GRAPHICS: GIS Grid, Circuit Lines, Satellite Contours */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Tech Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#061022] via-[#081832] to-[#041d18] opacity-95" />

        {/* Top-Right Emerald AI Atmospheric Glow */}
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[120px] animate-pulse" />

        {/* Bottom-Left Blue Tech Glow */}
        <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[120px]" />

        {/* GIS Satellite Topographical Overlay Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gisPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="1.5" fill="#10B981" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gisPattern)" />
        </svg>

        {/* Subtle Circuit Traces */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] hidden sm:block" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 100 L 250 100 L 320 170 L 320 300" stroke="#10B981" strokeWidth="1.5" fill="none" />
          <path d="M 800 200 L 950 200 L 1020 270 L 1020 450" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
          <circle cx="320" cy="300" r="4" fill="#10B981" />
          <circle cx="1020" cy="450" r="4" fill="#38BDF8" />
        </svg>
      </div>

      {/* TOP UTILITY BAR: Security Badge & Language Selector */}
      <header className="relative z-10 w-full max-w-6xl flex flex-wrap items-center justify-between gap-3 py-2 px-2">
        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800/80 shadow-inner text-xs text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{t.secureEnv}</span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="en" className="bg-slate-900 text-white">English (EN)</option>
            <option value="ny" className="bg-slate-900 text-white">Chichewa (NY)</option>
            <option value="tum" className="bg-slate-900 text-white">Tumbuka (TUM)</option>
          </select>
        </div>
      </header>

      {/* MAIN CONTAINER: CENTERED ENTERPRISE LOGIN CARD */}
      <main className="relative z-10 w-full max-w-lg my-auto py-6">
        <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 transition-all duration-300">
          
          {/* BRAND HIERARCHY HEADER */}
          {/* 1. MwachTech Solutions Parent Company Logo */}
          <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-slate-800/80">
            <MwachTechLogo variant="full" />
            
            {/* Divider Arrow */}
            <div className="my-3 flex items-center justify-center gap-2 opacity-60">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-emerald-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-emerald-500" />
            </div>

            {/* 2. MLIMI SMART AI Product Title */}
            <div className="inline-flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                MLIMI <span className="text-emerald-400 font-extrabold">SMART AI</span>
              </h1>
            </div>

            {/* 3. Malawi Integrated Smart Farming Engine Subtitle */}
            <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
              {t.subtitle}
            </p>
          </div>

          {/* ROLE PRESET QUICK SELECTOR (ENTERPRISE DEMO ROLES) */}
          <div className="mt-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.selectRole}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_PRESETS.map((item) => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectRolePreset(item.role, item.usernameKey)}
                    className={`p-2 rounded-xl text-left transition-all border text-xs cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold"
                        : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="font-semibold truncate">{item.label}</div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ERROR ALERT BANNER */}
          {authError && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          {/* SUCCESS BANNER */}
          {authSuccess && (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
              <div>
                <div className="font-bold text-white text-sm">{t.authSuccess}</div>
                <div className="text-emerald-300 font-mono mt-0.5">{t.loadingDashboard}</div>
              </div>
            </div>
          )}

          {/* FORM INPUTS */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Username / Phone Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {t.usernameLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.usernamePlaceholder}
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {t.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium underline"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <span>{t.rememberMe}</span>
              </label>
            </div>

            {/* SUBMIT BUTTON WITH LOADING INDICATOR */}
            <button
              type="submit"
              disabled={isLoading || authSuccess}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                authSuccess
                  ? "bg-emerald-500 text-slate-950"
                  : isLoading
                  ? "bg-emerald-700/70 text-slate-200 cursor-wait"
                  : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-emerald-900/30 active:scale-[0.99]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t.authenticating}</span>
                </>
              ) : authSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.authSuccess}</span>
                </>
              ) : (
                <>
                  <span>{t.signIn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Loading Step Description */}
            {isLoading && (
              <p className="text-[10px] text-center font-mono text-emerald-400 animate-pulse mt-2">
                {loadingStep}
              </p>
            )}
          </form>

          {/* FOOTER INSIDE CARD */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span className="font-semibold text-slate-300">{t.poweredBy}</span>
          </div>
        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 w-full max-w-6xl py-3 px-2 text-center sm:flex sm:justify-between sm:items-center text-[11px] text-slate-500 border-t border-slate-900/80 gap-2">
        <div>
          &copy; {new Date().getFullYear()} <strong className="text-slate-300">MwachTech Solutions</strong>. All Rights Reserved.
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 sm:mt-0 text-slate-400">
          <span className="hover:text-slate-200 cursor-pointer">Malawi Regional Office</span>
          <span>•</span>
          <span className="hover:text-slate-200 cursor-pointer">Terms & Security Policy</span>
        </div>
      </footer>

      {/* FORGOT PASSWORD RECOVERY MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Password Recovery & Support</h3>
                <p className="text-xs text-slate-400">MwachTech Solutions Enterprise Support</p>
              </div>
            </div>

            {recoverySent ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs space-y-1">
                <div className="font-bold text-white text-sm">Recovery Instructions Sent</div>
                <p>Please check your email or SMS inbox for your security reset token.</p>
              </div>
            ) : (
              <form onSubmit={handleSendRecovery} className="space-y-4 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Enter your registered phone number or email address below. An extension officer verification token will be dispatched via SMS.
                </p>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Registered Phone / Email</label>
                  <input
                    type="text"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="e.g. +265888123452 or user@mwachtech.mw"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
