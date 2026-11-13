import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Search,
  RefreshCw,
  LogOut,
  Lock,
  User,
  AlertCircle,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface OrderItem {
  id: number;
  created_at: string;
  business: string;
  business_type: string;
  person: string;
  phone: string;
  volume: string;
  message: string;
  products: string[];
  status: "yangi" | "korildi" | "yetkazildi" | "bekor";
  telegram_message_id?: number;
  telegram_pinned?: boolean;
}

interface StatsData {
  total_orders: number;
  today_orders: number;
  pending_orders: number;
  completed_orders: number;
  top_products: Array<{ product_id: string; count: number }>;
}

const PRODUCT_LABELS: Record<string, string> = {
  "egg-s": "🥚 Tuxum (C2)",
  "egg-m": "🥚 Tuxum (C1)",
  "egg-l": "🥚 Tuxum (C0)",
  "chicken-whole": "🍗 Butun tovuq",
  "chicken-breast": "🥩 Tovuq filesi",
  "chicken-leg": "🍗 Tovuq soni",
  "chicken-wing": "🍗 Tovuq qanoti",
  "chicken-mince": "🥘 Tovuq qiymasi",
  "beef-tender": "🥩 Mol go'shti (lahm)",
  "beef-soup": "🍖 Mol sho'rvalik",
  "beef-ribs": "🥩 Mol qovurg'asi",
  "beef-mince": "🥘 Mol qiymasi",
  qatiq: "🥛 Qatiq",
  milk: "🥛 Yangi sut",
  cream: "🥣 Qaymoq",
};

