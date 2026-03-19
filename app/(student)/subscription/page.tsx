"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, ShieldCheck, ArrowRight, Zap } from "lucide-react";

// --- TYPES ---
interface PackageBenefit {
  text: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number; 
  icon: string;
  isPopular?: boolean;
  theme: "basic" | "standard" | "premium";
  features: PackageBenefit[];
}

// --- MOCK DATA ---
const PACKAGES_DATA: Package[] = [
  {
    id: "pkg_free",
    name: "Bé Tập Sự",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: "🐣",
    theme: "basic",
    features: [
      { text: "Học 2 bài miễn phí mỗi ngày", included: true },
      { text: "Truy cập kho từ vựng cơ bản", included: true },
      { text: "Tham gia bảng xếp hạng tuần", included: true },
      { text: "Trợ lý AI (Gia sư ảo)", included: false },
      { text: "Báo cáo học tập chi tiết", included: false },
      { text: "Chứng chỉ hoàn thành", included: false },
    ],
  },
  {
    id: "pkg_explorer",
    name: "Nhà Thám Hiểm",
    monthlyPrice: 149000,
    yearlyPrice: 1188000, // Tương đương 99k/tháng
    icon: "🚀",
    isPopular: true,
    theme: "standard",
    features: [
      { text: "Mở khóa TOÀN BỘ bài học", included: true },
      { text: "Không giới hạn thời gian học", included: true },
      { text: "Tắt toàn bộ quảng cáo", included: true },
      { text: "Trợ lý AI (50 lượt/ngày)", included: true },
      { text: "Báo cáo chi tiết", included: true },
      { text: "Chứng chỉ hoàn thành", included: false },
    ],
  },
  {
    id: "pkg_hero",
    name: "Siêu Anh Hùng",
    monthlyPrice: 299000,
    yearlyPrice: 2388000, // Tương đương 199k/tháng
    icon: "💎",
    theme: "premium",
    features: [
      { text: "Tất cả quyền lợi gói Thám Hiểm", included: true },
      { text: "Chat AI không giới hạn", included: true },
      { text: "Gia sư 1:1 (2 buổi/tháng)", included: true },
      { text: "Bộ quà tặng Sticker độc quyền", included: true },
      { text: "Huy hiệu VIP lấp lánh", included: true },
      { text: "Hỗ trợ ưu tiên 24/7", included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập loading để tạo hiệu ứng mượt mà
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Tính toán giá hiển thị dựa trên billingCycle
  const displayPackages = useMemo(() => {
    return PACKAGES_DATA.map((pkg) => {
      const price = billingCycle === "yearly" ? pkg.yearlyPrice : pkg.monthlyPrice;
      // Nếu là gói năm, tính giá chia đều theo tháng để so sánh
      const pricePerMonth = billingCycle === "yearly" && pkg.yearlyPrice > 0 
        ? Math.round(pkg.yearlyPrice / 12) 
        : pkg.monthlyPrice;
      
      // Tính % tiết kiệm
      const savings = pkg.monthlyPrice > 0 
        ? Math.round(((pkg.monthlyPrice * 12 - pkg.yearlyPrice) / (pkg.monthlyPrice * 12)) * 100)
        : 0;

      return { ...pkg, price, pricePerMonth, savings };
    });
  }, [billingCycle]);

  const handleSubscribe = (pkg: any) => {
    if (pkg.price === 0) return; // Gói Free không cần thanh toán

    const params = new URLSearchParams({
      type: "PACKAGE",
      id: pkg.id,
      name: pkg.name,
      price: pkg.price.toString(),
      cycle: billingCycle,
      desc: `Đăng ký gói ${pkg.name} (${billingCycle === "yearly" ? "1 năm" : "1 tháng"})`,
    });

    router.push(`/checkout?${params.toString()}`);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      
      {/* 1. HERO HEADER */}
      <div className="relative bg-[#0F172A] text-white pt-20 pb-48 px-6 rounded-b-[4rem] overflow-hidden shadow-2xl">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full blur-[128px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold text-blue-200 mb-6 animate-in fade-in slide-in-from-bottom-4">
            <Zap size={16} className="text-yellow-400 fill-yellow-400" />
            Nâng cấp tài khoản - Mở khóa tiềm năng
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Chọn Gói Cước Phù Hợp <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Cho Hành Trình Của Bé
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Đầu tư cho tương lai với chi phí hợp lý. Hủy đăng ký bất kỳ lúc nào. Không có phí ẩn.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT - OVERLAPPING HEADER */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20">
        
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-full shadow-xl border border-white/20 inline-flex relative">
            {/* Animation Background for Toggle */}
            <div 
              className={`absolute top-1.5 bottom-1.5 rounded-full bg-slate-900 transition-all duration-300 ease-out shadow-md
              ${billingCycle === "monthly" ? "left-1.5 w-[140px]" : "left-[146px] w-[160px]"}`}
            ></div>

            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 w-[140px]
              ${billingCycle === "monthly" ? "text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 w-[160px] flex items-center justify-center gap-2
              ${billingCycle === "yearly" ? "text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
              Theo Năm
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase transition-colors
                ${billingCycle === "yearly" ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm" : "bg-green-100 text-green-700"}`}>
                -30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Đang tải thông tin gói cước...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayPackages.map((pkg) => {
              const isPremium = pkg.theme === "premium";
              const isStandard = pkg.theme === "standard";

              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col rounded-[2rem] transition-all duration-300 group
                  ${isPremium 
                    ? "bg-slate-900 text-white shadow-2xl shadow-purple-900/20 scale-105 border-2 border-purple-500/50 z-10" 
                    : "bg-white text-slate-800 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2"
                  }`}
                >
                  {/* Badge Popular */}
                  {pkg.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={14} /> Khuyên dùng
                      </span>
                    </div>
                  )}

                  <div className="p-8 flex-1">
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className={`text-xl font-bold mb-1 ${isPremium ? "text-white" : "text-slate-800"}`}>
                          {pkg.name}
                        </h3>
                        <p className={`text-sm ${isPremium ? "text-slate-400" : "text-slate-500"}`}>
                          {pkg.theme === 'basic' ? 'Dành cho người mới bắt đầu' : pkg.theme === 'standard' ? 'Tăng tốc học tập' : 'Trải nghiệm toàn diện nhất'}
                        </p>
                      </div>
                      <div className="text-4xl">{pkg.icon}</div>
                    </div>

                    {/* Price Section */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight">
                          {formatCurrency(billingCycle === "yearly" && pkg.price > 0 ? pkg.pricePerMonth : pkg.price)}
                        </span>
                        {pkg.price > 0 && (
                          <span className={`text-sm font-medium ${isPremium ? "text-slate-400" : "text-slate-500"}`}>
                            /tháng
                          </span>
                        )}
                      </div>
                      
                      {/* Yearly Info */}
                      {billingCycle === "yearly" && pkg.price > 0 && (
                        <div className={`mt-2 text-sm font-medium px-3 py-1 rounded-lg w-fit
                          ${isPremium ? "bg-white/10 text-green-400" : "bg-green-50 text-green-700"}`}>
                          Thanh toán {formatCurrency(pkg.price)}/năm (Tiết kiệm {pkg.savings}%)
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className={`h-px w-full mb-8 ${isPremium ? "bg-slate-700" : "bg-slate-100"}`}></div>

                    {/* Features List */}
                    <ul className="space-y-4">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <div className={`mt-0.5 p-0.5 rounded-full shrink-0
                            ${feature.included 
                              ? (isPremium ? "bg-green-500/20 text-green-400" : "bg-blue-50 text-blue-600") 
                              : (isPremium ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-400")}`}>
                            {feature.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                          </div>
                          <span className={`font-medium ${feature.included ? (isPremium ? "text-slate-200" : "text-slate-700") : (isPremium ? "text-slate-600" : "text-slate-400")}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="p-8 pt-0 mt-auto">
                    <button
                      onClick={() => handleSubscribe(pkg)}
                      disabled={pkg.price === 0}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group
                        ${pkg.price === 0
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : isPremium
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02]"
                            : "bg-slate-900 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02]"
                        }`}
                    >
                      {pkg.price === 0 ? "Gói hiện tại" : "Chọn gói này"}
                      {pkg.price > 0 && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>}
                    </button>
                    {isPremium && (
                      <p className="text-center text-[10px] text-slate-400 mt-4 flex items-center justify-center gap-1.5 opacity-80">
                        <ShieldCheck size={12} /> Cam kết hoàn tiền trong 7 ngày đầu
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. FAQ SECTION */}
        <div className="mt-24 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Câu hỏi thường gặp</h2>
          <div className="space-y-4 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">Tôi có thể hủy gói bất cứ lúc nào không?</h3>
              <p className="text-sm text-slate-600">Được chứ! Bạn có thể hủy gia hạn bất kỳ lúc nào trong phần cài đặt tài khoản. Bạn vẫn sẽ được sử dụng tính năng VIP cho đến hết chu kỳ đã thanh toán.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-2">Gói gia sư 1:1 hoạt động như thế nào?</h3>
              <p className="text-sm text-slate-600">Với gói Siêu Anh Hùng, bạn sẽ nhận được 2 buổi học trực tuyến (30 phút/buổi) mỗi tháng với giáo viên bản ngữ hoặc giáo viên Việt Nam trình độ cao.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}