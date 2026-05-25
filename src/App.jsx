import { useState, useEffect, useCallback, useMemo, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   SEEDDATA & CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const PLANS = [
  { id: "starter", name: "Starter", price: 7500, maxProducts: 100, maxUsers: 3, durationDays: 30, color: "#6b7280", brandUpload: false },
  { id: "growth",  name: "Growth", price: 15000, maxProducts: 1500, maxUsers: 10, durationDays: 30, color: "#0ea5e9", brandUpload: true },
  { id: "pro",     name: "Pro",  price: 28000, maxProducts: 999999, maxUsers: 999, durationDays: 30, color: "#8b5cf6", brandUpload: true },
];

const BUSINESS_TYPES = ["PHARMACY", "EATERY", "SUPERMARKET"];

const TYPE_THEME = {
  PHARMACY:   { accent: "#0d9488", bg: "#f0fdfa", icon: "💊", label: "Pharmacy" },
  EATERY:     { accent: "#d97706", bg: "#fffbeb", icon: "🍽️", label: "Eatery" },
  SUPERMARKET:{ accent: "#2563eb", bg: "#eff6ff", icon: "🛒", label: "Supermarket" },
};

const SEED_PRODUCTS = {
  PHARMACY: [
    { id: "p1", name: "Paracetamol 500mg", sku: "RX-001", category: "Analgesic", qty: 240, price: 450, cost: 200, unit: "Tabs", expiryDate: futureDateStr(25) },
    { id: "p2", name: "Amoxicillin 250mg", sku: "RX-002", category: "Antibiotic", qty: 80, price: 1200, cost: 600, unit: "Caps", expiryDate: futureDateStr(15) },
    { id: "p3", name: "Metformin 500mg", sku: "RX-003", category: "Antidiabetic", qty: 150, price: 900, cost: 400, unit: "Tabs", expiryDate: futureDateStr(90) },
    { id: "p4", name: "Vitamin C 1000mg", sku: "OTC-001", category: "Supplement", qty: 300, price: 750, cost: 300, unit: "Tabs", expiryDate: futureDateStr(180) },
    { id: "p5", name: "Insulin Glargine", sku: "RX-010", category: "Antidiabetic", qty: 12, price: 8500, cost: 4200, unit: "Vial", expiryDate: futureDateStr(8) },
  ],
  EATERY: [
    { id: "e1", name: "Jollof Rice + Chicken", sku: "FOOD-001", category: "Main Course", qty: 50, price: 2500, cost: 900, unit: "Plate", expiryDate: futureDateStr(1) },
    { id: "e2", name: "Suya Plate", sku: "FOOD-002", category: "Grill", qty: 30, price: 1800, cost: 700, unit: "Plate", expiryDate: futureDateStr(1) },
    { id: "e3", name: "Chapman (Large)", sku: "DRK-001", category: "Drinks", qty: 24, price: 800, cost: 250, unit: "Bottle", expiryDate: futureDateStr(45) },
    { id: "e4", name: "Puff Puff (6 pcs)", sku: "SNK-001", category: "Snacks", qty: 40, price: 500, cost: 150, unit: "Pack", expiryDate: futureDateStr(2) },
    { id: "e5", name: "Fried Plantain", sku: "SIDE-001", category: "Sides", qty: 20, price: 600, cost: 200, unit: "Plate", expiryDate: futureDateStr(1) },
  ],
  SUPERMARKET: [
    { id: "s1", name: "Indomie Noodles (Carton)", sku: "GRO-001", category: "Dry Goods", qty: 48, price: 4200, cost: 3200, unit: "Ctn", expiryDate: futureDateStr(180) },
    { id: "s2", name: "Peak Milk 400g", sku: "GRO-002", category: "Dairy", qty: 72, price: 2800, cost: 2000, unit: "Tin", expiryDate: futureDateStr(28) },
    { id: "s3", name: "Groundnut Oil 5L", sku: "GRO-003", category: "Cooking Oil", qty: 24, price: 5500, cost: 4000, unit: "Jug", expiryDate: futureDateStr(365) },
    { id: "s4", name: "Spaghetti 500g", sku: "GRO-004", category: "Pasta", qty: 60, price: 850, cost: 600, unit: "Pack", expiryDate: futureDateStr(22) },
    { id: "s5", name: "Yam Flour 2kg", sku: "GRO-005", category: "Flour", qty: 36, price: 2200, cost: 1500, unit: "Bag", expiryDate: futureDateStr(60) },
  ],
};

function futureDateStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysDiff(dateStr) {
  const now = new Date(); now.setHours(0,0,0,0);
  const exp = new Date(dateStr); exp.setHours(0,0,0,0);
  return Math.ceil((exp - now) / 86400000);
}
function fmt(n) { return "₦" + Number(n).toLocaleString(); }
function uid() { return Math.random().toString(36).slice(2, 10); }
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

function txRef() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "ASP-" + ts + "-" + rand;
}

function exportCSV(rows, headers, filename) {
  const esc   = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const lines = [headers.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))];
  const blob  = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}


/* ═══════════════════════════════════════════════════════════════════════════
   INITIAL PLATFORM STATE
═══════════════════════════════════════════════════════════════════════════ */
function initPlatform() {
  const tenantId1 = "tenant_" + uid();
  const tenantId2 = "tenant_" + uid();
  const tenantId3 = "tenant_" + uid();
  const now = new Date().toISOString();
  const exp30 = new Date(Date.now() + 30 * 864e5).toISOString();
  const exp5  = new Date(Date.now() +  5 * 864e5).toISOString();

  const makeTenant = (id, name, type, plan, expiry, address) => ({
    id, name, type, planId: plan, address,
    phone: "080" + Math.floor(Math.random()*1e8).toString().padStart(8,"0"),
    email: name.toLowerCase().replace(/ /g,"") + "@example.com",
    createdAt: now,
    subscriptionExpiry: expiry,
    paystackRef: "PST_" + uid().toUpperCase(),
    loginCode: name.replace(/[ ]+/g,"").slice(0,6).toUpperCase() + uid().slice(0,4).toUpperCase(),
    users: [
      { id: uid(), name: "Owner", email: name.toLowerCase().replace(/ /g,"") + "@biz.com", role: "tenant_super", password: "admin123", createdAt: now, employeeId: "EMP-001" },
      { id: uid(), name: "Store Manager", email: "manager@" + name.toLowerCase().replace(/ /g,"") + ".com", role: "admin", password: "manager123", createdAt: now, employeeId: "EMP-002" },
      { id: uid(), name: "Sales Rep", email: "sales@" + name.toLowerCase().replace(/ /g,"") + ".com", role: "salesperson", password: "sales123", createdAt: now, employeeId: "EMP-003" },
    ],
    products: SEED_PRODUCTS[type].map(p => ({ ...p, id: uid() })),
    sales: generateSales(type),
    expiryAlertDays: 30,
    brandLogo: null,
    brandColor: null,
    receiptFooter: "Thank you for your business!",
    tables: type === "EATERY" ? Array.from({length:8},(_,i)=>({id:uid(),number:i+1,status:"free",order:null})) : [],
  });

  function generateSales(type) {
    const prods = SEED_PRODUCTS[type];
    return Array.from({ length: 18 }, (_, i) => {
      const prod = prods[i % prods.length];
      const qty = Math.ceil(Math.random() * 5);
      const daysAgo = Math.floor(Math.random() * 30);
      const d = new Date(); d.setDate(d.getDate() - daysAgo);
      return {
        id: uid(), txRef: "ASP-" + Date.now().toString(36).toUpperCase() + "-" + uid().slice(0,4).toUpperCase(),
        productId: prod.id, productName: prod.name, sku: prod.sku || "",
        qty, price: prod.price, total: prod.price * qty,
        date: d.toISOString(),
        cashierName: "Sales Rep", cashierId: "seeduser", employeeId: "EMP-003",
        paymentMethod: ["Cash","Card","Bank Transfer","USSD"][i % 4],
      };
    });
  }

  return {
    superAdmin: { email: "superadmin@anchorsalespro.ng", password: "SuperAdmin@2026", name: "TrioPOS Admin" },
    paystackPublicKey: "pk_test_xxxxxxxxxxxxxxxxxxxx",
    paystackSecretKey: "sk_test_xxxxxxxxxxxxxxxxxxxx",
    paystackAccountName: "TrioPOS Technologies Ltd",
    paystackBankName: "Access Bank",
    paystackAccountNumber: "0123456789",
    plans: PLANS,
    tenants: [
      makeTenant(tenantId1, "Lagos MedPlus", "PHARMACY", "growth", exp5, "14 Broad St, Lagos Island"),
      makeTenant(tenantId2, "Mama Titi Kitchen", "EATERY", "starter", exp30, "22 Allen Ave, Ikeja"),
      makeTenant(tenantId3, "FreshMart Superstore", "SUPERMARKET", "pro", exp30, "Block C, Lekki Phase 1"),
    ],
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════════
   DEVICE FINGERPRINT
═══════════════════════════════════════════════════════════════════════════ */
function getDeviceFingerprint() {
  const nav = window.navigator;
  const raw = [
    nav.userAgent, nav.language, nav.platform,
    screen.width, screen.height, screen.colorDepth,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 0,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return "DEV_" + Math.abs(hash).toString(36).toUpperCase().padStart(8,"0");
}

function getDeviceName() {
  const ua = window.navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android Device";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Unknown Device";
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEVICE GATE SCREEN
═══════════════════════════════════════════════════════════════════════════ */
function DeviceGateScreen({ onSubmit }) {
  const [form, setForm] = useState({ fullName:"", phone:"", email:"" });
  const [err, setErr] = useState("");

  function submit() {
    if (!form.fullName.trim()) { setErr("Full name is required."); return; }
    if (!form.phone.trim() || form.phone.length < 10) { setErr("Valid phone number is required."); return; }
    setErr("");
    onSubmit(form);
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0a14 0%,#12101e 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Georgia',serif", padding:"20px" }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontSize:"44px", marginBottom:"10px" }}>⚓</div>
          <div style={{ fontSize:"26px", fontWeight:"700", color:"#fff", letterSpacing:"-0.5px" }}>Anchor Sales Pro</div>
          <div style={{ fontSize:"11px", color:"#4a4a6a", letterSpacing:"3px", textTransform:"uppercase", marginTop:"4px" }}>New Device Detected</div>
        </div>

        <div style={{ background:"#0f0f1e", border:"1px solid #1e1e3a", borderRadius:"14px", padding:"28px" }}>
          <div style={{ background:"#1a1020", border:"1px solid #3a1a4a", borderRadius:"10px", padding:"14px", marginBottom:"22px" }}>
            <div style={{ fontSize:"12px", color:"#9a6aaa", fontWeight:"700", marginBottom:"4px" }}>🔒 Device Verification Required</div>
            <div style={{ fontSize:"12px", color:"#6a5a7a", lineHeight:"1.6" }}>
              This device has not been approved for your account. Please provide your details — your administrator will be notified to approve this device before you can log in.
            </div>
          </div>

          <div style={{ marginBottom:"16px" }}>
            <label style={lbl}>Full Name <span style={{ color:"#ef4444" }}>*</span></label>
            <input style={inp} placeholder="e.g. Adebayo Okonkwo"
              value={form.fullName} onChange={e=>setForm(p=>({...p,fullName:e.target.value}))} />
          </div>
          <div style={{ marginBottom:"16px" }}>
            <label style={lbl}>Phone Number <span style={{ color:"#ef4444" }}>*</span></label>
            <input style={inp} placeholder="080XXXXXXXX" type="tel"
              value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} />
          </div>
          <div style={{ marginBottom:"22px" }}>
            <label style={lbl}>Email Address <span style={{ color:"#6a6a8a" }}>(optional)</span></label>
            <input style={inp} placeholder="your@email.com" type="email"
              value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} />
          </div>

          {err && <div style={{ background:"#2a0808", border:"1px solid #5a1a1a", borderRadius:"8px", padding:"10px 14px", color:"#ff6b6b", fontSize:"13px", marginBottom:"16px" }}>{err}</div>}

          <button onClick={submit} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"700", cursor:"pointer" }}>
            Request Device Access →
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:"14px", fontSize:"11px", color:"#3a3a5a" }}>
          Device ID: {getDeviceFingerprint()}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PENDING APPROVAL SCREEN