const STATUS_CONFIG = {
  yangi: {
    label: "Yangi",
    bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badge: "bg-amber-500",
    dot: "bg-amber-500",
  },
  korildi: {
    label: "Ko'rib chiqildi",
    bg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badge: "bg-blue-500",
    dot: "bg-blue-500",
  },
  yetkazildi: {
    label: "Yetkazildi",
    bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    badge: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  bekor: {
    label: "Bekor qilindi",
    bg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    badge: "bg-rose-500",
    dot: "bg-rose-500",
  },
};

const API_BASE = "http://localhost:8000";

export function AdminDashboard() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agromax_admin_token");
    }
    return null;
  });

  // Auth form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.detail || "Login yoki parol noto'g'ri");
      }

      setToken(data.token);
      localStorage.setItem("agromax_admin_token", data.token);
      showToast("Xush kelibsiz! Tizimga muvaffaqiyatli kirdingiz.");
    } catch (err: any) {
      setAuthError(err.message || "Tizimga kirishda xatolik yuz berdi");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("agromax_admin_token");
    setOrders([]);
    setStats(null);
  };

  // Fetch orders and stats
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!token || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 25000);
    return () => clearInterval(interval);
  }, [token, autoRefresh, fetchData]);

  // Update status handler
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const resp = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!resp.ok) throw new Error("Holatni yangilashda xatolik");

      showToast(`Buyurtma #${orderId} holati "${newStatus}" ga o'zgartirildi!`);
      fetchData();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete order handler
  const handleDeleteOrder = async (orderId: number) => {
    if (!token) return;
    if (!confirm(`Haqiqatan ham #${orderId} raqamli buyurtmani o'chirmoqchimisiz?`)) return;

    try {
      const resp = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("O'chirishda xatolik");

      showToast(`Buyurtma #${orderId} muvaffaqiyatli o'chirildi`);
      fetchData();
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.business.toLowerCase().includes(q) ||
        item.person.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        String(item.id).includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, search]);

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card/95 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              AgroMax Boshqaruv Paneli
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Operator va administratorlar uchun xavfsiz tizim
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 relative">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Foydalanuvchi nomi (Login)
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Parol
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 active:scale-[0.99] transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Tizimga kirish</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Asosiy saytga qaytish</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN DASHBOARD SCREEN
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-border">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-serif">
                A
              </span>
              <span>AgroMax</span>
            </a>
            <span className="hidden sm:inline-block h-5 w-px bg-border" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Boshqaruv Paneli (Live)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData()}
              disabled={loading}
              title="Ma'lumotlarni yangilash"
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                autoRefresh
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground border-transparent"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Avto-yangilash: {autoRefresh ? "On (25s)" : "Off"}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Saytni ko'rish</span>
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs hover:border-primary/40 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Jami Buyurtmalar
              </span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{stats?.total_orders ?? orders.length}</span>
              <span className="text-xs text-muted-foreground">ta buyurtma</span>
            </div>
          </div>

          <div className="bg-card border border-amber-500/20 rounded-2xl p-5 shadow-xs bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                Kutilayotgan (Yangi)
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">
                {stats?.pending_orders ?? orders.filter((o) => o.status === "yangi").length}
              </span>
              <span className="text-xs text-muted-foreground">ko'rib chiqish kerak</span>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                Bugungi Buyurtmalar
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600">{stats?.today_orders ?? 0}</span>
              <span className="text-xs text-muted-foreground">bugun tushgan</span>
            </div>
          </div>

          <div className="bg-card border border-emerald-500/20 rounded-2xl p-5 shadow-xs bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                Yetkazib berilgan
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">
                {stats?.completed_orders ?? orders.filter((o) => o.status === "yetkazildi").length}
              </span>
              <span className="text-xs text-muted-foreground">muvaffaqiyatli</span>
            </div>
          </div>
        </section>

        {/* Top Products widget (if available) */}
        {stats && stats.top_products && stats.top_products.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Eng ko'p so'ralayotgan mahsulotlar (Top-5)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stats.top_products.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-background border border-border/60">
                  <div className="text-xs text-muted-foreground truncate font-medium">
                    {PRODUCT_LABELS[p.product_id] || p.product_id}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-foreground">{p.count}</span>
                    <span className="text-xs text-primary font-medium">buyurtmada</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter and Search Bar */}
        <section className="bg-card border border-border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "Barchasi", count: orders.length },
              {
                id: "yangi",
                label: "Yangi",
                count: orders.filter((o) => o.status === "yangi").length,
                color: "text-amber-500",
              },
              {
                id: "korildi",
                label: "Ko'rildi",
                count: orders.filter((o) => o.status === "korildi").length,
                color: "text-blue-500",
              },
              {
                id: "yetkazildi",
                label: "Yetkazildi",
                count: orders.filter((o) => o.status === "yetkazildi").length,
                color: "text-emerald-500",
              },
              {
                id: "bekor",
                label: "Bekor",
                count: orders.filter((o) => o.status === "bekor").length,
                color: "text-rose-500",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedStatus === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-background/80 text-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Korxona, ism yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ×
              </button>
            )}
          </div>
        </section>

        {/* Orders List / Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            <span>Buyurtmalar ro'yxati ({filteredOrders.length} ta)</span>
            <span>Toshkent vaqti bilan</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-muted grid place-items-center text-muted-foreground mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-foreground">Hozircha buyurtma topilmadi</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {search
                  ? "Qidiruv bo'yicha hech narsa chiqmadi. Boshqa so'z bilan izlab ko'ring."
                  : "Ushbu toifada hozircha hech qanday buyurtma mavjud emas."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.yangi;
                const formattedDate = order.created_at
                  ? new Date(order.created_at).toLocaleString("uz-UZ", {
                      timeZone: "Asia/Tashkent",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <div
                    key={order.id}
                    className={`bg-card border rounded-2xl p-5 shadow-xs transition hover:shadow-md ${
                      order.status === "yangi" ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-border"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground">
                            #{order.id}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formattedDate}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusCfg.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                          {order.telegram_pinned && (
                            <span className="text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-full">
                              📌 TG Pin
                            </span>
                          )}
                        </div>

                        {/* Customer details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                          <div>
                            <span className="text-[11px] text-muted-foreground block">Korxona:</span>
                            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-primary" />
                              {order.business}
                            </span>
                            <span className="text-xs text-muted-foreground">({order.business_type})</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-muted-foreground block">Mas'ul shaxs:</span>
                            <span className="text-sm font-medium text-foreground">{order.person}</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-muted-foreground block">Telefon:</span>
                            <a
                              href={`tel:${order.phone}`}
                              className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {order.phone}
                            </a>
                          </div>
                        </div>

                        {/* Products pills */}
                        <div className="pt-2">
                          <span className="text-[11px] text-muted-foreground block mb-1.5">Mahsulotlar:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {order.products.map((pId, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium border border-primary/15"
                              >
                                {PRODUCT_LABELS[pId] || pId}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Volume & Message */}
                        {(order.volume || order.message) && (
                          <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/50">
                            {order.volume && (
                              <div>
                                <span className="font-semibold text-foreground">Hajm: </span>
                                <span className="text-muted-foreground">{order.volume}</span>
                              </div>
                            )}
                            {order.message && (
                              <div>
                                <span className="font-semibold text-foreground">Izoh: </span>
                                <span className="text-muted-foreground italic">"{order.message}"</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                        {/* Direct Call Button */}
                        <a
                          href={`tel:${order.phone}`}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Qo'ng'iroq qilish</span>
                        </a>

                        {/* Status dropdown / quick buttons */}
                        <div className="flex items-center gap-1">
                          {order.status !== "korildi" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "korildi")}
                              disabled={updatingId === order.id}
                              title="Ko'rib chiqildi deb belgilash"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-medium border border-blue-500/20 transition cursor-pointer"
                            >
                              Ko'rildi
                            </button>
                          )}
                          {order.status !== "yetkazildi" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "yetkazildi")}
                              disabled={updatingId === order.id}
                              title="Yetkazildi deb belgilash"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-medium border border-emerald-500/20 transition cursor-pointer"
                            >
                              Yetkazildi
                            </button>
                          )}
                          {order.status !== "bekor" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "bekor")}
                              disabled={updatingId === order.id}
                              title="Bekor qilish"
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-medium border border-rose-500/20 transition cursor-pointer"
                            >
                              Bekor
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            title="O'chirish"
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
