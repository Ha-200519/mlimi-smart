import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  Sparkles,
  Inbox,
  FileText,
  ShieldCheck,
  ChevronRight,
  Filter,
  Paperclip,
  Clock,
  Sprout,
  X,
  Plus
} from "lucide-react";
import { User as FirebaseUser } from "firebase/auth";
import { googleSignIn, googleSignOut, initAuth, getAccessToken } from "../lib/firebaseAuth";

interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  body?: string;
}

interface FarmerContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  village: string;
  crop: string;
}

export const GmailHub: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Messages & Inbox state
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "alerts" | "farmers" | "sent">("all");

  // Email Composition State
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"send" | "delete" | "draft" | null>(null);
  const [actionItem, setActionItem] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Farmer Contacts List
  const [farmersList, setFarmersList] = useState<FarmerContact[]>([]);

  useEffect(() => {
    // Initialize Firebase Auth listener
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );

    // Fetch farmers for contacts selection
    fetchFarmers();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchGmailMessages();
    }
  }, [accessToken, categoryFilter]);

  const fetchFarmers = async () => {
    try {
      const res = await fetch("/api/farmers");
      if (res.ok) {
        const data = await res.json();
        const formatted: FarmerContact[] = data.map((f: any, idx: number) => ({
          id: f.id || `f-${idx}`,
          name: f.name || "Malawian Farmer",
          email: f.email || `${(f.name || "farmer").toLowerCase().replace(/\s+/g, ".")}@sifms.mw`,
          phone: f.phone || "+265888000111",
          district: f.district || "Chiradzulu",
          village: f.village || "Njuli",
          crop: f.crop || "Maize"
        }));
        setFarmersList(formatted);
      }
    } catch (e) {
      console.warn("Could not load farmers list for email composer", e);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Failed to sign in with Google.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setAccessToken(null);
    setMessages([]);
    setSelectedMessage(null);
  };

  // Helper to create RFC 2822 base64url encoded raw email
  const createRawEmail = (to: string, subj: string, bodyText: string) => {
    const emailLines = [
      `To: ${to}`,
      `Content-Type: text/plain; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subj)))}?=`,
      ``,
      bodyText
    ];
    const email = emailLines.join("\r\n");
    return btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  // Fetch Messages from Gmail REST API
  const fetchGmailMessages = async () => {
    const token = accessToken || getAccessToken();
    if (!token) return;

    setIsLoadingMessages(true);
    setStatusMessage(null);

    let query = searchQuery.trim();
    if (categoryFilter === "alerts") query += " (MLIMI OR Alert OR Advisory OR Weather OR Pest)";
    if (categoryFilter === "farmers") query += " (Farmer OR Cooperative OR Harvest)";
    if (categoryFilter === "sent") query += " in:sent";

    try {
      const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=12${
        query ? `&q=${encodeURIComponent(query)}` : ""
      }`;
      const res = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Gmail API returned HTTP ${res.status}`);
      }

      const listData = await res.json();
      if (!listData.messages || listData.messages.length === 0) {
        setMessages([]);
        setIsLoadingMessages(false);
        return;
      }

      // Fetch message details in parallel
      const detailPromises = listData.messages.slice(0, 10).map(async (item: { id: string }) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!detailRes.ok) return null;
        const msg = await detailRes.json();

        const headers = msg.payload?.headers || [];
        const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
        const fromHeader = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
        const toHeader = headers.find((h: any) => h.name.toLowerCase() === "to")?.value || "";
        const dateHeader = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";

        let bodyText = msg.snippet || "";
        if (msg.payload?.body?.data) {
          bodyText = atob(msg.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"));
        } else if (msg.payload?.parts?.[0]?.body?.data) {
          bodyText = atob(msg.payload.parts[0].body.data.replace(/-/g, "+").replace(/_/g, "/"));
        }

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet,
          subject: subjectHeader,
          from: fromHeader,
          to: toHeader,
          date: dateHeader,
          body: bodyText
        };
      });

      const fullMsgs = (await Promise.all(detailPromises)).filter(Boolean) as GmailMessage[];
      setMessages(fullMsgs);
    } catch (err: any) {
      console.error("Error fetching Gmail messages:", err);
      setStatusMessage({
        type: "error",
        text: `Error loading messages: ${err.message || "Failed to reach Gmail server."}`
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Pre-configured Agricultural Email Alert Templates
  const applyTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const farmer = farmersList.find((f) => f.email === recipientEmail) || farmersList[0];
    const farmerNameStr = recipientName || farmer?.name || "Malawian Farmer";

    if (templateKey === "weather") {
      setSubject("🌦️ MLIMI SMART AI Alert: Heavy Rain & Flash Flood Warning for Shire Highlands");
      setBody(
        `Dear ${farmerNameStr},\n\nMLIMI SMART AI weather sensors and satellite radar indicate localized heavy rainfall exceeding 65mm in your district (${farmer?.district || "Chiradzulu"}).\n\nRECOMMENDED ACTIONS:\n1. Ensure drainage ridges around maize and legume plots are clear.\n2. Avoid applying top-dress UREA fertilizer until heavy rains subside to prevent leaching.\n3. Secure harvested grains in elevated, dry storage.\n\nRegards,\nMLIMI SMART AI Automated Extension System\nMwachTech Solutions`
      );
    } else if (templateKey === "armyworm") {
      setSubject("🐛 URGENT PEST ALERT: Fall Armyworm (Spodoptera frugiperda) Advisory");
      setBody(
        `Dear ${farmerNameStr},\n\nField officers and AI computer vision diagnostics have confirmed a Fall Armyworm outbreak near ${farmer?.village || "Njuli Village"}.\n\nIMMEDIATE STEPS:\n- Inspect maize crop funnels for fresh frass or pin-hole damage.\n- Apply registered botanical spray (Neem extract) or recommended larvicide in the early morning or evening.\n- Contact your local Extension Officer for biological control traps.\n\nStay vigilant,\nMwachTech Smart Agriculture Advisory`
      );
    } else if (templateKey === "irrigation") {
      setSubject("💧 MLIMI IoT Pump Status & Soil Moisture Advisory");
      setBody(
        `Dear ${farmerNameStr},\n\nYour ESP32 IoT Soil Moisture sensor (Zone 1) indicates soil moisture level at 24% (below optimal threshold of 45%).\n\nAUTOMATION STATUS:\n- Automated Irrigation Pump #1 is scheduled to activate at 17:30 CAT for 40 minutes.\n- Estimated water volume: 450 Liters.\n\nReply to this email if you wish to adjust pump run cycles.\n\nMLIMI SMART AI Engine`
      );
    } else if (templateKey === "market") {
      setSubject("🌾 Weekly Commodity Price Index & Cooperative Market Rates");
      setBody(
        `Dear ${farmerNameStr},\n\nHere are the updated commodity market prices across major Malawian markets:\n\n- Maize (Dry grain): MWK 820 / kg (Lilongwe), MWK 850 / kg (Blantyre)\n- Dry Beans (Sugar beans): MWK 1,950 / kg\n- Groundnuts (CG7): MWK 1,600 / kg\n- Rice (Kilombero): MWK 2,400 / kg\n\nConnect with your local cooperative manager to aggregate volume for higher margin bulk buyer contracts.\n\nMLIMI Market Intelligence`
      );
    }
  };

  // Trigger Send Confirmation Dialog
  const initiateSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !body) {
      setStatusMessage({ type: "error", text: "Please fill in recipient email, subject, and body." });
      return;
    }
    setConfirmAction("send");
    setActionItem({ recipientEmail, subject, body });
    setShowConfirmModal(true);
  };

  // Perform Gmail API Send Execution after confirmation
  const executeSendEmail = async () => {
    const token = accessToken || getAccessToken();
    if (!token) {
      setStatusMessage({ type: "error", text: "No active Google OAuth token. Please sign in." });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const rawEmail = createRawEmail(recipientEmail, subject, body);

      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: rawEmail })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Failed to send email (${res.status})`);
      }

      setStatusMessage({
        type: "success",
        text: `Email advisory successfully dispatched via Gmail to ${recipientEmail}!`
      });

      // Clear form
      setSubject("");
      setBody("");
      setSelectedTemplate("");
      setShowConfirmModal(false);

      // Refresh sent items
      setTimeout(() => fetchGmailMessages(), 1000);
    } catch (err: any) {
      console.error("Gmail send error:", err);
      setStatusMessage({
        type: "error",
        text: `Failed to send email: ${err.message}`
      });
    } finally {
      setIsSending(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="w-full bg-[#081225] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-emerald-500 to-blue-600 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Mail className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Gmail <span className="text-emerald-400 font-extrabold">Smart Alerts</span>
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase font-mono">
                Workspace API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct Google Workspace Gmail integration for agricultural advisories & farmer communications
            </p>
          </div>
        </div>

        {/* GOOGLE ACCOUNT CONNECTION CARD */}
        {user ? (
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} className="w-9 h-9 rounded-full border border-emerald-400" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-400 flex items-center justify-center text-emerald-300 font-bold text-sm">
                {user.displayName?.[0] || user.email?.[0] || "U"}
              </div>
            )}
            <div className="text-left text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{user.displayName || "Connected User"}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{user.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-2 p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign out Google Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* OFFICIAL GOOGLE SIGN-IN MATERIAL BUTTON */
          <button
            onClick={handleSignIn}
            disabled={isLoadingAuth}
            className="gsi-material-button hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <div className="gsi-material-button-state" />
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              </div>
              <span className="gsi-material-button-contents font-bold">Connect Gmail Account</span>
            </div>
          </button>
        )}
      </div>

      {/* AUTH STATUS & ALERT BANNERS */}
      {authError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {statusMessage && (
        <div
          className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center gap-3 animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
              : "bg-rose-500/20 border-rose-400 text-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {!user ? (
        /* PROMPT SIGN IN VIEW */
        <div className="my-8 py-12 px-6 text-center bg-slate-900/60 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-xl">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Gmail Integration Ready</h3>
          <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
            Connect your Google account to enable sending weather advisories, pest alerts, and automated irrigation updates directly from MLIMI SMART AI to farmers' Gmail inboxes.
          </p>
          <div className="mt-6">
            <button
              onClick={handleSignIn}
              disabled={isLoadingAuth}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Connect Google Account for Gmail</span>
            </button>
          </div>
        </div>
      ) : (
        /* MAIN GMAIL DASHBOARD (COMPOSER + INBOX VIEWER) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* LEFT COLUMN: EMAIL ADVISORY COMPOSER */}
          <div className="lg:col-span-6 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Compose & Dispatch Advisory
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">TLS Encrypted</span>
              </div>

              {/* TEMPLATE QUICK SELECTOR */}
              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Choose Smart Alert Template:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate("weather")}
                    className={`p-2.5 rounded-xl text-left border text-xs cursor-pointer transition-all ${
                      selectedTemplate === "weather"
                        ? "bg-blue-500/20 border-blue-400 text-white font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-blue-300">🌦️ Weather Warning</div>
                    <div className="text-[10px] text-slate-400">Rainfall & Flood Alert</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate("armyworm")}
                    className={`p-2.5 rounded-xl text-left border text-xs cursor-pointer transition-all ${
                      selectedTemplate === "armyworm"
                        ? "bg-rose-500/20 border-rose-400 text-white font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-rose-300">🐛 Pest Outbreak</div>
                    <div className="text-[10px] text-slate-400">Armyworm Advisory</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate("irrigation")}
                    className={`p-2.5 rounded-xl text-left border text-xs cursor-pointer transition-all ${
                      selectedTemplate === "irrigation"
                        ? "bg-emerald-500/20 border-emerald-400 text-white font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-emerald-300">💧 IoT Irrigation</div>
                    <div className="text-[10px] text-slate-400">Soil Moisture Report</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyTemplate("market")}
                    className={`p-2.5 rounded-xl text-left border text-xs cursor-pointer transition-all ${
                      selectedTemplate === "market"
                        ? "bg-amber-500/20 border-amber-400 text-white font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-amber-300">🌾 Market Prices</div>
                    <div className="text-[10px] text-slate-400">Cooperative Rates</div>
                  </button>
                </div>
              </div>

              {/* FORM FIELDS */}
              <form onSubmit={initiateSendEmail} className="space-y-3">
                {/* Recipient Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Recipient Farmer / Extension Contact:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={recipientEmail}
                      onChange={(e) => {
                        const emailVal = e.target.value;
                        setRecipientEmail(emailVal);
                        const found = farmersList.find((f) => f.email === emailVal);
                        if (found) setRecipientName(found.name);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                    >
                      <option value="">-- Select Registered Farmer Contact --</option>
                      {farmersList.map((f) => (
                        <option key={f.id} value={f.email}>
                          {f.name} ({f.district} - {f.crop}) &lt;{f.email}&gt;
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Or type custom recipient email e.g. farmer@cooperative.mw"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none mt-1.5 font-mono"
                  />
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Subject Line:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MLIMI Advisory: Heavy Rainfall Notice"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-sans"
                  />
                </div>

                {/* Body Text */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Advisory Body:
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Type advisory details or AI recommendation..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Advisory via Gmail</span>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: GMAIL INBOX / SENT MESSAGES VIEWER */}
          <div className="lg:col-span-6 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Gmail Messages & Responses
                  </h3>
                </div>
                <button
                  onClick={fetchGmailMessages}
                  disabled={isLoadingMessages}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Refresh Inbox"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? "animate-spin text-emerald-400" : ""}`} />
                </button>
              </div>

              {/* FILTER & SEARCH BAR */}
              <div className="space-y-2 mb-4">
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-3 py-1 rounded-full font-semibold border cursor-pointer ${
                      categoryFilter === "all"
                        ? "bg-blue-500/20 border-blue-400 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    All Messages
                  </button>
                  <button
                    onClick={() => setCategoryFilter("alerts")}
                    className={`px-3 py-1 rounded-full font-semibold border cursor-pointer ${
                      categoryFilter === "alerts"
                        ? "bg-emerald-500/20 border-emerald-400 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    MLIMI Alerts
                  </button>
                  <button
                    onClick={() => setCategoryFilter("sent")}
                    className={`px-3 py-1 rounded-full font-semibold border cursor-pointer ${
                      categoryFilter === "sent"
                        ? "bg-amber-500/20 border-amber-400 text-white"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    Sent Advisories
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Gmail messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchGmailMessages()}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* MESSAGES LIST */}
              {isLoadingMessages ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <span>Fetching latest messages from Gmail REST API...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-850 p-6">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-300">No Gmail messages found</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Send your first agricultural alert advisory using the composer on the left!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedMessage?.id === msg.id
                          ? "bg-slate-800 border-blue-400 shadow-md"
                          : "bg-slate-950/60 border-slate-800 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                        <span className="truncate max-w-[220px] text-white font-bold">{msg.from}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{msg.date?.slice(0, 16)}</span>
                      </div>
                      <div className="text-slate-200 font-medium truncate">{msg.subject}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-1 line-clamp-1">{msg.snippet}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SELECTED MESSAGE DETAIL VIEW */}
            {selectedMessage && (
              <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between font-bold text-white mb-2">
                  <span className="text-sm">{selectedMessage.subject}</span>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mb-2 font-mono">
                  From: {selectedMessage.from}
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 whitespace-pre-wrap font-sans text-[11px] leading-relaxed max-h-[140px] overflow-y-auto">
                  {selectedMessage.body || selectedMessage.snippet}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL (MANDATORY FOR WORKSPACE DESTRUCTIVE/MUTATING ACTIONS) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Confirm Gmail Dispatch</h3>
                <p className="text-xs text-slate-400">MLIMI SMART AI Gmail Integration</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-5">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Recipient:</span>
                <span className="font-mono text-emerald-300 font-bold">{actionItem?.recipientEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Subject:</span>
                <span className="text-white font-medium">{actionItem?.subject}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Message Preview:</span>
                <p className="text-slate-300 italic line-clamp-3 text-[11px] mt-0.5">"{actionItem?.body}"</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendEmail}
                disabled={isSending}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
