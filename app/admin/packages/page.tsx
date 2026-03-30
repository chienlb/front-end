"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Plus,
  Package,
  Zap,
  Crown,
  Sparkles,
  X,
  Loader2,
  CircleDollarSign,
  CalendarDays,
} from "lucide-react";
import { packagesService, type PackageApiItem } from "@/services/packages.service";

type PackageViewItem = {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  currency: string;
  durationDays: number;
  durationLabel: string;
  statusText: string;
  active: boolean;
  color: string;
  icon: typeof Package;
  features: string[];
};

const toArray = (payload: any): PackageApiItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.docs)) return payload.docs;
  return [];
};

const pickPackageName = (item: PackageApiItem) =>
  item.name || "Gói chưa đặt tên";

const pickPackagePrice = (item: PackageApiItem) =>
  Number(item.price ?? 0);

const pickPackageDuration = (item: PackageApiItem) =>
  Number(item.durationInDays ?? 30);

const pickPackageType = (item: PackageApiItem) =>
  String(item.type || "standard").toLowerCase();

const pickPackageCurrency = (item: PackageApiItem) =>
  String(item.currency || "VND").toUpperCase();

const pickPackageDescription = (item: PackageApiItem) =>
  String(item.description || "");

const formatDurationLabel = (type: string, durationDays: number) => {
  if (type === "free") return "Vĩnh viễn";
  if (!Number.isFinite(durationDays) || durationDays >= 36500) return "Vĩnh viễn";
  return `${durationDays} ngày`;
};

const resolvePackageStatus = (item: PackageApiItem) => {
  const anyItem = item as any;
  const raw = String(anyItem?.status || "").toLowerCase();
  if (raw) {
    const activeByStatus = ["active", "published", "enabled", "on"].includes(raw);
    return {
      active: activeByStatus,
      statusText: activeByStatus ? "Đang bán" : "Tạm dừng",
    };
  }

  const active = anyItem?.isActive !== false;
  return {
    active,
    statusText: active ? "Đang bán" : "Tạm dừng",
  };
};

