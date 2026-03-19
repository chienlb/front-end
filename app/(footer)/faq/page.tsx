"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  HelpCircle,
  BookOpen,
  CreditCard,
  Settings,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// --- MOCK DATA ---
const FAQ_CATEGORIES = [
  { id: "ALL", label: "Tất cả", icon: HelpCircle },
  { id: "COURSE", label: "Khóa học & Lộ trình", icon: BookOpen },
  { id: "PAYMENT", label: "Học phí & Thanh toán", icon: CreditCard },
  { id: "ACCOUNT", label: "Tài khoản & Kỹ thuật", icon: Settings },
];

const FAQ_DATA = [
  {
    id: 1,
    category: "COURSE",
    question: "SmartKids dành cho độ tuổi nào?",
    answer:
      "Chương trình của SmartKids được thiết kế tối ưu cho trẻ em từ 6 đến 12 tuổi (Lớp 1 đến Lớp 5). Lộ trình bám sát khung chương trình của Bộ Giáo Dục và chuẩn Cambridge (Starters, Movers, Flyers).",
  },
  {
    id: 2,
    category: "ACCOUNT",
    question: "Tôi có thể sử dụng tài khoản trên nhiều thiết bị không?",
    answer:
      "Có! Một tài khoản SmartKids có thể đăng nhập trên tối đa 3 thiết bị (Điện thoại, Máy tính bảng, Laptop) để bé linh hoạt học tập mọi lúc mọi nơi. Tuy nhiên, tại một thời điểm chỉ có 1 thiết bị được học.",
  },
  {
    id: 3,
    category: "PAYMENT",
    question: "Hình thức thanh toán như thế nào?",
    answer:
      "Chúng tôi hỗ trợ đa dạng hình thức thanh toán: Chuyển khoản ngân hàng (QR Code), Thẻ tín dụng/ghi nợ (Visa/Mastercard), và Ví điện tử (Momo, ZaloPay). Tài khoản sẽ được kích hoạt ngay sau khi thanh toán thành công.",
  },
  {
    id: 4,
    category: "COURSE",
    question: "Con tôi chưa biết gì về tiếng Anh có học được không?",
    answer:
      "Hoàn toàn được! SmartKids có lộ trình 'Khởi động' dành riêng cho các bé mới bắt đầu, tập trung vào việc làm quen mặt chữ, phát âm cơ bản và từ vựng qua hình ảnh/video vui nhộn.",
  },
  {
    id: 5,
    category: "ACCOUNT",
    question: "Làm sao để lấy lại mật khẩu nếu bị quên?",
    answer:
      "Tại màn hình Đăng nhập, ba mẹ chọn 'Quên mật khẩu'. Hệ thống sẽ gửi mã xác thực (OTP) về Email hoặc Số điện thoại đã đăng ký để ba mẹ thiết lập lại mật khẩu mới.",
  },
  {
    id: 6,
    category: "PAYMENT",
    question: "Chính sách hoàn tiền của SmartKids ra sao?",
    answer:
      "Chúng tôi cam kết hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu ba mẹ cảm thấy chương trình không phù hợp với bé, không cần lý do.",
  },
  {
    id: 7,
    category: "COURSE",
    question: "Có giáo viên hỗ trợ bé trong quá trình học không?",
    answer:
      "Bên cạnh các bài học AI tự động, gói VIP sẽ có Giáo viên chủ nhiệm hỗ trợ 1-1 qua Zalo, chấm bài nói/viết hàng tuần và gửi báo cáo học tập chi tiết cho phụ huynh.",
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItem, setOpenItem] = useState<number | null>(null);

  // Filter Logic
  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "ALL" || item.category === activeCategory;
    const matchesSearch = item.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* 1. HEADER HERO */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-24 pb-32 px-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-purple-400 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
          <span className="bg-white/20 backdrop-blur-md text-blue-50 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 inline-block border border-white/20">
            Trung tâm trợ giúp
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Chúng tôi có thể giúp gì <br /> cho ba mẹ? 👋
          </h1>

          {/* SEARCH BAR */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Nhập từ khóa (ví dụ: học phí, quên mật khẩu...)"
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-800 shadow-xl focus:ring-4 focus:ring-blue-400/30 outline-none text-base font-medium placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="container mx-auto px-4 -mt-20 relative z-20 max-w-4xl">
        {/* CATEGORY TABS */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:-translate-y-1 ${
                activeCategory === cat.id
                  ? "bg-white text-blue-600 shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-blue-600"
                  : "bg-white/90 text-slate-500 hover:bg-white hover:text-blue-600"
              }`}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ LIST */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    openItem === item.id
                      ? "border-blue-200 shadow-lg shadow-blue-100/50"
                      : "border-slate-200 shadow-sm hover:border-blue-200"
                  }`}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                  >
                    <span
                      className={`font-bold text-lg ${openItem === item.id ? "text-blue-700" : "text-slate-700"}`}
                    >
                      {item.question}
                    </span>
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openItem === item.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      {openItem === item.id ? (
                        <Minus size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openItem === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-0">
                          <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  Không tìm thấy câu trả lời
                </h3>
                <p className="text-slate-500">
                  Ba mẹ thử tìm kiếm với từ khóa khác xem sao nhé!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. CONTACT SUPPORT FOOTER */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2.5rem] p-8 md:p-12 text-center border border-blue-100 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Vẫn cần sự hỗ trợ?
            </h2>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto">
              Đừng ngần ngại liên hệ với đội ngũ tư vấn của SmartKids. Chúng tôi
              luôn sẵn sàng lắng nghe ba mẹ 24/7.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="group bg-white hover:bg-blue-600 border border-slate-200 hover:border-transparent px-6 py-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full group-hover:bg-white/20 group-hover:text-white transition">
                  <MessageCircle size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 group-hover:text-blue-100 uppercase tracking-wider">
                    Chat ngay
                  </p>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-white">
                    Zalo Support
                  </p>
                </div>
                <ChevronRight
                  className="text-slate-300 group-hover:text-white ml-2"
                  size={16}
                />
              </Link>

              <div className="group bg-white hover:bg-green-600 border border-slate-200 hover:border-transparent px-6 py-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-3 cursor-pointer">
                <div className="bg-green-100 text-green-600 p-2 rounded-full group-hover:bg-white/20 group-hover:text-white transition">
                  <Phone size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 group-hover:text-green-100 uppercase tracking-wider">
                    Hotline
                  </p>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-white">
                    1900 1234
                  </p>
                </div>
              </div>

              <div className="group bg-white hover:bg-purple-600 border border-slate-200 hover:border-transparent px-6 py-4 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-3 cursor-pointer">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-full group-hover:bg-white/20 group-hover:text-white transition">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 group-hover:text-purple-100 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-white">
                    hotro@smartkids.vn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