═══════════════════════════════════════════════════════════════════════════ */
function PendingApprovalScreen({ deviceId, requesterName, onBack }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0a0a14 0%,#12101e 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Georgia',serif", padding:"20px" }}>
      <div style={{ width:"100%", maxWidth:"400px", textAlign:"center" }}>
        <div style={{ fontSize:"56px", marginBottom:"16px" }}>⏳</div>
        <div style={{ fontSize:"22px", fontWeight:"700", color:"#fff", marginBottom:"8px" }}>Awaiting Approval</div>
        <div style={{ fontSize:"14px", color:"#6a6a8a", lineHeight:"1.7", marginBottom:"28px" }}>
          Hi <strong style={{ color:"#a0a0d0" }}>{requesterName}</strong>, your device access request has been sent to the administrator.<br/>
          You'll be able to log in once they approve this device.
        </div>
        <div style={{ background:"#0f0f1e", border:"1px solid #1e1e3a", borderRadius:"12px", padding:"18px", marginBottom:"24px" }}>
          <div style={{ fontSize:"11px", color:"#4a4a6a", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"1px" }}>Your Device ID</div>
          <div style={{ fontFamily:"monospace", fontSize:"15px", color:"#8b5cf6", fontWeight:"700" }}>{deviceId}</div>
        </div>
        <button onClick={onBack} style={{ padding:"11px 28px", background:"#1a1a2e", border:"1px solid #2a2a4a", color:"#a0a0c0", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>← Back to Login</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP — with device trust + session limits
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [platform, setPlatform] = useState(() => {
    try {
      const saved = localStorage.getItem("asp_platform");
      return saved ? JSON.parse(saved) : initPlatform();
    } catch { return initPlatform(); }
  });

  // Device state: "checking" | "unknown" | "pending" | "approved"
  const deviceId = useMemo(() => getDeviceFingerprint(), []);
  const deviceName = useMemo(() => getDeviceName(), []);
  const [deviceState, setDeviceState] = useState("checking");
  const [deviceRequester, setDeviceRequester] = useState(null);

  const [session, setSession] = useState(null);
  const [loginForm, setLoginForm] = useState({ tenantCode:"", email:"", password:"" });
  const [loginError, setLoginError] = useState("");
  const [loginMode, setLoginMode] = useState("tenant");

  // Persist platform
  useEffect(() => {
    try { localStorage.setItem("asp_platform", JSON.stringify(platform)); } catch {}
  }, [platform]);

  // On mount: check if this device is known to the platform
  useEffect(() => {
    const allKnown = platform.tenants.flatMap(t => t.trustedDevices || [])
      .concat(platform.superDevices || []);
    const thisDevice = allKnown.find(d => d.deviceId === deviceId);
    if (thisDevice) {
      if (thisDevice.status === "approved") setDeviceState("approved");
      else if (thisDevice.status === "pending") {
        setDeviceState("pending");
        setDeviceRequester(thisDevice.requesterName);
      } else setDeviceState("unknown");
    } else {
      setDeviceState("unknown");
    }
  }, [deviceId]);

  const updatePlatform = useCallback((fn) => {
    setPlatform(prev => ({ ...fn(prev) }));
  }, []);

  const updateTenant = useCallback((tenantId, fn) => {
    setPlatform(prev => ({
      ...prev,
      tenants: prev.tenants.map(t => t.id === tenantId ? fn(t) : t),
    }));
  }, []);

  // Device registration request
  function handleDeviceRequest(formData) {
    const req = {
      deviceId, deviceName,
      requesterName: formData.fullName,
      requesterPhone: formData.phone,
      requesterEmail: formData.email,
      requestedAt: new Date().toISOString(),
      status: "pending",
      tenantId: null, // filled at login
    };
    // Store as a global pending device (super admin sees it; tenant admin sees it after login attempt)
    updatePlatform(p => ({
      ...p,
      pendingDevices: [...(p.pendingDevices || []), req],
    }));
    setDeviceState("pending");
    setDeviceRequester(formData.fullName);
  }

  function handleLogin() {
    setLoginError("");

    if (loginMode === "super") {
      if (loginForm.email === platform.superAdmin.email && loginForm.password === platform.superAdmin.password) {
        // Super admin: approved on ANY device — mark device as super approved
        updatePlatform(p => ({
          ...p,
          superDevices: [
            ...(p.superDevices||[]).filter(d=>d.deviceId!==deviceId),
            { deviceId, deviceName, status:"approved", approvedAt: new Date().toISOString(), role:"super_admin" }
          ]
        }));
        setDeviceState("approved");
        setSession({ role:"super_admin", tenantId:null, userName:platform.superAdmin.name });
        return;
      }
      setLoginError("Invalid super admin credentials.");
      return;
    }

    // Tenant login
    const tenant = platform.tenants.find(t =>
      t.id === loginForm.tenantCode ||
      t.loginCode === loginForm.tenantCode ||
      t.name.toLowerCase() === loginForm.tenantCode.toLowerCase()
    );
    if (!tenant) { setLoginError("Business not found. Check your access code."); return; }

    const user = tenant.users.find(u =>
      u.email === loginForm.email && u.password === loginForm.password
    );
    if (!user) { setLoginError("Invalid email or password."); return; }

    // Super admin of tenant — bypass device limit
    if (user.role === "tenant_super") {
      // Approve this device automatically for super admin role
      updateTenant(tenant.id, t => ({
        ...t,
        trustedDevices: [
          ...(t.trustedDevices||[]).filter(d=>d.deviceId!==deviceId),
          { deviceId, deviceName, status:"approved", userId:user.id, role:user.role, approvedAt:new Date().toISOString() }
        ]
      }));
      setDeviceState("approved");
      setSession({ role:user.role, tenantId:tenant.id, userId:user.id, userName:user.name });
      return;
    }

    // Check if device is approved for this tenant
    const td = (tenant.trustedDevices||[]).find(d=>d.deviceId===deviceId);
    if (!td || td.status!=="approved") {
      // Register a pending device for this tenant
      const existingPending = (tenant.trustedDevices||[]).find(d=>d.deviceId===deviceId&&d.status==="pending");
      if (!existingPending) {
        // Tag the pending device to this tenant
        updateTenant(tenant.id, t => ({
          ...t,
          trustedDevices: [
            ...(t.trustedDevices||[]).filter(d=>d.deviceId!==deviceId),
            {
              deviceId, deviceName,
              status: "pending",
              requesterName: deviceRequester || "Unknown",
              requestedAt: new Date().toISOString(),
              userId: user.id,
              userName: user.name,
              email: user.email,
            }
          ]
        }));
      }
      setDeviceState("pending");
      return;
    }

    // Device approved — check concurrent session limit (max 2 devices)
    const activeSessions = (tenant.activeSessions || []).filter(s =>
      s.userId === user.id && s.deviceId !== deviceId
    );
    if (activeSessions.length >= 2) {
      setLoginError("Maximum 2 active devices reached for this user. Please sign out from another device.");
      return;
    }

    // Register session
    const sessionId = uid();
    updateTenant(tenant.id, t => ({
      ...t,
      activeSessions: [
        ...(t.activeSessions||[]).filter(s=>s.deviceId!==deviceId),
        { sessionId, userId:user.id, deviceId, deviceName, loginAt:new Date().toISOString() }
      ]
    }));
    setSession({ role:user.role, tenantId:tenant.id, userId:user.id, userName:user.name, sessionId });
  }

  function handleLogout() {
    if (session?.tenantId && session?.sessionId) {
      updateTenant(session.tenantId, t => ({
        ...t,
        activeSessions: (t.activeSessions||[]).filter(s=>s.sessionId!==session.sessionId)
      }));
    }
    setSession(null);
    setLoginForm({ tenantCode:"", email:"", password:"" });
  }

  const currentTenant = session?.tenantId
    ? platform.tenants.find(t => t.id === session.tenantId)
    : null;

  // Render logic
  if (deviceState === "checking") {
    return <div style={{ minHeight:"100vh", background:"#0a0a14", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"Georgia,serif", fontSize:"16px" }}>Verifying device…</div>;
  }

  if (deviceState === "unknown" && !session) {
    return <DeviceGateScreen onSubmit={handleDeviceRequest} />;
  }

  if (deviceState === "pending" && !session) {
    return <PendingApprovalScreen deviceId={deviceId} requesterName={deviceRequester||"User"} onBack={()=>setDeviceState("unknown")} />;
  }

  if (!session) {
    return (
      <LoginScreen
        loginMode={loginMode} setLoginMode={setLoginMode}
        loginForm={loginForm} setLoginForm={setLoginForm}
        loginError={loginError} onLogin={handleLogin}
        platform={platform}
      />
    );
  }

  if (session.role === "super_admin") {
    return <SuperAdminApp platform={platform} updatePlatform={updatePlatform}
      onLogout={handleLogout} deviceId={deviceId} />;
  }

  return <TenantApp platform={platform} tenant={currentTenant} session={session}
    updateTenant={(fn) => updateTenant(currentTenant.id, fn)}
    updatePlatform={updatePlatform} onLogout={handleLogout} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN SCREEN — Anchor Sales Pro branded
═══════════════════════════════════════════════════════════════════════════ */
function LoginScreen({ loginMode, setLoginMode, loginForm, setLoginForm, loginError, onLogin, platform }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0a0a14 0%,#0f0c1a 60%,#0a1020 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Georgia',serif", padding:"20px" }}>
      <div style={{ position:"fixed", inset:0, backgroundImage:"radial-gradient(circle at 15% 25%, rgba(79,70,229,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(124,58,237,0.06) 0%, transparent 50%)", pointerEvents:"none" }} />

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:"460px" }}>
        {/* Brand */}
        <div style={{ textAlign:"center", marginBottom:"36px" }}>
          <div style={{ fontSize:"48px", marginBottom:"10px" }}>⚓</div>
          <div style={{ fontSize:"30px", fontWeight:"700", color:"#fff", letterSpacing:"-0.5px" }}>Anchor Sales Pro</div>
          <div style={{ fontSize:"11px", color:"#3a3a5a", letterSpacing:"3px", textTransform:"uppercase", marginTop:"6px" }}>Supermarket · Eatery · Pharmacy</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display:"flex", background:"#0d0d1e", borderRadius:"12px", padding:"4px", marginBottom:"24px", border:"1px solid #1a1a2e" }}>
          {[["tenant","Business Login"],["super","Platform Admin"]].map(([m,l]) => (
            <button key={m} onClick={() => setLoginMode(m)} style={{
              flex:1, padding:"11px", borderRadius:"9px", border:"none", cursor:"pointer",
              background: loginMode===m ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "transparent",
              color: loginMode===m ? "#fff" : "#4a4a6a",
              fontWeight: loginMode===m ? "700" : "400",
              fontSize:"13px", transition:"all 0.2s",
              fontFamily:"Georgia,serif",
            }}>{l}</button>
          ))}
        </div>

        <div style={{ background:"rgba(15,15,30,0.9)", borderRadius:"16px", padding:"30px", border:"1px solid #1e1e3a", backdropFilter:"blur(10px)" }}>
          {loginMode === "tenant" && (
            <div style={{ marginBottom:"18px" }}>
              <label style={lbl}>Business Access Code</label>
              <input style={inp} placeholder="Your unique business code"
                value={loginForm.tenantCode}
                onChange={e => setLoginForm(p => ({...p, tenantCode: e.target.value}))} />
              <div style={{ fontSize:"11px", color:"#3a3a5a", marginTop:"4px" }}>Ask your platform admin or use your business name</div>
            </div>
          )}
          <div style={{ marginBottom:"18px" }}>
            <label style={lbl}>Email Address</label>
            <input style={inp} type="email" placeholder="your@email.com"
              value={loginForm.email}
              onChange={e => setLoginForm(p => ({...p, email: e.target.value}))} />
          </div>
          <div style={{ marginBottom:"22px" }}>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" placeholder="••••••••"
              value={loginForm.password}
              onChange={e => setLoginForm(p => ({...p, password: e.target.value}))}
              onKeyDown={e => e.key==="Enter" && onLogin()} />
          </div>
          {loginError && (
            <div style={{ background:"#2a0808", border:"1px solid #5a1a1a", borderRadius:"10px", padding:"12px 16px", color:"#ff8888", fontSize:"13px", marginBottom:"18px", display:"flex", gap:"8px", alignItems:"flex-start" }}>
              <span>⚠️</span><span>{loginError}</span>
            </div>
          )}
          <button onClick={onLogin} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"#fff", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"700", cursor:"pointer", letterSpacing:"0.3px", fontFamily:"Georgia,serif" }}>
            Sign In →
          </button>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop:"22px", background:"rgba(13,13,30,0.8)", border:"1px solid #1a1a2e", borderRadius:"12px", padding:"18px" }}>
          <div style={{ color:"#3a3a5a", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"12px", fontWeight:"700" }}>Demo Credentials</div>
          <div style={{ display:"grid", gap:"7px", fontSize:"11px" }}>
            <div style={{ color:"#6b7aff", fontWeight:"600" }}>⚓ Super Admin: superadmin@anchorsalespro.ng / SuperAdmin@2026</div>
            <div style={{ color:"#4a5a4a" }}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
            {platform.tenants.map(t => {
              const owner = t.users.find(u=>u.role==="tenant_super");
              const theme = TYPE_THEME[t.type];
              return (
                <div key={t.id} style={{ color:"#4a4a6a" }}>
                  {theme.icon} <span style={{ color:"#7a7aaa" }}>{t.name}</span> → Code: <span style={{ color:"#9a6aff", fontFamily:"monospace" }}>{t.loginCode||t.id}</span> / {owner?.email} / admin123
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
const lbl = { display:"block", fontSize:"11px", color:"#5a5a8a", letterSpacing:"0.8px", marginBottom:"7px", textTransform:"uppercase", fontWeight:"600" };
const inp = { width:"100%", padding:"12px 16px", background:"#070714", border:"1px solid #1e1e3a", borderRadius:"9px", color:"#e8e8f8", fontSize:"14px", outline:"none", boxSizing:"border-box", fontFamily:"Georgia,serif", transition:"border-color 0.2s" };

function SuperAdminApp({ platform, updatePlatform, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [showNewTenant, setShowNewTenant] = useState(false);

  const totalMRR = platform.tenants.reduce((s, t) => {
    const plan = platform.plans.find(p => p.id === t.planId);
    return s + (plan?.price || 0);
  }, 0);

  const allPendingCount = platform.tenants.reduce((s,t)=>s+(t.trustedDevices||[]).filter(d=>d.status==="pending").length,0);

  const expiringSoon = platform.tenants.filter(t => {
    const days = daysDiff(t.subscriptionExpiry);
    return days <= 7 && days >= 0;
  });

  const nav = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"tenants", icon:"🏢", label:"Tenants" },
    { id:"plans", icon:"📋", label:"Plans" },
    { id:"payments", icon:"💳", label:"Payments" },
    { id:"search",  icon:"🔍", label:"Global Search" },
    { id:"devices", icon:"📱", label:"Devices" },
    { id:"settings", icon:"⚙️", label:"Settings" },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", background:"#050508", fontFamily:"'Georgia',serif", color:"#e8e8f0", overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:"220px", background:"#0a0a12", borderRight:"1px solid #1a1a2a", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"24px 20px", borderBottom:"1px solid #1a1a2a" }}>
          <div style={{ fontSize:"20px", fontWeight:"700", color:"#fff", letterSpacing:"-0.3px" }}>⚓ Anchor Sales</div>
          <div style={{ fontSize:"10px", color:"#4a4a6a", letterSpacing:"2px", marginTop:"2px", textTransform:"uppercase" }}>Sales Pro</div>
        </div>
        <nav style={{ flex:1, padding:"12px 10px" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display:"flex", alignItems:"center", gap:"10px", width:"100%",
              padding:"11px 14px", border:"none", borderRadius:"8px", cursor:"pointer",
              background: page===n.id ? "#1a1a2e" : "transparent",
              color: page===n.id ? "#fff" : "#5a5a7a",
              fontSize:"14px", marginBottom:"2px", textAlign:"left",
              transition:"all 0.15s",
            }}>
              <span>{n.icon}</span><span>{n.label}</span>
              {n.id==="devices" && allPendingCount > 0 ? (
                <span style={{ marginLeft:"auto", background:"#f59e0b", color:"#fff", borderRadius:"10px", padding:"1px 7px", fontSize:"10px", fontWeight:"700" }}>{allPendingCount}</span>
              ) : n.id==="tenants" && expiringSoon.length > 0 && (
                <span style={{ marginLeft:"auto", background:"#c0392b", color:"#fff", borderRadius:"10px", padding:"1px 7px", fontSize:"10px", fontWeight:"700" }}>{expiringSoon.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding:"14px 10px", borderTop:"1px solid #1a1a2a" }}>
          <div style={{ padding:"10px 14px", background:"#111", borderRadius:"8px", marginBottom:"8px" }}>
            <div style={{ fontSize:"10px", color:"#4a4a6a", textTransform:"uppercase", letterSpacing:"1px" }}>Monthly Revenue</div>
            <div style={{ fontSize:"18px", fontWeight:"700", color:"#4ade80", marginTop:"2px" }}>{fmt(totalMRR)}</div>
          </div>
          <button onClick={onLogout} style={{ width:"100%", padding:"9px", background:"#1a0a0a", border:"1px solid #2a1a1a", borderRadius:"8px", color:"#cc5555", fontSize:"13px", cursor:"pointer" }}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto" }}>
        {page==="dashboard" && <SuperDashboard platform={platform} expiringSoon={expiringSoon} totalMRR={totalMRR} />}
        {page==="tenants" && <TenantsPage platform={platform} updatePlatform={updatePlatform} />}
        {page==="plans" && <PlansPage platform={platform} updatePlatform={updatePlatform} />}
        {page==="payments" && <PaymentsPage platform={platform} updatePlatform={updatePlatform} />}
        {page==="settings" && <SettingsPage platform={platform} updatePlatform={updatePlatform} />}
        {page==="search"  && <GlobalSearchPage platform={platform} />}
        {page==="devices" && <DevicesPage platform={platform} updatePlatform={updatePlatform} />}
      </div>
    </div>
  );
}

function SuperDashboard({ platform, expiringSoon, totalMRR }) {
  const byType = BUSINESS_TYPES.reduce((a,t) => {
    a[t] = platform.tenants.filter(x => x.type===t).length; return a;
  }, {});
  const totalRevenue = platform.tenants.reduce((s,t) => s + t.sales.reduce((ss,sale) => ss + sale.total, 0), 0);

  return (
    <div style={{ padding:"32px" }}>
      <div style={{ marginBottom:"28px" }}>
        <div style={{ fontSize:"24px", fontWeight:"700", color:"#fff" }}>Platform Dashboard</div>
        <div style={{ fontSize:"13px", color:"#5a5a7a", marginTop:"4px" }}>Real-time overview of all tenants</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"28px" }}>
        {[
          { label:"Total Tenants", value:platform.tenants.length, icon:"🏢", color:"#4f46e5" },
          { label:"Monthly Revenue", value:fmt(totalMRR), icon:"💰", color:"#059669" },
          { label:"Expiring Soon (7d)", value:expiringSoon.length, icon:"⏰", color: expiringSoon.length>0?"#dc2626":"#6b7280" },
          { label:"Total Sales Volume", value:fmt(totalRevenue), icon:"📈", color:"#d97706" },
        ].map(stat => (
          <div key={stat.label} style={{ background:"#0d0d18", border:"1px solid #1a1a2a", borderRadius:"12px", padding:"20px" }}>
            <div style={{ fontSize:"22px", marginBottom:"8px" }}>{stat.icon}</div>
            <div style={{ fontSize:"22px", fontWeight:"700", color:stat.color }}>{stat.value}</div>
            <div style={{ fontSize:"12px", color:"#5a5a7a", marginTop:"4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Expiry alerts */}
      {expiringSoon.length > 0 && (
        <div style={{ background:"#1a0808", border:"1px solid #4a1010", borderRadius:"12px", padding:"20px", marginBottom:"24px" }}>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#ff6b6b", marginBottom:"12px" }}>⚠️ Subscription Expiry Alerts</div>
          {expiringSoon.map(t => {
            const days = daysDiff(t.subscriptionExpiry);
            const plan = platform.plans.find(p => p.id === t.planId);
            return (
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #2a1010" }}>
                <div>
                  <span style={{ color:"#fff", fontWeight:"600" }}>{t.name}</span>
                  <span style={{ color:"#5a5a7a", fontSize:"12px", marginLeft:"10px" }}>{t.type} · {plan?.name}</span>
                </div>
                <span style={{ background:days<=3?"#7f1d1d":"#451a03", color:days<=3?"#fca5a5":"#fcd34d", padding:"3px 10px", borderRadius:"20px", fontSize:"12px", fontWeight:"700" }}>
                  {days <= 0 ? "EXPIRED" : `${days}d left`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tenants grid */}
      <div style={{ fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"14px" }}>All Tenants</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"14px" }}>
        {platform.tenants.map(t => {
          const plan = platform.plans.find(p => p.id === t.planId);
          const days = daysDiff(t.subscriptionExpiry);
          const theme = TYPE_THEME[t.type];
          const salesTotal = t.sales.reduce((s,x) => s+x.total, 0);
          return (
            <div key={t.id} style={{ background:"#0d0d18", border:`1px solid #1a1a2a`, borderRadius:"12px", padding:"18px", borderLeft:`3px solid ${theme.accent}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                <div>
                  <div style={{ fontSize:"16px", fontWeight:"700", color:"#fff" }}>{theme.icon} {t.name}</div>
                  <div style={{ fontSize:"11px", color:theme.accent, marginTop:"2px", textTransform:"uppercase", letterSpacing:"1px" }}>{theme.label}</div>
                </div>
                <span style={{ background:days<=7?"#451a03":days<=30?"#1c1a03":"#0a1a10", color:days<=7?"#fcd34d":days<=30?"#fde68a":"#4ade80", padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"700" }}>
                  {days <= 0 ? "EXPIRED" : `${days}d`}
                </span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", fontSize:"12px", color:"#5a5a7a" }}>
                <div>Plan: <span style={{ color:"#a0a0c0" }}>{plan?.name}</span></div>
                <div>Users: <span style={{ color:"#a0a0c0" }}>{t.users.length}</span></div>
                <div>Products: <span style={{ color:"#a0a0c0" }}>{t.products.length}</span></div>
                <div>Sales: <span style={{ color:"#4ade80" }}>{fmt(salesTotal)}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TenantsPage({ platform, updatePlatform }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", type:"PHARMACY", planId:"growth", address:"", phone:"", email:"" });

  function createTenant() {
    const id = "tenant_" + uid();
    const now = new Date().toISOString();
    const exp = new Date(Date.now() + 30*864e5).toISOString();
    const newTenant = {
      id, ...form,
      createdAt: now, subscriptionExpiry: exp,
      paystackRef: "PST_" + uid().toUpperCase(),
      users: [{
        id: uid(), name:"Owner", email: form.email,
        role:"tenant_super", password:"admin123", createdAt: now,
      }],
      products: SEED_PRODUCTS[form.type].map(p => ({...p, id:uid()})),
      sales: [], expiryAlertDays: 30,
      tables: form.type==="EATERY" ? Array.from({length:6},(_,i)=>({id:uid(),number:i+1,status:"free",order:null})) : [],
    };
    updatePlatform(p => ({ ...p, tenants: [...p.tenants, newTenant] }));
    setShowForm(false);
    setForm({ name:"", type:"PHARMACY", planId:"growth", address:"", phone:"", email:"" });
  }

  return (
    <div style={{ padding:"32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <div style={{ fontSize:"22px", fontWeight:"700", color:"#fff" }}>Tenants</div>
          <div style={{ fontSize:"13px", color:"#5a5a7a" }}>{platform.tenants.length} businesses on platform</div>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding:"10px 20px", background:"#4f46e5", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>+ New Tenant</button>
      </div>

      {showForm && (
        <div style={{ background:"#0d0d18", border:"1px solid #2a2a3a", borderRadius:"12px", padding:"24px", marginBottom:"24px" }}>
          <div style={{ fontSize:"16px", fontWeight:"700", color:"#fff", marginBottom:"18px" }}>Create New Tenant</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            {[["Business Name","name","text"],["Email","email","email"],["Phone","phone","text"],["Address","address","text"]].map(([label,key,type]) => (
              <div key={key}>
                <div style={{ fontSize:"11px", color:"#5a5a7a", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
                <input value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                  style={{ ...inp, background:"#070710" }} type={type} />
              </div>
            ))}
            <div>
              <div style={{ fontSize:"11px", color:"#5a5a7a", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Business Type</div>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                style={{ ...inp, background:"#070710" }}>
                {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:"11px", color:"#5a5a7a", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Plan</div>
              <select value={form.planId} onChange={e=>setForm(p=>({...p,planId:e.target.value}))}
                style={{ ...inp, background:"#070710" }}>
                {platform.plans.map(pl => <option key={pl.id} value={pl.id}>{pl.name} — {fmt(pl.price)}/mo</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:"10px", marginTop:"18px" }}>
            <button onClick={createTenant} style={{ padding:"10px 22px", background:"#4f46e5", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Create Tenant</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:"10px 22px", background:"#1a1a2a", color:"#aaa", border:"none", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gap:"12px" }}>
        {platform.tenants.map(t => {
          const plan = platform.plans.find(p => p.id === t.planId);
          const days = daysDiff(t.subscriptionExpiry);
          const theme = TYPE_THEME[t.type];
          return (
            <div key={t.id} style={{ background:"#0d0d18", border:"1px solid #1a1a2a", borderRadius:"12px", padding:"20px", borderLeft:`3px solid ${theme.accent}`, display:"flex", alignItems:"center", gap:"20px" }}>
              <div style={{ fontSize:"28px" }}>{theme.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"16px", fontWeight:"700", color:"#fff" }}>{t.name}</div>
                <div style={{ fontSize:"12px", color:"#5a5a7a", marginTop:"3px" }}>{t.address} · {t.email}</div>
                <div style={{ fontSize:"11px", color:"#4a4a6a", marginTop:"2px" }}>ID: {t.id}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"11px", color:"#5a5a7a" }}>Plan</div>
                <div style={{ fontSize:"14px", fontWeight:"700", color:plan?.color||"#fff" }}>{plan?.name}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"11px", color:"#5a5a7a" }}>Users</div>
                <div style={{ fontSize:"14px", fontWeight:"700", color:"#a0a0c0" }}>{t.users.length}</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"11px", color:"#5a5a7a" }}>Sub Expires</div>
                <div style={{ fontSize:"13px", fontWeight:"700", color:days<=7?"#ff6b6b":days<=30?"#fbbf24":"#4ade80" }}>
                  {days<=0?"EXPIRED":`${days}d`}
                </div>
              </div>
              <button onClick={() => {
                const newDays = window.prompt("Extend subscription by how many days?", "30");
                if (newDays && !isNaN(newDays)) {
                  updatePlatform(p => ({
                    ...p, tenants: p.tenants.map(x => x.id===t.id ? {
                      ...x, subscriptionExpiry: new Date(Date.now()+Number(newDays)*864e5).toISOString()
                    } : x)
                  }));
                }
              }} style={{ padding:"7px 14px", background:"#1a1a2e", color:"#a0a0ff", border:"1px solid #2a2a4a", borderRadius:"6px", fontSize:"12px", cursor:"pointer" }}>Extend</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlansPage({ platform, updatePlatform }) {
  return (
    <div style={{ padding:"32px" }}>
      <div style={{ fontSize:"22px", fontWeight:"700", color:"#fff", marginBottom:"24px" }}>Subscription Plans</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
        {platform.plans.map(plan => (
          <div key={plan.id} style={{ background:"#0d0d18", border:`1px solid ${plan.color}44`, borderRadius:"14px", padding:"24px", borderTop:`3px solid ${plan.color}` }}>
            <div style={{ fontSize:"18px", fontWeight:"700", color:"#fff", marginBottom:"4px" }}>{plan.name}</div>
            <div style={{ fontSize:"28px", fontWeight:"700", color:plan.color, marginBottom:"16px" }}>{fmt(plan.price)}<span style={{ fontSize:"14px", color:"#5a5a7a" }}>/mo</span></div>
            {[
              ["Max Products", plan.maxProducts >= 999999 ? "Unlimited" : plan.maxProducts.toLocaleString()],
              ["Max Users", plan.maxUsers >= 999 ? "Unlimited" : plan.maxUsers],
              ["Duration", plan.durationDays + " days"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a1a2a", fontSize:"13px" }}>
                <span style={{ color:"#5a5a7a" }}>{k}</span>
                <span style={{ color:"#e0e0f0", fontWeight:"600" }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:"14px", fontSize:"12px", color:"#5a5a7a" }}>
              Tenants on plan: <span style={{ color:plan.color, fontWeight:"700" }}>
                {platform.tenants.filter(t=>t.planId===plan.id).length}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentsPage({ platform, updatePlatform }) {
  const expiring30 = platform.tenants.filter(t => { const d=daysDiff(t.subscriptionExpiry); return d>=0&&d<=30; });

  return (
    <div style={{ padding:"32px" }}>
      <div style={{ fontSize:"22px", fontWeight:"700", color:"#fff", marginBottom:"24px" }}>Payments & Paystack</div>

      {/* Paystack config */}
      <div style={{ background:"#0d0d18", border:"1px solid #1a2a1a", borderRadius:"12px", padding:"24px", marginBottom:"24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"18px" }}>
          <div style={{ width:"36px", height:"36px", background:"#00C3F7", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>💳</div>
          <div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#fff" }}>Paystack Configuration</div>
            <div style={{ fontSize:"12px", color:"#5a5a7a" }}>Payment collection account details</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", fontSize:"13px" }}>
          {[
            ["Account Name", platform.paystackAccountName],
            ["Bank", platform.paystackBankName],
            ["Account Number", platform.paystackAccountNumber],
            ["Public Key", platform.paystackPublicKey],
          ].map(([k,v]) => (
            <div key={k} style={{ background:"#070710", borderRadius:"8px", padding:"12px 16px" }}>
              <div style={{ color:"#4a4a6a", fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"4px" }}>{k}</div>
              <div style={{ color:"#e0e0f0", fontWeight:"600", fontFamily:"monospace", fontSize:"13px" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expiry alerts for collection */}
      <div style={{ fontSize:"16px", fontWeight:"700", color:"#fff", marginBottom:"14px" }}>⏰ Renewal Due (Next 30 Days)</div>
      <div style={{ display:"grid", gap:"10px" }}>
        {expiring30.length === 0 && <div style={{ color:"#4a4a6a", padding:"20px", textAlign:"center" }}>No renewals due in the next 30 days</div>}
        {expiring30.map(t => {
          const plan = platform.plans.find(p => p.id === t.planId);
          const days = daysDiff(t.subscriptionExpiry);
          const pct = Math.max(0, Math.min(100, (days/30)*100));
          return (
            <div key={t.id} style={{ background:"#0d0d18", border:"1px solid #1a1a2a", borderRadius:"10px", padding:"16px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <div>
                  <span style={{ color:"#fff", fontWeight:"600" }}>{t.name}</span>
                  <span style={{ color:"#5a5a7a", fontSize:"12px", marginLeft:"8px" }}>{t.type}</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:days<=7?"#ff6b6b":"#fbbf24", fontWeight:"700", fontSize:"14px" }}>{days<=0?"EXPIRED":`${days} days`}</div>
                  <div style={{ color:"#4ade80", fontSize:"13px", fontWeight:"700" }}>{fmt(plan?.price||0)}</div>
                </div>
              </div>
              <div style={{ background:"#1a1a2a", borderRadius:"4px", height:"4px" }}>
                <div style={{ width:`${100-pct}%`, background:days<=7?"#dc2626":days<=15?"#f59e0b":"#4ade80", height:"100%", borderRadius:"4px", transition:"width 0.3s" }} />
              </div>
              <div style={{ fontSize:"11px", color:"#4a4a6a", marginTop:"6px" }}>
                Due: {new Date(t.subscriptionExpiry).toLocaleDateString("en-NG")} · Paystack Ref: {t.paystackRef}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsPage({ platform, updatePlatform }) {
  const [form, setForm] = useState({
    paystackAccountName: platform.paystackAccountName,
    paystackBankName: platform.paystackBankName,
    paystackAccountNumber: platform.paystackAccountNumber,
    paystackPublicKey: platform.paystackPublicKey,
    paystackSecretKey: platform.paystackSecretKey,
  });
  return (
    <div style={{ padding:"32px" }}>
      <div style={{ fontSize:"22px", fontWeight:"700", color:"#fff", marginBottom:"24px" }}>Platform Settings</div>
      <div style={{ background:"#0d0d18", border:"1px solid #1a1a2a", borderRadius:"12px", padding:"24px", maxWidth:"560px" }}>
        <div style={{ fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"18px" }}>Paystack Account Details</div>
        {Object.entries(form).map(([key,val]) => (
          <div key={key} style={{ marginBottom:"14px" }}>
            <div style={{ fontSize:"11px", color:"#5a5a7a", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"5px" }}>
              {key.replace(/([A-Z])/g," $1").replace("Paystack","").trim()}
            </div>
            <input value={val} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
              style={{ ...inp, background:"#070710" }} />
          </div>
        ))}
        <button onClick={() => updatePlatform(p => ({...p,...form}))}
          style={{ padding:"10px 24px", background:"#4f46e5", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TENANT APP
═══════════════════════════════════════════════════════════════════════════ */
function TenantApp({ platform, tenant, session, updateTenant, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const theme = TYPE_THEME[tenant.type];
  const plan = platform.plans.find(p => p.id === tenant.planId);
  const daysLeft = daysDiff(tenant.subscriptionExpiry);
  const expiring = daysLeft <= 30;
  const critical = daysLeft <= 7;
  const acc      = tenant.brandColor || theme.accent;

  const navItems = [
    { id:"dashboard", icon:"📊", label:"Dashboard", roles:["tenant_super","admin","salesperson"] },
    { id:"pos", icon:"🛒", label:"Point of Sale", roles:["tenant_super","admin","salesperson"] },
    { id:"inventory", icon:"📦", label:"Inventory", roles:["tenant_super","admin"] },
    ...(tenant.type==="EATERY" ? [{ id:"tables", icon:"🪑", label:"Tables", roles:["tenant_super","admin","salesperson"] }] : []),
    { id:"sales", icon:"📈", label:"Sales & Reports", roles:["tenant_super","admin"] },
    { id:"users", icon:"👥", label:"Users", roles:["tenant_super","admin"] },
    { id:"devices", icon:"📱", label:"Devices", roles:["tenant_super"] },
    { id:"branding",     icon:"🎨", label:"Branding",      roles:["tenant_super"] },
    { id:"subscription", icon:"💳", label:"Subscription",  roles:["tenant_super"] },
  ].filter(n => n.roles.includes(session.role));

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Georgia',serif", color:"#1a1a2a", overflow:"hidden", background:"#f8f9ff" }}>
      {/* Sidebar */}
      <div style={{ width:"220px", background:`linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)`, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"18px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {tenant.brandLogo
            ? <img src={tenant.brandLogo} alt={tenant.name} style={{ height:36, objectFit:"contain", marginBottom:6, borderRadius:4 }} />
            : <div style={{ fontSize:"20px", marginBottom:4 }}>{theme.icon}</div>}
          <div style={{ fontSize:"14px", fontWeight:"700", color:"#fff", lineHeight:"1.2" }}>{tenant.name}</div>
          <div style={{ fontSize:"9px", color:acc, textTransform:"uppercase", letterSpacing:"1.5px", marginTop:3 }}>{theme.label}</div>
          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:4 }}>
            {session.userName} · {session.role==="tenant_super"?"Super Admin":session.role==="admin"?"Admin":"Salesperson"}
            {session.employeeId && <span style={{ color:"rgba(255,255,255,0.2)", marginLeft:4 }}>· {session.employeeId}</span>}
          </div>
        </div>
        <nav style={{ flex:1, padding:"10px 8px" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={()=>setPage(n.id)} style={{
              display:"flex", alignItems:"center", gap:"10px", width:"100%",
              padding:"10px 12px", border:"none", borderRadius:"8px", cursor:"pointer",
              background: page===n.id ? theme.accent+"33" : "transparent",
              color: page===n.id ? "#fff" : "#6a6a8a",
              fontSize:"13px", marginBottom:"2px", textAlign:"left",
              borderLeft: page===n.id ? `2px solid ${theme.accent}` : "2px solid transparent",
              transition:"all 0.15s",
            }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        {/* Sub status */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid #2a2a3a" }}>
          {expiring && (
            <div style={{ background:critical?"#2a0808":"#1c1506", borderRadius:"8px", padding:"10px", marginBottom:"8px", border:`1px solid ${critical?"#5a1010":"#4a3a00"}` }}>
              <div style={{ fontSize:"10px", color:critical?"#ff6b6b":"#fbbf24", fontWeight:"700", marginBottom:"2px" }}>
                {critical?"⚠️ CRITICAL":"⏰"} Subscription
              </div>
              <div style={{ fontSize:"13px", color:critical?"#fca5a5":"#fde68a", fontWeight:"700" }}>
                {daysLeft<=0?"EXPIRED":`${daysLeft} days left`}
              </div>
              <div style={{ fontSize:"10px", color:"#4a4a6a", marginTop:"2px" }}>{plan?.name} Plan · {fmt(plan?.price||0)}/mo</div>
            </div>
          )}
          <button onClick={onLogout} style={{ width:"100%", padding:"9px", background:"#1a0a0a", border:"1px solid #2a1a1a", borderRadius:"8px", color:"#cc5555", fontSize:"12px", cursor:"pointer" }}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto", background:"#f4f4fb" }}>
        {page==="dashboard" && <TenantDashboard tenant={tenant} theme={theme} plan={plan} daysLeft={daysLeft} platform={platform} />}
        {page==="pos" && <POSPage tenant={tenant} theme={theme} updateTenant={updateTenant} session={session} acc={acc} />}
        {page==="inventory" && <InventoryPage tenant={tenant} theme={theme} updateTenant={updateTenant} plan={plan} />}
        {page==="tables" && tenant.type==="EATERY" && <TablesPage tenant={tenant} theme={theme} updateTenant={updateTenant} />}
        {page==="sales" && <SalesReportsPage tenant={tenant} theme={theme} />}
        {page==="users" && <UsersPage tenant={tenant} theme={theme} updateTenant={updateTenant} session={session} plan={plan} />}
        {page==="devices" && <TenantDevicesPage tenant={tenant} theme={theme} updateTenant={updateTenant} /> }
        {page==="branding"     && <BrandingPage tenant={tenant} theme={theme} updateTenant={updateTenant} plan={plan} />}
        {page==="subscription" && <SubscriptionPage tenant={tenant} theme={theme} plan={plan} daysLeft={daysLeft} platform={platform} acc={acc} />}
      </div>
    </div>
  );
}

/* ── Tenant Dashboard ─────────────────────────────────────────────────────── */
function TenantDashboard({ tenant, theme, plan, daysLeft, platform }) {
  const totalSales = tenant.sales.reduce((s,x) => s+x.total, 0);
  const totalCost = tenant.sales.reduce((s,x) => {
    const prod = tenant.products.find(p => p.id === x.productId);
    return s + (prod?.cost||0) * x.qty;
  }, 0);
  const profit = totalSales - totalCost;

  const inventoryWorth = tenant.products.reduce((s,p) => s + p.qty*p.cost, 0);
  const retailWorth = tenant.products.reduce((s,p) => s + p.qty*p.price, 0);

  const expiringProducts = tenant.products.filter(p => {
    const d = daysDiff(p.expiryDate);
    return d >= 0 && d <= (tenant.expiryAlertDays || 30);
  });

  const expiredProducts = tenant.products.filter(p => daysDiff(p.expiryDate) < 0);

  const today = new Date().toDateString();
  const todaySales = tenant.sales.filter(s => new Date(s.date).toDateString()===today).reduce((s,x)=>s+x.total,0);

  const salesByDay = {};
  tenant.sales.forEach(s => {
    const d = new Date(s.date).toLocaleDateString("en-NG");
    salesByDay[d] = (salesByDay[d]||0) + s.total;
  });

  return (
    <div style={{ padding:"28px" }}>
      <div style={{ marginBottom:"24px" }}>
        <div style={{ fontSize:"22px", fontWeight:"700", color:"#1a1a2a" }}>{theme.icon} {tenant.name} Dashboard</div>
        <div style={{ fontSize:"13px", color:"#8a8aaa", marginTop:"4px" }}>{tenant.address}</div>
      </div>

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px", marginBottom:"24px" }}>
        {[
          { label:"Today's Sales", value:fmt(todaySales), icon:"💵", color:theme.accent, sub:"Today" },
          { label:"Total Revenue", value:fmt(totalSales), icon:"📈", color:"#059669", sub:"All time" },
          { label:"Gross Profit", value:fmt(profit), icon:"💰", color:"#7c3aed", sub:`Margin ${totalSales>0?Math.round((profit/totalSales)*100):0}%` },
          { label:"Inventory Worth", value:fmt(inventoryWorth), icon:"📦", color:"#d97706", sub:`Retail: ${fmt(retailWorth)}` },
        ].map(stat => (
          <div key={stat.label} style={{ background:"#fff", borderRadius:"12px", padding:"18px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", borderTop:`3px solid ${stat.color}` }}>
            <div style={{ fontSize:"20px", marginBottom:"8px" }}>{stat.icon}</div>
            <div style={{ fontSize:"20px", fontWeight:"700", color:stat.color }}>{stat.value}</div>
            <div style={{ fontSize:"12px", color:"#8a8aaa", marginTop:"3px" }}>{stat.label}</div>
            <div style={{ fontSize:"11px", color:"#aaa", marginTop:"1px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Expiry alerts */}
      {(expiringProducts.length > 0 || expiredProducts.length > 0) && (
        <div style={{ display:"grid", gridTemplateColumns:expiredProducts.length>0?"1fr 1fr":"1fr", gap:"14px", marginBottom:"24px" }}>
          {expiringProducts.length > 0 && (
            <div style={{ background:"#fffbeb", border:"1px solid #f59e0b", borderRadius:"12px", padding:"18px" }}>
              <div style={{ fontWeight:"700", color:"#92400e", marginBottom:"12px" }}>⚠️ Expiring Within {tenant.expiryAlertDays||30} Days ({expiringProducts.length})</div>
              {expiringProducts.slice(0,4).map(p => (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #fde68a", fontSize:"13px" }}>
                  <span style={{ color:"#78350f" }}>{p.name}</span>
                  <span style={{ fontWeight:"700", color:daysDiff(p.expiryDate)<=7?"#dc2626":"#d97706" }}>
                    {daysDiff(p.expiryDate)}d · Qty:{p.qty}
                  </span>
                </div>
              ))}
            </div>
          )}
          {expiredProducts.length > 0 && (
            <div style={{ background:"#fef2f2", border:"1px solid #ef4444", borderRadius:"12px", padding:"18px" }}>
              <div style={{ fontWeight:"700", color:"#991b1b", marginBottom:"12px" }}>🚫 EXPIRED Products ({expiredProducts.length})</div>
              {expiredProducts.slice(0,4).map(p => (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #fecaca", fontSize:"13px" }}>
                  <span style={{ color:"#7f1d1d" }}>{p.name}</span>
                  <span style={{ fontWeight:"700", color:"#dc2626" }}>Qty: {p.qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent sales */}
      <div style={{ background:"#fff", borderRadius:"12px", padding:"20px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight:"700", color:"#1a1a2a", marginBottom:"14px", fontSize:"15px" }}>Recent Transactions</div>
        <div style={{ display:"grid", gap:"6px" }}>
          {tenant.sales.slice(-10).reverse().map(s => (
            <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", background:"#f8f9ff", borderRadius:"7px", marginBottom:4, fontSize:"12px", gap:8 }}>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:700, color:"#1a1a2a" }}>{s.productName}</span>
                <span style={{ color:"#aaa", marginLeft:6 }}>×{s.qty}</span>
                {(s.txRef) && <span style={{ color:"#8b8bcc", marginLeft:8, fontFamily:"monospace", fontSize:9 }}>{s.txRef}</span>}
              </div>
              <span style={{ color:theme.accent, fontWeight:700 }}>{fmt(s.total)}</span>
              <span style={{ color:"#aaa", fontSize:11 }}>{new Date(s.date).toLocaleDateString("en-NG")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── POS Page ──────────────────────────────────────────────────────────────── */
function POSPage({ tenant, theme, updateTenant, session, acc }) {
  acc = acc || theme.accent;
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [payMethod, setPayMethod] = useState("Cash");

  const filtered = tenant.products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) && p.qty > 0 && daysDiff(p.expiryDate) >= 0
  );

  const cartTotal = cart.reduce((s,i) => s + i.price*i.qty, 0);

  function addToCart(prod) {
    setCart(prev => {
      const ex = prev.find(i=>i.id===prod.id);
      if (ex) return prev.map(i=>i.id===prod.id?{...i,qty:i.qty+1}:i);
      return [...prev, {...prod,qty:1}];
    });
  }

  function checkout() {
    if (!cart.length) return;
    const now = new Date().toISOString();
    const ref = txRef();
    const newSales = cart.map(item => ({
      id: uid(), txRef: ref,
      productId: item.id, productName: item.name, sku: item.sku || "",
      qty: item.qty, price: item.price, total: item.price * item.qty,
      date: now,
      cashierName: session.userName, cashierId: session.userId,
      employeeId: session.employeeId || "—",
      paymentMethod: payMethod,
    }));
    updateTenant(t => ({
      ...t,
      sales: [...t.sales, ...newSales],
      products: t.products.map(p => {
        const ci = cart.find(i => i.id === p.id);
        return ci ? { ...p, qty: Math.max(0, p.qty - ci.qty) } : p;
      }),
    }));
    setReceipt({
      items: [...cart], total: cartTotal,
      payMethod, date: now, ref,
      cashierName: session.userName,
      employeeId: session.employeeId || "—",
    });
    setCart([]);
  }

  if (receipt) {
    return <ReceiptView receipt={receipt} tenant={tenant} theme={theme} acc={theme.accent} onNew={() => setReceipt(null)} />;
  }

  return (
    <div style={{ display:"flex", height:"calc(100vh - 0px)", overflow:"hidden" }}>
      {/* Products */}
      <div style={{ flex:1, padding:"20px", overflow:"auto" }}>
        <div style={{ fontWeight:"700", fontSize:"18px", color:"#1a1a2a", marginBottom:"14px" }}>🛒 Point of Sale</div>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ width:"100%", padding:"10px 14px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"13px", marginBottom:"14px", boxSizing:"border-box", outline:"none" }} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"10px" }}>
          {filtered.map(prod => {
            const inCart = cart.find(i=>i.id===prod.id);
            const dExp = daysDiff(prod.expiryDate);
            return (
              <button key={prod.id} onClick={()=>addToCart(prod)} style={{
                padding:"14px 10px", background:inCart?"#f0f9ff":"#fff",
                border:`1px solid ${inCart?theme.accent:"#e5e7eb"}`,
                borderRadius:"10px", cursor:"pointer", textAlign:"left",
                transition:"all 0.15s",
              }}>
                <div style={{ fontSize:"11px", color:"#8a8aaa", marginBottom:"3px" }}>{prod.category}</div>
                <div style={{ fontSize:"13px", fontWeight:"700", color:"#1a1a2a", lineHeight:"1.2", marginBottom:"5px" }}>{prod.name}</div>
                <div style={{ fontSize:"14px", fontWeight:"700", color:theme.accent }}>{fmt(prod.price)}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"5px", fontSize:"11px" }}>
                  <span style={{ color:"#8a8aaa" }}>Qty:{prod.qty}</span>
                  <span style={{ color:dExp<=7?"#ef4444":dExp<=30?"#f59e0b":"#aaa" }}>{dExp}d exp</span>
                </div>
                {inCart && <div style={{ fontSize:"11px", color:theme.accent, fontWeight:"700", marginTop:"3px" }}>In cart: {inCart.qty}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart */}
      <div style={{ width:"280px", background:"#fff", borderLeft:"1px solid #e5e7eb", display:"flex", flexDirection:"column", padding:"20px", flexShrink:0 }}>
        <div style={{ fontWeight:"700", fontSize:"15px", color:"#1a1a2a", marginBottom:"14px" }}>Cart ({cart.length})</div>
        <div style={{ flex:1, overflow:"auto" }}>
          {cart.length===0 && <div style={{ color:"#aaa", textAlign:"center", marginTop:"40px", fontSize:"13px" }}>No items added</div>}
          {cart.map(item => (
            <div key={item.id} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 0", borderBottom:"1px solid #f0f0f0" }}>
              <div style={{ flex:1, fontSize:"12px" }}>
                <div style={{ fontWeight:"600", color:"#1a1a2a" }}>{item.name}</div>
                <div style={{ color:theme.accent, fontWeight:"700" }}>{fmt(item.price)}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                <button onClick={()=>setCart(c=>c.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))}
                  style={{ width:"22px", height:"22px", borderRadius:"50%", border:"1px solid #ddd", background:"#f8f9ff", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>-</button>
                <span style={{ fontSize:"13px", fontWeight:"700", minWidth:"20px", textAlign:"center" }}>{item.qty}</span>
                <button onClick={()=>setCart(c=>c.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))}
                  style={{ width:"22px", height:"22px", borderRadius:"50%", border:"1px solid #ddd", background:"#f8f9ff", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
              </div>
              <button onClick={()=>setCart(c=>c.filter(i=>i.id!==item.id))}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:"16px" }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid #e5e7eb", paddingTop:"14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:"18px", fontWeight:"700", marginBottom:"12px" }}>
            <span>Total</span><span style={{ color:theme.accent }}>{fmt(cartTotal)}</span>
          </div>
          <select value={payMethod} onChange={e=>setPayMethod(e.target.value)}
            style={{ width:"100%", padding:"9px 12px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"13px", marginBottom:"10px", background:"#f8f9ff" }}>
            {["Cash","Card","Bank Transfer","USSD","Mobile Money"].map(m=><option key={m}>{m}</option>)}
          </select>
          <div style={{ fontSize:11, color:"#aaa", marginBottom:8, textAlign:"center" }}>
            Cashier: <strong>{session.userName}</strong>{session.employeeId && <span style={{ fontFamily:"monospace", color:"#8b8baa", marginLeft:4 }}>· {session.employeeId}</span>}
          </div>
          <button onClick={checkout} disabled={cart.length===0}
            style={{ width:"100%", padding:"13px", background:cart.length>0?acc:"#ccc", color:"#fff", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"700", cursor:cart.length>0?"pointer":"default" }}>
            Checkout {fmt(cartTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Inventory Page ─────────────────────────────────────────────────────── */
function InventoryPage({ tenant, theme, updateTenant, plan }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name:"", sku:"", category:"", qty:0, price:0, cost:0, unit:"pcs", expiryDate:futureDateStr(90) });
  const alertDays = tenant.expiryAlertDays || 30;

  const filtered = tenant.products.filter(p => {
    const d = daysDiff(p.expiryDate);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter==="expiring") return d>=0 && d<=alertDays;
    if (filter==="expired") return d<0;
    if (filter==="low") return p.qty>0 && p.qty<=10;
    return true;
  });

  const totalWorth = tenant.products.reduce((s,p)=>s+p.qty*p.cost,0);
  const totalRetail = tenant.products.reduce((s,p)=>s+p.qty*p.price,0);
  const expiringCount = tenant.products.filter(p=>{const d=daysDiff(p.expiryDate);return d>=0&&d<=alertDays;}).length;
  const expiredCount = tenant.products.filter(p=>daysDiff(p.expiryDate)<0).length;

  function addProduct() {
    updateTenant(t => ({...t, products:[...t.products,{...form,id:uid(),qty:Number(form.qty),price:Number(form.price),cost:Number(form.cost)}]}));
    setShowAdd(false);
    setForm({ name:"", sku:"", category:"", qty:0, price:0, cost:0, unit:"pcs", expiryDate:futureDateStr(90) });
  }

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div>
          <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a2a" }}>📦 Inventory</div>
          <div style={{ fontSize:"12px", color:"#8a8aaa", marginTop:"3px" }}>{tenant.products.length} products</div>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{ padding:"10px 18px", background:theme.accent, color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>+ Add Product</button>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"20px" }}>
        {[
          { label:"Cost Value", value:fmt(totalWorth), color:"#7c3aed" },
          { label:"Retail Value", value:fmt(totalRetail), color:theme.accent },
          { label:`Expiring ≤${alertDays}d`, value:expiringCount, color:"#f59e0b" },
          { label:"Expired", value:expiredCount, color:"#ef4444" },
        ].map(s=>(
          <div key={s.label} style={{ background:"#fff", borderRadius:"10px", padding:"14px", borderLeft:`3px solid ${s.color}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:"18px", fontWeight:"700", color:s.color }}>{s.value}</div>
            <div style={{ fontSize:"11px", color:"#8a8aaa", marginTop:"3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert days config */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
          style={{ flex:1, padding:"9px 14px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"13px", outline:"none" }} />
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{ padding:"9px 12px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"13px", background:"#fff" }}>
          <option value="all">All Products</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="low">Low Stock (&le;10)</option>
        </select>
        <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#8a8aaa", whiteSpace:"nowrap" }}>
          Alert:
          <input type="number" value={alertDays}
            onChange={e=>updateTenant(t=>({...t,expiryAlertDays:Number(e.target.value)}))}
            style={{ width:"50px", padding:"6px 8px", borderRadius:"6px", border:"1px solid #ddd", fontSize:"12px", textAlign:"center" }} />
          days
        </div>
      </div>

      {showAdd && (
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"20px", marginBottom:"16px", boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#1a1a2a", marginBottom:"16px" }}>Add Product</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
            {[["Product Name","name","text"],["SKU","sku","text"],["Category","category","text"],
              ["Quantity","qty","number"],["Selling Price (₦)","price","number"],["Cost Price (₦)","cost","number"],
              ["Unit","unit","text"],["Expiry Date","expiryDate","date"]
            ].map(([l,k,t])=>(
              <div key={k}>
                <div style={{ fontSize:"11px", color:"#6a6a8a", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</div>
                <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:"7px", border:"1px solid #ddd", fontSize:"13px", boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
            <button onClick={addProduct} style={{ padding:"10px 22px", background:theme.accent, color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Save</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:"10px 22px", background:"#f0f0f0", color:"#666", border:"none", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background:"#fff", borderRadius:"12px", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
          <thead>
            <tr style={{ background:"#f8f9ff" }}>
              {["Product","SKU","Category","Qty","Cost","Price","Expiry","Status"].map(h=>(
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:"11px", color:"#8a8aaa", textTransform:"uppercase", letterSpacing:"0.5px", fontWeight:"600", borderBottom:"1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>{
              const d = daysDiff(p.expiryDate);
              const rowBg = d<0?"#fef2f2":d<=7?"#fff7ed":i%2===0?"#fff":"#fafafe";
              return (
                <tr key={p.id} style={{ background:rowBg }}>
                  <td style={{ padding:"11px 14px", fontWeight:"600", color:"#1a1a2a" }}>{p.name}</td>
                  <td style={{ padding:"11px 14px", color:"#8a8aaa", fontFamily:"monospace" }}>{p.sku}</td>
                  <td style={{ padding:"11px 14px", color:"#6a6a8a" }}>{p.category}</td>
                  <td style={{ padding:"11px 14px", fontWeight:"700", color:p.qty<=10?"#ef4444":"#1a1a2a" }}>{p.qty} {p.unit}</td>
                  <td style={{ padding:"11px 14px", color:"#7c3aed" }}>{fmt(p.cost)}</td>
                  <td style={{ padding:"11px 14px", color:theme.accent, fontWeight:"600" }}>{fmt(p.price)}</td>
                  <td style={{ padding:"11px 14px", color:"#6a6a8a" }}>{p.expiryDate}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:"20px", fontSize:"11px", fontWeight:"700",
                      background:d<0?"#fee2e2":d<=7?"#fef3c7":d<=30?"#fffbeb":"#f0fdf4",
                      color:d<0?"#991b1b":d<=7?"#92400e":d<=30?"#78350f":"#166534"
                    }}>
                      {d<0?"EXPIRED":d<=7?"CRITICAL":d<=30?"EXPIRING":"OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ padding:"30px", textAlign:"center", color:"#aaa" }}>No products found</div>}
      </div>
    </div>
  );
}

/* ── Tables Page (Eatery only) ─────────────────────────────────────────── */
function TablesPage({ tenant, theme, updateTenant }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  function openTable(table) {
    setSelectedTable(table);
    setOrderItems(table.order || []);
  }

  function saveOrder() {
    const total = orderItems.reduce((s,i)=>s+i.price*i.qty,0);
    updateTenant(t=>({
      ...t,
      tables: t.tables.map(tb=>tb.id===selectedTable.id?{...tb,status:orderItems.length>0?"occupied":"free",order:orderItems}:tb),
    }));
    setSelectedTable(null);
    setOrderItems([]);
  }

  function billTable() {
    if (!orderItems.length) return;
    const now = new Date().toISOString();
    const newSales = orderItems.map(item => ({
      id:uid(), productId:item.id, productName:item.name,
      qty:item.qty, price:item.price, total:item.price*item.qty,
      date:now, cashier:`Table ${selectedTable.number}`, paymentMethod:"Cash",
    }));
    updateTenant(t=>({
      ...t,
      sales:[...t.sales,...newSales],
      tables:t.tables.map(tb=>tb.id===selectedTable.id?{...tb,status:"free",order:null}:tb),
      products:t.products.map(p=>{
        const oi=orderItems.find(i=>i.id===p.id);
        return oi?{...p,qty:Math.max(0,p.qty-oi.qty)}:p;
      }),
    }));
    setSelectedTable(null);
    setOrderItems([]);
  }

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a2a", marginBottom:"20px" }}>🪑 Table Management</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"12px", marginBottom:"24px" }}>
        {tenant.tables.map(table=>(
          <button key={table.id} onClick={()=>openTable(table)} style={{
            padding:"20px 10px", borderRadius:"12px", border:"none", cursor:"pointer",
            background:table.status==="occupied"?theme.accent+"22":"#fff",
            border:`2px solid ${table.status==="occupied"?theme.accent:"#e5e7eb"}`,
            transition:"all 0.15s",
          }}>
            <div style={{ fontSize:"24px", marginBottom:"6px" }}>🪑</div>
            <div style={{ fontWeight:"700", fontSize:"15px", color:"#1a1a2a" }}>Table {table.number}</div>
            <div style={{ fontSize:"11px", color:table.status==="occupied"?theme.accent:"#8a8aaa", marginTop:"3px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {table.status==="occupied"?`₦${table.order?.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString()||0}`:"Free"}
            </div>
          </button>
        ))}
      </div>

      {selectedTable && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <div style={{ background:"#fff", borderRadius:"14px", padding:"24px", width:"480px", maxHeight:"80vh", overflow:"auto" }}>
            <div style={{ fontSize:"17px", fontWeight:"700", color:"#1a1a2a", marginBottom:"16px" }}>Table {selectedTable.number} Order</div>
            <div style={{ marginBottom:"16px" }}>
              {tenant.products.filter(p=>p.qty>0&&daysDiff(p.expiryDate)>=0).map(prod=>(
                <button key={prod.id} onClick={()=>setOrderItems(prev=>{
                  const ex=prev.find(i=>i.id===prod.id);
                  if(ex) return prev.map(i=>i.id===prod.id?{...i,qty:i.qty+1}:i);
                  return [...prev,{...prod,qty:1}];
                })} style={{ margin:"4px", padding:"7px 12px", borderRadius:"7px", border:"1px solid #e5e7eb", cursor:"pointer", fontSize:"12px", background:"#f8f9ff" }}>
                  {prod.name} — {fmt(prod.price)}
                </button>
              ))}
            </div>
            <div style={{ background:"#f8f9ff", borderRadius:"10px", padding:"14px", marginBottom:"16px" }}>
              {orderItems.length===0 && <div style={{ color:"#aaa", textAlign:"center" }}>No items</div>}
              {orderItems.map(i=>(
                <div key={i.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #eee", fontSize:"13px" }}>
                  <span>{i.name} ×{i.qty}</span>
                  <span style={{ fontWeight:"700", color:theme.accent }}>{fmt(i.price*i.qty)}</span>
                </div>
              ))}
              {orderItems.length>0&&<div style={{ display:"flex", justifyContent:"space-between", paddingTop:"8px", fontWeight:"700" }}>
                <span>Total</span><span style={{color:theme.accent}}>{fmt(orderItems.reduce((s,i)=>s+i.price*i.qty,0))}</span>
              </div>}
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={saveOrder} style={{ flex:1, padding:"11px", background:"#6b7280", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Save Order</button>
              <button onClick={billTable} disabled={orderItems.length===0}
                style={{ flex:1, padding:"11px", background:orderItems.length>0?theme.accent:"#ccc", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", cursor:orderItems.length>0?"pointer":"default" }}>
                Bill & Close
              </button>
              <button onClick={()=>{setSelectedTable(null);setOrderItems([]);}}
                style={{ padding:"11px 16px", background:"#f0f0f0", color:"#666", border:"none", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sales & Reports ────────────────────────────────────────────────────── */
function SalesReportsPage({ tenant, theme }) {
  const [period, setPeriod] = useState("7");
  const cutoff = new Date(Date.now() - Number(period)*864e5);
  const sales = tenant.sales.filter(s => new Date(s.date) >= cutoff);
  const total = sales.reduce((s,x)=>s+x.total,0);
  const txCount = sales.length;

  const byProduct = {};
  sales.forEach(s=>{
    if(!byProduct[s.productName]) byProduct[s.productName]={qty:0,revenue:0};
    byProduct[s.productName].qty += s.qty;
    byProduct[s.productName].revenue += s.total;
  });
  const topProducts = Object.entries(byProduct).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,8);

  const byDay = {};
  sales.forEach(s=>{
    const d=new Date(s.date).toLocaleDateString("en-NG",{day:"2-digit",month:"short"});
    byDay[d]=(byDay[d]||0)+s.total;
  });
  const maxDayVal = Math.max(...Object.values(byDay),1);

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a2a" }}>📈 Sales & Reports</div>
        <select value={period} onChange={e=>setPeriod(e.target.value)}
          style={{ padding:"9px 14px", borderRadius:"8px", border:"1px solid #ddd", fontSize:"13px", background:"#fff" }}>
          <option value="1">Today</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"24px" }}>
        {[
          { label:"Revenue", value:fmt(total), color:theme.accent },
          { label:"Transactions", value:txCount, color:"#4f46e5" },
          { label:"Avg Sale", value:fmt(txCount>0?Math.round(total/txCount):0), color:"#059669" },
        ].map(s=>(
          <div key={s.label} style={{ background:"#fff", borderRadius:"12px", padding:"18px", borderTop:`3px solid ${s.color}`, boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"22px", fontWeight:"700", color:s.color }}>{s.value}</div>
            <div style={{ fontSize:"12px", color:"#8a8aaa", marginTop:"4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"16px" }}>
        {/* Bar chart */}
        <div style={{ background:"#fff", borderRadius:"12px", padding:"20px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:"700", color:"#1a1a2a", marginBottom:"16px" }}>Daily Sales</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", height:"120px" }}>
            {Object.entries(byDay).slice(-14).map(([day,val])=>(
              <div key={day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                <div style={{ width:"100%", background:theme.accent, borderRadius:"4px 4px 0 0", height:`${Math.max(4,(val/maxDayVal)*100)}px`, minHeight:"4px", transition:"height 0.3s" }} />
                <div style={{ fontSize:"9px", color:"#aaa", transform:"rotate(-45deg)", transformOrigin:"center", whiteSpace:"nowrap" }}>{day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div style={{ background:"#fff", borderRadius:"12px", padding:"20px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:"700", color:"#1a1a2a", marginBottom:"14px" }}>Top Products</div>
          {topProducts.map(([name,data],i)=>(
            <div key={name} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f0f0f0", fontSize:"12px" }}>
              <span style={{ color:"#1a1a2a" }}><span style={{ color:theme.accent, fontWeight:"700", marginRight:"6px" }}>#{i+1}</span>{name.slice(0,18)}</span>
              <span style={{ color:theme.accent, fontWeight:"700" }}>{fmt(data.revenue)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction table */}
      <div style={{ background:"#fff", borderRadius:"12px", padding:"20px", marginTop:"16px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight:"700", color:"#1a1a2a", marginBottom:"14px" }}>All Transactions</div>
        <div style={{ overflow:"auto", maxHeight:"300px" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
            <thead><tr style={{ background:"#f8f9ff" }}>
              {["Product","Qty","Price","Total","Cashier","Method","Date"].map(h=>(
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#8a8aaa", fontWeight:"600", fontSize:"11px", textTransform:"uppercase", borderBottom:"1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {sales.slice().reverse().map((s,i)=>(
                <tr key={s.id} style={{ background:i%2===0?"#fff":"#fafafe" }}>
                  <td style={{ padding:"9px 12px", color:"#1a1a2a", fontWeight:"600" }}>{s.productName}</td>
                  <td style={{ padding:"9px 12px", color:"#6a6a8a" }}>{s.qty}</td>
                  <td style={{ padding:"9px 12px", color:"#6a6a8a" }}>{fmt(s.price)}</td>
                  <td style={{ padding:"9px 12px", color:theme.accent, fontWeight:"700" }}>{fmt(s.total)}</td>
                  <td style={{ padding:"9px 12px", color:"#6a6a8a" }}>{s.cashier}</td>
                  <td style={{ padding:"9px 12px", color:"#6a6a8a" }}>{s.paymentMethod||"—"}</td>
                  <td style={{ padding:"9px 12px", color:"#aaa" }}>{new Date(s.date).toLocaleDateString("en-NG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Users Page ─────────────────────────────────────────────────────────── */
function UsersPage({ tenant, theme, updateTenant, session, plan }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", role:"salesperson", password:"" });

  const planObj = PLANS.find(p=>p.id===plan?.id);
  const canAddMore = tenant.users.length < (planObj?.maxUsers||999);

  function addUser() {
    if (!form.name || !form.email || !form.password) return;
    updateTenant(t=>({...t, users:[...t.users,{id:uid(),...form,createdAt:new Date().toISOString()}]}));
    setShowAdd(false);
    setForm({ name:"", email:"", role:"salesperson", password:"" });
  }

  const roleLabels = { tenant_super:"Super Admin", admin:"Admin", salesperson:"Salesperson" };
  const roleColors = { tenant_super:"#4f46e5", admin:theme.accent, salesperson:"#059669" };

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div>
          <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a2a" }}>👥 Users</div>
          <div style={{ fontSize:"12px", color:"#8a8aaa" }}>{tenant.users.length} / {planObj?.maxUsers>=999?"Unlimited":planObj?.maxUsers} users</div>
        </div>
        {session.role==="tenant_super" && (
          <button onClick={()=>setShowAdd(true)} disabled={!canAddMore}
            style={{ padding:"10px 18px", background:canAddMore?theme.accent:"#ccc", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:canAddMore?"pointer":"default" }}>
            + Add User
          </button>
        )}
      </div>

      {showAdd && (
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"20px", marginBottom:"16px", boxShadow:"0 2px 10px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#1a1a2a", marginBottom:"16px" }}>Create New User</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>
              <div style={{ fontSize:"11px", color:"#6a6a8a", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Full Name</div>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                style={{ width:"100%", padding:"9px 12px", borderRadius:"7px", border:"1px solid #ddd", fontSize:"13px", boxSizing:"border-box" }} />
            </div>
            <div>
              <div style={{ fontSize:"11px", color:"#6a6a8a", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Email</div>
              <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} type="email"
                style={{ width:"100%", padding:"9px 12px", borderRadius:"7px", border:"1px solid #ddd", fontSize:"13px", boxSizing:"border-box" }} />
            </div>
            <div>
              <div style={{ fontSize:"11px", color:"#6a6a8a", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Role</div>
              <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}
                style={{ width:"100%", padding:"9px 12px", borderRadius:"7px", border:"1px solid #ddd", fontSize:"13px", boxSizing:"border-box", background:"#fff" }}>
                <option value="salesperson">Salesperson</option>
                {session.role==="tenant_super" && <option value="admin">Admin</option>}
              </select>
            </div>
            <div>
              <div style={{ fontSize:"11px", color:"#6a6a8a", marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Password</div>
              <input value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} type="password"
                style={{ width:"100%", padding:"9px 12px", borderRadius:"7px", border:"1px solid #ddd", fontSize:"13px", boxSizing:"border-box" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
            <button onClick={addUser} style={{ padding:"10px 22px", background:theme.accent, color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Create User</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:"10px 22px", background:"#f0f0f0", color:"#666", border:"none", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gap:"10px" }}>
        {tenant.users.map(user=>(
          <div key={user.id} style={{ background:"#fff", borderRadius:"10px", padding:"16px 20px", display:"flex", alignItems:"center", gap:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", border:"1px solid #f0f0f0" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:roleColors[user.role]+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:"700", color:roleColors[user.role] }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:"700", color:"#1a1a2a", fontSize:"14px" }}>{user.name}</div>
              <div style={{ fontSize:"12px", color:"#8a8aaa", marginTop:"2px" }}>{user.email}</div>
            </div>
            <span style={{ padding:"4px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", background:roleColors[user.role]+"18", color:roleColors[user.role] }}>
              {roleLabels[user.role]}
            </span>
            <div style={{ fontSize:"11px", color:"#aaa" }}>Joined {new Date(user.createdAt).toLocaleDateString("en-NG")}</div>
            {session.role==="tenant_super" && user.role!=="tenant_super" && (
              <button onClick={()=>updateTenant(t=>({...t,users:t.users.filter(u=>u.id!==user.id)}))}
                style={{ padding:"5px 10px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"6px", fontSize:"12px", cursor:"pointer" }}>Remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Subscription Page ──────────────────────────────────────────────────── */
function SubscriptionPage({ tenant, theme, plan, daysLeft, platform }) {
  const pct75 = daysLeft <= Math.round((plan?.durationDays||30) * 0.25);
  const critical = daysLeft <= 7;
  const expired = daysLeft <= 0;

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a2a", marginBottom:"20px" }}>💳 Subscription & Payment</div>

      {/* Status card */}
      <div style={{
        background: expired?"#7f1d1d":critical?"#451a03":pct75?"#1c1a03":"#0a1a0a",
        border:`1px solid ${expired?"#ef4444":critical?"#f59e0b":pct75?"#d97706":"#16a34a"}`,
        borderRadius:"14px", padding:"24px", marginBottom:"24px", color:"#fff"
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:"12px", color:expired?"#fca5a5":critical?"#fde68a":pct75?"#fcd34d":"#86efac", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"6px" }}>
              {expired?"⛔ Subscription Expired":critical?"⚠️ Critical — Renew Immediately":pct75?"⏰ Renewal Soon":"✅ Active Subscription"}
            </div>
            <div style={{ fontSize:"28px", fontWeight:"700" }}>{plan?.name} Plan</div>
            <div style={{ fontSize:"15px", color:"rgba(255,255,255,0.7)", marginTop:"4px" }}>{fmt(plan?.price||0)} / month</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:"36px", fontWeight:"700", color:expired?"#ef4444":critical?"#f59e0b":"#4ade80" }}>
              {expired?"EXPIRED":`${daysLeft}d`}
            </div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>
              {expired?"Please renew now":"Until expiry"}
            </div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginTop:"4px" }}>
              Expires: {new Date(tenant.subscriptionExpiry).toLocaleDateString("en-NG")}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {!expired && (
          <div style={{ marginTop:"16px" }}>
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:"4px", height:"6px" }}>
              <div style={{ width:`${Math.max(0,Math.min(100,(daysLeft/(plan?.durationDays||30))*100))}%`, background:critical?"#ef4444":pct75?"#f59e0b":"#4ade80", height:"100%", borderRadius:"4px", transition:"width 0.4s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Payment details */}
      <div style={{ background:"#fff", borderRadius:"14px", padding:"24px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
          <div style={{ width:"40px", height:"40px", background:"#00C3F7", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>💳</div>
          <div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#1a1a2a" }}>Payment via Paystack</div>
            <div style={{ fontSize:"12px", color:"#8a8aaa" }}>Make bank transfer to the account below</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
          {[
            ["Account Name", platform.paystackAccountName],
            ["Bank", platform.paystackBankName],
            ["Account Number", platform.paystackAccountNumber],
            ["Amount Due", fmt(plan?.price||0)],
            ["Your Reference", tenant.paystackRef],
            ["Plan", plan?.name + " Plan"],
          ].map(([k,v])=>(
            <div key={k} style={{ background:"#f8f9ff", borderRadius:"10px", padding:"14px 16px" }}>
              <div style={{ fontSize:"11px", color:"#8a8aaa", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"4px" }}>{k}</div>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#1a1a2a", fontFamily:k==="Account Number"||k==="Your Reference"?"monospace":"inherit" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:"18px", padding:"14px", background:"#f0fdf4", borderRadius:"10px", border:"1px solid #bbf7d0", fontSize:"13px", color:"#166534" }}>
          <strong>📌 Instructions:</strong> Transfer {fmt(plan?.price||0)} to the account above. Use reference <strong>{tenant.paystackRef}</strong> as payment narration. Your subscription will be activated within 30 minutes of payment confirmation.
        </div>
      </div>

      {/* Plan comparison */}
      <div style={{ fontSize:"16px", fontWeight:"700", color:"#1a1a2a", marginBottom:"14px" }}>Upgrade Your Plan</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
        {platform.plans.map(pl=>(
          <div key={pl.id} style={{ background:"#fff", borderRadius:"12px", padding:"20px", border:`2px solid ${pl.id===tenant.planId?pl.color:"#e5e7eb"}`, position:"relative" }}>
            {pl.id===tenant.planId && <div style={{ position:"absolute", top:"-10px", right:"12px", background:pl.color, color:"#fff", fontSize:"10px", fontWeight:"700", padding:"2px 10px", borderRadius:"10px" }}>CURRENT</div>}
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#1a1a2a" }}>{pl.name}</div>
            <div style={{ fontSize:"24px", fontWeight:"700", color:pl.color, margin:"8px 0" }}>{fmt(pl.price)}<span style={{ fontSize:"12px", color:"#8a8aaa" }}>/mo</span></div>
            <div style={{ fontSize:"12px", color:"#6a6a8a" }}>Up to {pl.maxProducts>=999999?"Unlimited":pl.maxProducts.toLocaleString()} products</div>
            <div style={{ fontSize:"12px", color:"#6a6a8a" }}>Up to {pl.maxUsers>=999?"Unlimited":pl.maxUsers} users</div>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════════════════════
   DEVICE MANAGEMENT PAGE (Super Admin)
═══════════════════════════════════════════════════════════════════════════ */
function DevicesPage({ platform, updatePlatform }) {
  const allPending = platform.tenants.flatMap(t =>
    (t.trustedDevices||[]).filter(d=>d.status==="pending").map(d=>({...d,tenantName:t.name,tenantId:t.id,tenantType:t.type}))
  );
  const allApproved = platform.tenants.flatMap(t =>
    (t.trustedDevices||[]).filter(d=>d.status==="approved").map(d=>({...d,tenantName:t.name,tenantId:t.id}))
  );

  function approveDevice(tenantId, deviceId) {
    updatePlatform(p => ({
      ...p,
      tenants: p.tenants.map(t => t.id!==tenantId ? t : {
        ...t,
        trustedDevices: (t.trustedDevices||[]).map(d =>
          d.deviceId===deviceId ? {...d, status:"approved", approvedAt:new Date().toISOString()} : d
        )
      })
    }));
  }

  function rejectDevice(tenantId, deviceId) {
    updatePlatform(p => ({
      ...p,
      tenants: p.tenants.map(t => t.id!==tenantId ? t : {
        ...t,
        trustedDevices: (t.trustedDevices||[]).filter(d=>d.deviceId!==deviceId)
      })
    }));
  }

  function revokeDevice(tenantId, deviceId) {
    updatePlatform(p => ({
      ...p,
      tenants: p.tenants.map(t => t.id!==tenantId ? t : {
        ...t,
        trustedDevices: (t.trustedDevices||[]).filter(d=>d.deviceId!==deviceId),
        activeSessions: (t.activeSessions||[]).filter(s=>s.deviceId!==deviceId)
      })
    }));
  }

  return (
    <div style={{ padding:"32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
        <div>
          <div style={{ fontSize:"22px", fontWeight:"700", color:"#fff" }}>📱 Device Management</div>
          <div style={{ fontSize:"13px", color:"#5a5a7a", marginTop:"3px" }}>Approve or reject new device access requests</div>
        </div>
        {allPending.length > 0 && (
          <div style={{ background:"#451a03", border:"1px solid #f59e0b", borderRadius:"10px", padding:"8px 16px", color:"#fcd34d", fontSize:"13px", fontWeight:"700" }}>
            ⏰ {allPending.length} pending request{allPending.length!==1?"s":""}
          </div>
        )}
      </div>

      {allPending.length > 0 && (
        <>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#fbbf24", marginBottom:"14px" }}>⏳ Pending Approvals</div>
          <div style={{ display:"grid", gap:"12px", marginBottom:"32px" }}>
            {allPending.map(d => {
              const theme = TYPE_THEME[d.tenantType];
              return (
                <div key={d.deviceId} style={{ background:"#12100e", border:"1px solid #3a2a00", borderRadius:"12px", padding:"18px 20px", display:"flex", alignItems:"center", gap:"16px" }}>
                  <div style={{ fontSize:"28px" }}>📱</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#fff", fontWeight:"700", fontSize:"14px" }}>{d.requesterName || d.userName}</div>
                    <div style={{ color:"#5a5a7a", fontSize:"12px", marginTop:"2px" }}>
                      {d.requesterPhone && <span>📞 {d.requesterPhone} · </span>}
                      {d.requesterEmail && <span>✉️ {d.requesterEmail} · </span>}
                      <span>{d.deviceName}</span>
                    </div>
                    <div style={{ color:"#3a3a5a", fontSize:"11px", marginTop:"3px", fontFamily:"monospace" }}>
                      {d.deviceId} · {theme?.icon} {d.tenantName}
                    </div>
                    <div style={{ color:"#3a3a5a", fontSize:"11px", marginTop:"1px" }}>
                      Requested: {d.requestedAt ? new Date(d.requestedAt).toLocaleString("en-NG") : "—"}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:"8px" }}>
                    <button onClick={()=>approveDevice(d.tenantId,d.deviceId)}
                      style={{ padding:"8px 18px", background:"#166534", color:"#4ade80", border:"1px solid #16a34a", borderRadius:"8px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>
                      ✓ Approve
                    </button>
                    <button onClick={()=>rejectDevice(d.tenantId,d.deviceId)}
                      style={{ padding:"8px 14px", background:"#2a0808", color:"#f87171", border:"1px solid #7f1d1d", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {allPending.length === 0 && (
        <div style={{ background:"#0a120a", border:"1px solid #1a2a1a", borderRadius:"12px", padding:"24px", textAlign:"center", color:"#2a5a2a", marginBottom:"24px" }}>
          ✅ No pending device requests
        </div>
      )}

      {allApproved.length > 0 && (
        <>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"14px" }}>✅ Approved Devices ({allApproved.length})</div>
          <div style={{ display:"grid", gap:"8px" }}>
            {allApproved.map(d => (
              <div key={d.deviceId+d.tenantId} style={{ background:"#0d0d18", border:"1px solid #1a1a2a", borderRadius:"10px", padding:"14px 18px", display:"flex", alignItems:"center", gap:"14px" }}>
                <div style={{ fontSize:"20px" }}>💻</div>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#e0e0f0", fontWeight:"600", fontSize:"13px" }}>{d.userName || d.requesterName} — {d.tenantName}</div>
                  <div style={{ color:"#4a4a6a", fontSize:"11px", fontFamily:"monospace", marginTop:"2px" }}>{d.deviceId} · {d.deviceName}</div>
                  {d.approvedAt && <div style={{ color:"#3a3a5a", fontSize:"11px" }}>Approved: {new Date(d.approvedAt).toLocaleString("en-NG")}</div>}
                </div>
                <button onClick={()=>revokeDevice(d.tenantId,d.deviceId)}
                  style={{ padding:"6px 12px", background:"#1a0808", color:"#cc5555", border:"1px solid #2a1010", borderRadius:"6px", fontSize:"11px", cursor:"pointer" }}>
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TENANT DEVICE PAGE (visible to tenant_super only)
═══════════════════════════════════════════════════════════════════════════ */
function TenantDevicesPage({ tenant, theme, updateTenant }) {
  const pending = (tenant.trustedDevices||[]).filter(d=>d.status==="pending");
  const approved = (tenant.trustedDevices||[]).filter(d=>d.status==="approved");
  const sessions = tenant.activeSessions || [];

  function approveDevice(deviceId) {
    updateTenant(t=>({
      ...t,
      trustedDevices: (t.trustedDevices||[]).map(d=>
        d.deviceId===deviceId?{...d,status:"approved",approvedAt:new Date().toISOString()}:d
      )
    }));
  }

  function rejectDevice(deviceId) {
    updateTenant(t=>({...t, trustedDevices:(t.trustedDevices||[]).filter(d=>d.deviceId!==deviceId)}));
  }

  function revokeDevice(deviceId) {
    updateTenant(t=>({
      ...t,
      trustedDevices:(t.trustedDevices||[]).filter(d=>d.deviceId!==deviceId),
      activeSessions:(t.activeSessions||[]).filter(s=>s.deviceId!==deviceId)
    }));
  }

  return (
    <div style={{ padding:"24px" }}>
      <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a2a", marginBottom:"20px" }}>📱 Device Access</div>

      {pending.length > 0 && (
        <div style={{ background:"#fffbeb", border:"1px solid #f59e0b", borderRadius:"12px", padding:"18px", marginBottom:"20px" }}>
          <div style={{ fontWeight:"700", color:"#92400e", marginBottom:"14px" }}>⏳ Pending Device Requests ({pending.length})</div>
          {pending.map(d=>(
            <div key={d.deviceId} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 0", borderBottom:"1px solid #fde68a" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:"700", color:"#78350f" }}>{d.requesterName || d.userName}</div>
                <div style={{ fontSize:"12px", color:"#92400e", marginTop:"2px" }}>
                  {d.requesterPhone && `📞 ${d.requesterPhone}`}{d.requesterEmail && ` · ✉️ ${d.requesterEmail}`}
                </div>
                <div style={{ fontSize:"11px", color:"#b45309", marginTop:"2px" }}>{d.deviceName} · {new Date(d.requestedAt||Date.now()).toLocaleString("en-NG")}</div>
              </div>
              <button onClick={()=>approveDevice(d.deviceId)}
                style={{ padding:"7px 14px", background:"#166534", color:"#fff", border:"none", borderRadius:"7px", fontSize:"12px", fontWeight:"700", cursor:"pointer" }}>✓ Approve</button>
              <button onClick={()=>rejectDevice(d.deviceId)}
                style={{ padding:"7px 12px", background:"#991b1b", color:"#fff", border:"none", borderRadius:"7px", fontSize:"12px", cursor:"pointer" }}>✕ Reject</button>
            </div>
          ))}
        </div>
      )}

      {pending.length === 0 && (
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"10px", padding:"14px", marginBottom:"16px", color:"#166534", fontSize:"13px" }}>
          ✅ No pending device requests
        </div>
      )}

      <div style={{ background:"#fff", borderRadius:"12px", padding:"18px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", marginBottom:"16px" }}>
        <div style={{ fontWeight:"700", color:"#1a1a2a", marginBottom:"14px" }}>✅ Approved Devices ({approved.length})</div>
        {approved.length===0 && <div style={{ color:"#aaa", fontSize:"13px" }}>No approved devices yet</div>}
        {approved.map(d=>(
          <div key={d.deviceId} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"9px 0", borderBottom:"1px solid #f0f0f0" }}>
            <div style={{ fontSize:"20px" }}>💻</div>
            <div style={{ flex:1, fontSize:"13px" }}>
              <div style={{ fontWeight:"600", color:"#1a1a2a" }}>{d.userName || d.requesterName}</div>
              <div style={{ color:"#8a8aaa", fontSize:"11px", marginTop:"2px" }}>{d.deviceName} · {d.deviceId}</div>
            </div>
            <div style={{ fontSize:"11px", color:sessions.find(s=>s.deviceId===d.deviceId)?"#16a34a":"#aaa" }}>
              {sessions.find(s=>s.deviceId===d.deviceId)?"🟢 Active":"⚫ Inactive"}
            </div>
            <button onClick={()=>revokeDevice(d.deviceId)}
              style={{ padding:"5px 10px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"6px", fontSize:"11px", cursor:"pointer" }}>
              Revoke
            </button>
          </div>
        ))}
      </div>

      {sessions.length > 0 && (
        <div style={{ background:"#fff", borderRadius:"12px", padding:"18px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight:"700", color:"#1a1a2a", marginBottom:"12px" }}>🟢 Active Sessions ({sessions.length})</div>
          {sessions.map(s=>(
            <div key={s.sessionId} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f0f0f0", fontSize:"13px" }}>
              <div>
                <span style={{ fontWeight:"600", color:"#1a1a2a" }}>{s.deviceName}</span>
                <span style={{ color:"#aaa", marginLeft:"8px", fontSize:"11px" }}>{s.deviceId}</span>
              </div>
              <span style={{ color:"#8a8aaa", fontSize:"11px" }}>Since {new Date(s.loginAt).toLocaleTimeString("en-NG")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   RECEIPT VIEW  — professional thermal-style with logo stamp
   Shown after every checkout. Logo only on Growth / Pro plans.
═══════════════════════════════════════════════════════════════════════════ */
function ReceiptView({ receipt, tenant, theme, onNew }) {
  const planTier  = tenant.planId;           // starter | growth | pro
  const canBrand  = planTier === "growth" || planTier === "pro";
  const logo      = canBrand && tenant.branding?.logoDataUrl;
  const bizName   = canBrand && tenant.branding?.displayName  ? tenant.branding.displayName  : tenant.name;
  const bizAddr   = canBrand && tenant.branding?.displayAddr  ? tenant.branding.displayAddr  : tenant.address;
  const bizPhone  = canBrand && tenant.branding?.displayPhone ? tenant.branding.displayPhone : tenant.phone;
  const footer    = canBrand && tenant.branding?.receiptFooter ? tenant.branding.receiptFooter : "Thank you for your patronage.";

  const subtotal  = receipt.items.reduce((s, i) => s + i.price * i.qty, 0);
  const vatRate   = 0.075;
  const vatAmt    = Math.round(subtotal * vatRate);
  const grandTotal= subtotal + vatAmt;

  function printReceipt() {
    window.print();
  }

  return (
    <div style={{ padding: "28px", display: "flex", justifyContent: "center", background: "#f4f4fb", minHeight: "100vh" }}>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #asp-receipt { display: block !important; }
          #asp-receipt { width: 80mm; margin: 0; padding: 0; }
        }
        #asp-receipt { font-family: 'Courier New', monospace; }
      `}</style>

      <div style={{ maxWidth: "420px", width: "100%" }}>
        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button onClick={onNew}
            style={{ flex: 1, padding: "11px", background: theme.accent, color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
            ＋ New Sale
          </button>
          <button onClick={printReceipt}
            style={{ padding: "11px 20px", background: "#fff", color: "#1a1a2a", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600" }}>
            🖨 Print
          </button>
        </div>

        {/* Receipt paper */}
        <div id="asp-receipt" style={{
          background: "#fff",
          borderRadius: "4px",
          padding: "28px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          fontFamily: "'Courier New', monospace",
          fontSize: "12px",
          color: "#1a1a1a",
          letterSpacing: "0.1px",
          lineHeight: "1.6",
        }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "16px", borderBottom: "1px dashed #ccc", paddingBottom: "14px" }}>
            {logo && (
              <img src={logo} alt="logo"
                style={{ maxHeight: "60px", maxWidth: "180px", objectFit: "contain", marginBottom: "8px", display: "block", margin: "0 auto 8px" }} />
            )}
            <div style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>{bizName}</div>
            {bizAddr  && <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{bizAddr}</div>}
            {bizPhone && <div style={{ fontSize: "11px", color: "#555" }}>Tel: {bizPhone}</div>}
          </div>

          {/* Transaction meta */}
          <div style={{ marginBottom: "14px", fontSize: "11px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Date:</span>
              <span>{new Date(receipt.date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Ref No:</span>
              <span style={{ fontWeight: "700", letterSpacing: "0.5px" }}>{receipt.ref}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Cashier:</span>
              <span>{receipt.cashierName}{receipt.cashierId ? <span style={{ color: "#888", fontSize: "10px" }}> [{receipt.cashierId.slice(0,8).toUpperCase()}]</span> : null}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666" }}>Payment:</span>
              <span style={{ textTransform: "uppercase" }}>{receipt.payMethod}</span>
            </div>
          </div>

          {/* Items */}
          <div style={{ borderTop: "1px dashed #ccc", borderBottom: "1px dashed #ccc", padding: "12px 0", marginBottom: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 12px", fontSize: "11px", color: "#888", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>
              <span>Item</span><span style={{ textAlign: "right" }}>Qty</span><span style={{ textAlign: "right" }}>Amount</span>
            </div>
            {receipt.items.map((item, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "2px 12px", marginBottom: "6px", fontSize: "12px" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>{item.name}</div>
                  <div style={{ fontSize: "10px", color: "#888" }}>{fmt(item.price)} each</div>
                </div>
                <div style={{ textAlign: "right", alignSelf: "center" }}>{item.qty}</div>
                <div style={{ textAlign: "right", fontWeight: "700", alignSelf: "center" }}>{fmt(item.price * item.qty)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ marginBottom: "16px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#666" }}>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ color: "#666" }}>VAT (7.5%)</span>
              <span>{fmt(vatAmt)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1a1a1a", paddingTop: "6px", marginTop: "6px", fontSize: "14px", fontWeight: "700" }}>
              <span>TOTAL</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", borderTop: "1px dashed #ccc", paddingTop: "12px", fontSize: "10px", color: "#888", lineHeight: "1.7" }}>
            <div style={{ fontWeight: "600", marginBottom: "2px" }}>{footer}</div>
            <div style={{ marginTop: "6px", fontSize: "9px", color: "#bbb" }}>
              Powered by Anchor Sales Pro · anchorsalespro.ng
            </div>
            <div style={{ marginTop: "4px", fontFamily: "monospace", fontSize: "9px", color: "#ccc", letterSpacing: "1px" }}>
              {receipt.ref}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   BRANDING PAGE — Growth / Pro tenants only
   Upload logo, set display name, address, phone, receipt footer
═══════════════════════════════════════════════════════════════════════════ */
function BrandingPage({ tenant, theme, updateTenant, plan }) {
  const canBrand = plan?.id === "growth" || plan?.id === "pro";

  const [preview,  setPreview]  = useState(tenant.branding?.logoDataUrl || null);
  const [form,     setForm]     = useState({
    displayName:    tenant.branding?.displayName    || tenant.name,
    displayAddr:    tenant.branding?.displayAddr    || tenant.address,
    displayPhone:   tenant.branding?.displayPhone   || tenant.phone,
    receiptFooter:  tenant.branding?.receiptFooter  || "Thank you for your patronage.",
    primaryColor:   tenant.branding?.primaryColor   || theme.accent,
  });
  const [saved, setSaved] = useState(false);

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a PNG, JPG, SVG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function saveChanges() {
    updateTenant(t => ({
      ...t,
      branding: {
        ...t.branding,
        logoDataUrl:    preview,
        displayName:    form.displayName,
        displayAddr:    form.displayAddr,
        displayPhone:   form.displayPhone,
        receiptFooter:  form.receiptFooter,
        primaryColor:   form.primaryColor,
        updatedAt:      new Date().toISOString(),
      }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function removeLogo() {
    setPreview(null);
    updateTenant(t => ({ ...t, branding: { ...t.branding, logoDataUrl: null } }));
  }

  if (!canBrand) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2a", marginBottom: "8px" }}>Branding Available on Growth & Pro</div>
        <div style={{ fontSize: "14px", color: "#8a8aaa", lineHeight: "1.7", maxWidth: "400px", margin: "0 auto" }}>
          Upgrade your plan to add your logo, business details, and custom receipt footer to every transaction receipt.
        </div>
        <div style={{ marginTop: "24px", padding: "14px 20px", background: "#f0f0ff", borderRadius: "10px", display: "inline-block", fontSize: "13px", color: "#4f46e5" }}>
          Current plan: <strong>{plan?.name || "Starter"}</strong> — Go to Subscription to upgrade
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2a" }}>🎨 Business Branding</div>
          <div style={{ fontSize: "13px", color: "#8a8aaa", marginTop: "3px" }}>Customise how your business appears on every receipt</div>
        </div>
        <button onClick={saveChanges}
          style={{ padding: "10px 24px", background: saved ? "#059669" : theme.accent, color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "background 0.3s" }}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px" }}>
        {/* Left: form */}
        <div>
          {/* Logo upload */}
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2a", marginBottom: "14px" }}>Business Logo</div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Logo preview */}
              <div style={{
                width: "100px", height: "80px", border: "2px dashed #e5e7eb",
                borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                background: "#fafafa", overflow: "hidden", flexShrink: 0,
              }}>
                {preview
                  ? <img src={preview} alt="logo" style={{ maxWidth: "96px", maxHeight: "76px", objectFit: "contain" }} />
                  : <span style={{ fontSize: "28px" }}>🏢</span>
                }
              </div>

              <div style={{ flex: 1 }}>
                <label style={{
                  display: "inline-block", padding: "9px 18px", background: theme.accent + "18",
                  color: theme.accent, border: `1px solid ${theme.accent}44`, borderRadius: "8px",
                  fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "6px",
                }}>
                  Upload Logo
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload} style={{ display: "none" }} />
                </label>
                {preview && (
                  <button onClick={removeLogo}
                    style={{ marginLeft: "10px", padding: "9px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                    Remove
                  </button>
                )}
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>PNG, JPG, SVG or WebP · Max 2MB · Recommended: 300×200px</div>
              </div>
            </div>
          </div>

          {/* Text fields */}
          <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2a", marginBottom: "16px" }}>Receipt Details</div>

            {[
              ["Business Display Name",  "displayName",    "text",     "As shown on receipts"],
              ["Address on Receipt",     "displayAddr",    "text",     "Street, City, State"],
              ["Phone on Receipt",       "displayPhone",   "tel",      "080XXXXXXXXX"],
            ].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "#6a6a8a", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>{label}</div>
                <input
                  type={type} value={form[key]} placeholder={ph}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "#6a6a8a", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>Receipt Footer Message</div>
              <textarea
                value={form.receiptFooter} rows={2}
                onChange={e => setForm(p => ({ ...p, receiptFooter: e.target.value }))}
                placeholder="e.g. Thank you! Come again soon."
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "Georgia, serif" }}
              />
            </div>
          </div>
        </div>

        {/* Right: live receipt preview */}
        <div style={{ position: "sticky", top: "20px" }}>
          <div style={{ fontSize: "12px", color: "#aaa", textAlign: "center", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Receipt Preview</div>
          <div style={{
            background: "#fff", borderRadius: "4px", padding: "22px 18px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
            fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#1a1a1a",
            lineHeight: "1.65",
          }}>
            <div style={{ textAlign: "center", borderBottom: "1px dashed #ccc", paddingBottom: "10px", marginBottom: "10px" }}>
              {preview && <img src={preview} alt="" style={{ maxHeight: "44px", maxWidth: "140px", objectFit: "contain", display: "block", margin: "0 auto 6px" }} />}
              <div style={{ fontWeight: "700", fontSize: "13px", textTransform: "uppercase" }}>{form.displayName || tenant.name}</div>
              {form.displayAddr  && <div style={{ fontSize: "10px", color: "#666" }}>{form.displayAddr}</div>}
              {form.displayPhone && <div style={{ fontSize: "10px", color: "#666" }}>Tel: {form.displayPhone}</div>}
            </div>
            <div style={{ fontSize: "10px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Date:</span><span>{new Date().toLocaleDateString("en-NG")}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Ref:</span><span style={{ fontWeight: "700" }}>ASP-XXXXXX</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Cashier:</span><span>John Doe [A1B2C3D4]</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Payment:</span><span>CASH</span></div>
            </div>
            <div style={{ borderTop: "1px dashed #ccc", borderBottom: "1px dashed #ccc", padding: "8px 0", marginBottom: "8px", fontSize: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 8px", fontWeight: "700", marginBottom: "4px" }}>
                <span>Item</span><span>Qty</span><span>Amt</span>
              </div>
              {[["Sample Item A","2","₦900"],["Sample Item B","1","₦1,200"]].map(([n,q,a])=>(
                <div key={n} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 8px" }}>
                  <span>{n}</span><span>{q}</span><span>{a}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "10px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>₦2,100</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>VAT 7.5%</span><span>₦158</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "12px", borderTop: "1px solid #1a1a1a", paddingTop: "4px", marginTop: "4px" }}>
                <span>TOTAL</span><span>₦2,258</span>
              </div>
            </div>
            <div style={{ textAlign: "center", borderTop: "1px dashed #ccc", paddingTop: "8px", fontSize: "9px", color: "#888" }}>
              <div>{form.receiptFooter || "Thank you for your patronage."}</div>
              <div style={{ marginTop: "4px", color: "#ccc" }}>Powered by Anchor Sales Pro</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL SEARCH + EXPORT — Super Admin only
   Cross-tenant, date-range filtered, CSV & Excel export
═══════════════════════════════════════════════════════════════════════════ */
function exportXLSX(rows, headers, sheetName, filename) {
  // Build a minimal XLSX file manually (SpreadsheetML XML inside a zip-like base64)
  // Using the SheetJS-style CSV fallback wrapped in Excel-compatible XML
  const xmlRows = [headers, ...rows].map(row =>
    "<Row>" + row.map(cell =>
      `<Cell><Data ss:Type="String">${String(cell ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</Data></Cell>`
    ).join("") + "</Row>"
  ).join("\n");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${sheetName}">
  <Table>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function GlobalSearchPage({ platform }) {
  const today     = new Date().toISOString().slice(0, 10);
  const monthAgo  = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  const [query,      setQuery]      = useState("");
  const [dateFrom,   setDateFrom]   = useState(monthAgo);
  const [dateTo,     setDateTo]     = useState(today);
  const [filterType, setFilterType] = useState("all");  // all | PHARMACY | EATERY | SUPERMARKET
  const [minAmt,     setMinAmt]     = useState("");
  const [maxAmt,     setMaxAmt]     = useState("");
  const [sortBy,     setSortBy]     = useState("date_desc");

  // Flatten all transactions across all tenants
  const allTx = platform.tenants.flatMap(t =>
    t.sales.map(s => ({
      ...s,
      tenantId:   t.id,
      tenantName: t.name,
      tenantType: t.type,
    }))
  );

  const filtered = allTx.filter(tx => {
    const txDate = new Date(tx.date).toISOString().slice(0, 10);
    if (dateFrom && txDate < dateFrom)   return false;
    if (dateTo   && txDate > dateTo)     return false;
    if (filterType !== "all" && tx.tenantType !== filterType) return false;
    if (minAmt && tx.total < Number(minAmt)) return false;
    if (maxAmt && tx.total > Number(maxAmt)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        (tx.productName  || "").toLowerCase().includes(q) ||
        (tx.txRef        || "").toLowerCase().includes(q) ||
        (tx.cashierName  || tx.cashier || "").toLowerCase().includes(q) ||
        (tx.tenantName   || "").toLowerCase().includes(q) ||
        (tx.paymentMethod|| "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date_desc")  return new Date(b.date)  - new Date(a.date);
    if (sortBy === "date_asc")   return new Date(a.date)  - new Date(b.date);
    if (sortBy === "amount_desc")return b.total - a.total;
    if (sortBy === "amount_asc") return a.total - b.total;
    return 0;
  });

  const totalFiltered = sorted.reduce((s, x) => s + x.total, 0);
  const uniqueTenants = [...new Set(sorted.map(x => x.tenantName))].length;

  const CSV_HEADERS = ["Date","Time","Ref No","Business","Type","Product","SKU","Qty","Unit Price","Total","Cashier","Payment Method"];
  function txToRow(tx) {
    const d = new Date(tx.date);
    return [
      d.toLocaleDateString("en-NG"),
      d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
      tx.txRef || tx.id,
      tx.tenantName,
      tx.tenantType,
      tx.productName,
      tx.sku || "—",
      tx.qty,
      tx.price,
      tx.total,
      tx.cashierName || tx.cashier || "—",
      tx.paymentMethod || "—",
    ];
  }

  function doExportCSV() {
    exportCSV(sorted.map(txToRow), CSV_HEADERS,
      `ASP_Transactions_${dateFrom}_to_${dateTo}.csv`);
  }

  function doExportExcel() {
    exportXLSX(sorted.map(txToRow), CSV_HEADERS, "Transactions",
      `ASP_Transactions_${dateFrom}_to_${dateTo}.xls`);
  }

  const inputStyle = {
    padding: "9px 12px", border: "1px solid #2a2a3a", borderRadius: "7px",
    background: "#0d0d1e", color: "#e0e0f0", fontSize: "12px", outline: "none",
    fontFamily: "Georgia, serif",
  };

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#fff" }}>🔍 Global Transaction Search</div>
          <div style={{ fontSize: "13px", color: "#5a5a7a", marginTop: "3px" }}>Search across all tenants with date range and filters</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={doExportCSV}
            style={{ padding: "9px 18px", background: "#0a2a1a", color: "#4ade80", border: "1px solid #164016", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            ↓ CSV
          </button>
          <button onClick={doExportExcel}
            style={{ padding: "9px 18px", background: "#0a1a2a", color: "#60a5fa", border: "1px solid #162a40", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
            ↓ Excel
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: "#0d0d18", border: "1px solid #1a1a2a", borderRadius: "12px", padding: "18px 20px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "10px", alignItems: "end" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>Search</div>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Product, ref, cashier, business…"
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>From</div>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>To</div>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>Business Type</div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
              <option value="all">All Types</option>
              {["PHARMACY","EATERY","SUPERMARKET"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>Min ₦</div>
            <input type="number" value={minAmt} onChange={e => setMinAmt(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>Sort</div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "18px" }}>
        {[
          { label: "Matching Records", value: sorted.length.toLocaleString(), color: "#8b5cf6" },
          { label: "Total Revenue",    value: fmt(totalFiltered),             color: "#4ade80" },
          { label: "Businesses",       value: uniqueTenants,                  color: "#60a5fa" },
          { label: "Avg Transaction",  value: fmt(sorted.length ? Math.round(totalFiltered / sorted.length) : 0), color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#0d0d18", border: "1px solid #1a1a2a", borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ fontSize: "18px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#4a4a6a", marginTop: "3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Results table */}
      <div style={{ background: "#0d0d18", border: "1px solid #1a1a2a", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto", maxHeight: "520px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "900px" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr style={{ background: "#090912" }}>
                {["Date & Time","Ref No","Business","Type","Product","Qty","Total","Cashier","Method"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: "10px", color: "#5a5a7a", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "700", borderBottom: "1px solid #1a1a2a", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#3a3a5a" }}>No transactions match your filters</td></tr>
              )}
              {sorted.map((tx, i) => {
                const theme = TYPE_THEME[tx.tenantType];
                return (
                  <tr key={tx.id + i}
                    style={{ background: i % 2 === 0 ? "#0d0d18" : "#0a0a14", borderBottom: "1px solid #131320" }}>
                    <td style={{ padding: "10px 14px", color: "#8a8aaa", whiteSpace: "nowrap" }}>
                      <div>{new Date(tx.date).toLocaleDateString("en-NG")}</div>
                      <div style={{ fontSize: "10px", color: "#4a4a6a" }}>{new Date(tx.date).toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" })}</div>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "11px", color: "#7a7aaa" }}>{tx.txRef || tx.id.slice(0,10)}</td>
                    <td style={{ padding: "10px 14px", color: "#e0e0f0", fontWeight: "600" }}>{tx.tenantName}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: theme.accent + "22", color: theme.accent, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>{theme.icon} {tx.tenantType}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#c0c0d8" }}>{tx.productName}</td>
                    <td style={{ padding: "10px 14px", color: "#8a8aaa", textAlign: "center" }}>{tx.qty}</td>
                    <td style={{ padding: "10px 14px", color: "#4ade80", fontWeight: "700" }}>{fmt(tx.total)}</td>
                    <td style={{ padding: "10px 14px", color: "#8a8aaa" }}>
                      <div>{tx.cashierName || tx.cashier || "—"}</div>
                      {tx.cashierId && <div style={{ fontSize: "10px", color: "#3a3a5a", fontFamily: "monospace" }}>[{tx.cashierId.slice(0,8).toUpperCase()}]</div>}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: "11px", color: "#8a8aaa", background: "#1a1a2a", padding: "2px 8px", borderRadius: "4px" }}>{tx.paymentMethod || "—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #1a1a2a", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#4a4a6a" }}>
            <span>Showing {sorted.length.toLocaleString()} records</span>
            <span>Total: <strong style={{ color: "#4ade80" }}>{fmt(totalFiltered)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}

