"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { paymentsService } from "@/services/payments.service";

function PaymentReturnContent() {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Đang xử lý
            </h1>
          </>
        ) : ok ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Thanh toán thành công
            </h1>
          </>
        ) : (
          <>
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Thanh toán chưa thành công
            </h1>
          </>
        )}

        <p className="text-slate-600 mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/parent/subscription"
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
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

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">Đang xử lý</h1>
            <p className="text-slate-600">Đang xác nhận thanh toán...</p>
          </div>
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}