const normalizeFeatures = (item: PackageApiItem): string[] => {
  if (Array.isArray(item.features) && item.features.length > 0) return item.features;
  const desc = item.description || "";
  if (!desc) return ["Gói học tập tiêu chuẩn"];
  return desc
    .split(/\n|\.|;/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
};

const getTypeMeta = (type: string) => {
  const t = type.toLowerCase();
  if (t === "premium" || t === "vip") {
    return {
      label: t.toUpperCase(),
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      bar: "from-amber-500 to-orange-500",
    };
  }
  if (t === "standard") {
    return {
      label: "STANDARD",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      bar: "from-blue-500 to-indigo-500",
    };
  }
  return {
    label: t.toUpperCase(),
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    bar: "from-slate-500 to-slate-600",
  };
};

export default function PackageConfigPage() {
  const [packages, setPackages] = useState<PackageViewItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "free" | "standard" | "premium" | "vip">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "standard",
    price: "99000",
    durationInDays: "30",
    currency: "VND",
    featuresText: "Không quảng cáo\nTốc độ xử lý nhanh hơn\nHỗ trợ cơ bản",
    isActive: true,
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await packagesService.getPackages({ page: 1, limit: 50 });
      const payload = res?.data ?? res;
      const list = toArray(payload);

      const mapped = list.map((item, idx) => {
        const name = pickPackageName(item);
        const type = pickPackageType(item);
        const description = pickPackageDescription(item);
        const upperName = name.toUpperCase();
        const rawPrice = pickPackagePrice(item);
        const durationDays = pickPackageDuration(item);
        const isPremium = type === "premium" || upperName.includes("PREMIUM") || upperName.includes("VIP");
        const isBasic = type === "standard" || upperName.includes("BASIC") || upperName.includes("STANDARD");
        const { active, statusText } = resolvePackageStatus(item);

        const price = type === "free" && rawPrice <= 1 ? 0 : rawPrice;
        return {
          id: String(item._id || item.id || idx + 1),
          name,
          description,
          type,
          price,
          durationDays,
          durationLabel: formatDurationLabel(type, durationDays),
          currency: pickPackageCurrency(item),
          statusText,
          active,
          color: isPremium
            ? "bg-gradient-to-r from-amber-500 to-orange-500"
            : isBasic
              ? "bg-blue-600"
              : "bg-slate-500",
          icon: isPremium ? Crown : isBasic ? Zap : Package,
          features: normalizeFeatures(item),
        } as PackageViewItem;
      });

      setPackages(mapped);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Không tải được danh sách gói đăng ký";
      setError(String(message));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreatePackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const name = form.name.trim();
    const description = form.description.trim();
    const type = form.type.trim().toLowerCase();
    const price = Number(form.price);
    const durationInDays = Number(form.durationInDays);
    const currency = form.currency.trim().toUpperCase() || "VND";
    const features = form.featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!name) {
      setError("Vui lòng nhập tên gói.");
      return;
    }
    if (!type) {
      setError("Vui lòng chọn loại gói.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Giá gói không hợp lệ.");
      return;
    }
    if (!Number.isFinite(durationInDays) || durationInDays <= 0) {
      setError("Thời hạn gói phải lớn hơn 0 ngày.");
      return;
    }

    try {
      setCreating(true);
      await packagesService.createPackage({
        name,
        description,
        type,
        price,
        durationInDays,
        currency,
        features,
        isActive: form.isActive,
      });

      setOpenCreateModal(false);
      setForm({
        name: "",
        description: "",
        type: "standard",
        price: "99000",
        durationInDays: "30",
        currency: "VND",
        featuresText: "Không quảng cáo\nTốc độ xử lý nhanh hơn\nHỗ trợ cơ bản",
        isActive: true,
      });
      setSuccess("Tạo gói đăng ký thành công.");
      await fetchPackages();
    } catch (e: any) {
      const message =
        e?.response?.data?.message || e?.message || "Không thể tạo gói đăng ký";
      setError(String(message));
    } finally {
      setCreating(false);
    }
  };

  const totalActive = useMemo(
    () => packages.filter((pkg) => pkg.active).length,
    [packages],
  );

  const filteredPackages = useMemo(() => {
    if (typeFilter === "all") return packages;
    return packages.filter((pkg) => pkg.type.toLowerCase() === typeFilter);
  }, [packages, typeFilter]);

  return (
    <div className="p-8 min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#eef2ff_50%,#f8fafc_100%)]">
      <div className="mb-8 rounded-3xl border border-white/80 bg-white/75 backdrop-blur px-6 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
        <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Sparkles size={14} /> Subscription Manager
          </p>
          <h1 className="text-3xl font-black text-slate-800 mt-3">
            Quản Lý Gói Đăng Ký
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý giá bán và quyền lợi các gói dịch vụ.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {loading
              ? "Đang tải dữ liệu..."
              : `${packages.length} gói, ${totalActive} đang bán`}
          </p>
        </div>
        <button
          onClick={() => setOpenCreateModal(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus size={18} /> Thêm gói mới
        </button>
      </div>
      </div>

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tổng gói</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{packages.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Đang bán</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{totalActive}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "Tất cả" },
          { key: "free", label: "Free" },
          { key: "standard", label: "Standard" },
          { key: "premium", label: "Premium" },
          { key: "vip", label: "VIP" },
        ].map((opt) => {
          const active = typeFilter === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setTypeFilter(opt.key as "all" | "free" | "standard" | "premium" | "vip")}
              className={
                active
                  ? "rounded-full px-4 py-2 text-sm font-bold border border-blue-200 bg-blue-600 text-white shadow-sm"
                  : "rounded-full px-4 py-2 text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {!loading && filteredPackages.length === 0 && !error && (
        <div className="mb-6 rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
          <Package size={42} className="mx-auto text-slate-300" />
          <p className="mt-4 text-base font-bold text-slate-700">Không có gói phù hợp bộ lọc</p>
          <p className="mt-1 text-sm text-slate-500">Hãy đổi bộ lọc type để xem thêm gói.</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-80 rounded-2xl border border-slate-200 bg-white/80 animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-[1.35rem] shadow-sm border border-slate-200 overflow-hidden relative group hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgba(15,23,42,0.16)] transition-all duration-300"
          >
            <div className={`h-2 w-full bg-gradient-to-r ${getTypeMeta(pkg.type).bar}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div
                  className="p-3 rounded-xl bg-slate-100 text-slate-800"
                >
                  <pkg.icon
                    className={
                      pkg.type === "premium" || pkg.type === "vip"
                        ? "text-amber-500"
                        : pkg.type === "standard"
                          ? "text-blue-600"
                          : "text-slate-500"
                    }
                    size={24}
                  />
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition">
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getTypeMeta(pkg.type).badge}`}
                >
                  {getTypeMeta(pkg.type).label}
                </span>
                <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                  {pkg.currency}
                </span>
              </div>

              <h3 className="text-[1.35rem] font-black text-slate-800 leading-tight">{pkg.name}</h3>
              {pkg.description && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{pkg.description}</p>
              )}
              <div className="flex items-baseline gap-1 mt-4 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                <CircleDollarSign size={18} className="text-slate-400" />
                <span className="text-3xl font-bold text-slate-900">
                  {pkg.price.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-sm text-slate-500 inline-flex items-center gap-1">
                  <CalendarDays size={14} /> {pkg.durationLabel}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {pkg.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100"
                  >
                    <Check
                      size={16}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span>Trạng thái</span>
                  <span
                    className={
                      pkg.active
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"
                        : "text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full"
                    }
                  >
                    {pkg.statusText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {openCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setOpenCreateModal(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label="Đóng"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-blue-700">
                  Tạo mới
                </p>
                <h2 className="text-xl font-black text-slate-800 mt-1">Thêm gói đăng ký</h2>
              </div>
              <button
                onClick={() => setOpenCreateModal(false)}
                className="p-2 rounded-full hover:bg-white/70 text-slate-500"
                aria-label="Đóng form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-700">Tên gói *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Gói Premium"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-700">Loại gói *</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="free">free</option>
                    <option value="standard">standard</option>
                    <option value="premium">premium</option>
                    <option value="vip">vip</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-700">Giá (VNĐ) *</span>
                  <input
                    required
                    min={0}
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-700">Thời hạn (ngày) *</span>
                  <input
                    required
                    min={1}
                    type="number"
                    value={form.durationInDays}
                    onChange={(e) => setForm((prev) => ({ ...prev, durationInDays: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-bold text-slate-700">Tiền tệ</span>
                  <input
                    value={form.currency}
                    onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="space-y-1.5 flex items-end">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 w-full">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Đang kích hoạt
                  </span>
                </label>
              </div>

              <label className="space-y-1.5 block">
                <span className="text-sm font-bold text-slate-700">Mô tả</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Mô tả ngắn về gói đăng ký"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="text-sm font-bold text-slate-700">Tính năng (mỗi dòng 1 mục)</span>
                <textarea
                  rows={4}
                  value={form.featuresText}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, featuresText: e.target.value }))
                  }
                  placeholder="Không quảng cáo&#10;Tốc độ xử lý nhanh hơn&#10;Hỗ trợ cơ bản"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {creating ? "Đang tạo..." : "Tạo gói"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
