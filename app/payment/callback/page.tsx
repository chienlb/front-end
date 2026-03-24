"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { paymentsService } from "@/services/payments.service";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");

  const queryObject = useMemo(() => {
    const obj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    return obj;
  }, [searchParams]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res: any = await paymentsService.handleReturn(queryObject);
        const payload = res?.data || res;
        setOk(true);
        setMessage(payload?.message || "Thanh toán thành công.");
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Thanh toán chưa hoàn tất hoặc đã bị hủy.";
        setOk(false);
        setMessage(Array.isArray(msg) ? msg.join(", ") : msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [queryObject]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wide mb-5">
          <Sparkles size={14} />
          Kết quả thanh toán
        </div>

        {loading ? (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Đang xử lý
            </h1>
          </>
        ) : ok ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Thanh toán thành công
            </h1>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Thanh toán chưa thành công
            </h1>
          </>
        )}

        <p className="text-slate-600 mb-4">{message}</p>
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 mb-6">
          <ShieldCheck size={14} className="text-emerald-600" />
          Trạng thái được xác nhận trực tiếp từ hệ thống thanh toán.
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/parent/subscription"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-300/40"
          >
            Quay lại gói cước
          </Link>
          <Link
            href="/"
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

