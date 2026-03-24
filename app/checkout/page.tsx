"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { paymentsService } from "@/services/payments.service";
import { subscriptionsService } from "@/services/subscriptions.service";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<"paypal" | "vnpay">("paypal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const info = useMemo(() => {
    const id = searchParams.get("id") || "";
    const subscriptionId = searchParams.get("subscriptionId") || "";
    const name = searchParams.get("name") || "Gói nâng cấp";
    const price = Number(searchParams.get("price") || 0);
    const durationDays = Number(searchParams.get("durationDays") || 30);
    const desc = searchParams.get("desc") || `Thanh toán ${name}`;
    return { id, subscriptionId, name, price, durationDays, desc };
  }, [searchParams]);

  const onPay = async () => {
    if (!info.id || !info.price) {
      setError("Thiếu thông tin gói thanh toán.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      let subscriptionId = info.subscriptionId;
      if (!subscriptionId) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.max(1, info.durationDays || 30));

        const created: any = await subscriptionsService.createSubscription({
          packageId: info.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          autoRenew: true,
        });
        subscriptionId = subscriptionsService.extractSubscriptionId(created);
      }
      if (!subscriptionId) {
        throw new Error("Không lấy được subscriptionId từ packageId.");
      }

      const normalizedAmount =
        method === "vnpay" ? Math.round(Number(info.price || 0)) : Number(info.price || 0);
      const currency = method === "vnpay" ? "VND" : "USD";

      const res: any = await paymentsService.createPayment({
        subscriptionId,
        amount: normalizedAmount,
        method,
        currency,
        description: info.desc,
      });

      const paymentUrl =
        res?.data?.paymentUrl ||
        res?.paymentUrl ||
        res?.data?.checkoutUrl ||
        res?.checkoutUrl ||
        res?.data?.approvalUrl ||
        res?.approvalUrl ||
        res?.data?.url ||
        res?.url;

      if (paymentUrl && typeof window !== "undefined") {
        window.location.href = paymentUrl;
        return;
      }

      setError("Không nhận được link thanh toán từ hệ thống.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Không thể tạo thanh toán. Vui lòng thử lại.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl p-6 md:p-7">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wide mb-3">
            <Sparkles size={14} />
            Thanh toán an toàn
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">Xác nhận đơn hàng</h1>
          <p className="text-slate-500 text-sm">Hoàn tất thanh toán cho gói học của bạn qua PayPal hoặc VNPay.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 mb-5 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 font-semibold">Gói cước</span>
            <span className="font-bold text-slate-800">{info.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Tổng thanh toán</span>
            <span className="text-3xl font-black text-blue-600">
              {info.price.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <label className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl cursor-pointer transition ${method === "paypal" ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
            <div className="inline-flex items-center gap-3">
              <input
                type="radio"
                checked={method === "paypal"}
                onChange={() => setMethod("paypal")}
              />
              <CreditCard size={18} className="text-blue-700" />
              <span className="font-bold text-slate-700">PayPal</span>
            </div>
            {method === "paypal" && (
              <span className="text-[11px] font-extrabold text-blue-700 bg-white px-2 py-1 rounded-full border border-blue-100">
                Đã chọn
              </span>
            )}
          </label>

          <label className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl cursor-pointer transition ${method === "vnpay" ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
            <div className="inline-flex items-center gap-3">
              <input
                type="radio"
                checked={method === "vnpay"}
                onChange={() => setMethod("vnpay")}
              />
              <CreditCard size={18} className="text-blue-700" />
              <span className="font-bold text-slate-700">VNPay</span>
            </div>
            {method === "vnpay" && (
              <span className="text-[11px] font-extrabold text-blue-700 bg-white px-2 py-1 rounded-full border border-blue-100">
                Đã chọn
              </span>
            )}
          </label>

          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-600" />
            Giao dịch được mã hóa và bảo mật bởi cổng thanh toán.
          </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/subscription"
            className="flex-1 py-3 text-center rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
          >
            Quay lại
          </Link>
          <button
            onClick={onPay}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-300/40 disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Đang tạo thanh toán...
              </span>
            ) : (
              "Thanh toán ngay"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl p-6 md:p-7 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">Đang xử lý</h1>
            <p className="text-slate-600">Đang tải thông tin thanh toán...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

