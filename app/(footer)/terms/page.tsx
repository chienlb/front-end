"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  User,
  CreditCard,
  ShieldAlert,
  Copyright,
  Ban,
  HelpCircle,
  CheckCircle2,
  FileSignature,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// --- DỮ LIỆU ĐIỀU KHOẢN ---
const TERMS_SECTIONS = [
  {
    id: "acceptance",
    title: "1. Chấp thuận điều khoản",
    icon: FileSignature,
    content: (
      <>
        <p className="mb-4">
          Chào mừng bạn đến với SmartKids. Khi truy cập website hoặc sử dụng ứng
          dụng của chúng tôi, bạn đồng ý tuân thủ các Điều khoản dịch vụ này.
        </p>
        <p>
          Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngưng sử dụng
          dịch vụ. Chúng tôi có quyền thay đổi, chỉnh sửa các điều khoản này bất
          cứ lúc nào và sẽ thông báo công khai trên website.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "2. Tài khoản & Bảo mật",
    icon: User,
    content: (
      <>
        <p className="mb-4">
          Để sử dụng đầy đủ tính năng, bạn cần đăng ký tài khoản. Bạn cam kết:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>
            Cung cấp thông tin chính xác, đầy đủ và cập nhật (Email, SĐT).
          </li>
          <li>
            Bảo mật mật khẩu và chịu trách nhiệm cho mọi hoạt động diễn ra dưới
            tài khoản của mình.
          </li>
          <li>
            Thông báo ngay cho SmartKids nếu phát hiện hành vi truy cập trái
            phép.
          </li>
          <li>
            Không chia sẻ tài khoản cho nhiều người sử dụng chung (trừ các thành
            viên trong gia đình theo gói Family).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "payment",
    title: "3. Thanh toán & Gia hạn",
    icon: CreditCard,
    content: (
      <>
        <p className="mb-4">
          Các khóa học trên SmartKids có thể được mua theo gói lẻ hoặc thuê bao
          (Subscription).
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>
            <strong>Thanh toán:</strong> Được xử lý an toàn qua các cổng thanh
            toán đối tác (VNPAY, Momo, Stripe). Chúng tôi không lưu trữ thông
            tin thẻ của bạn.
          </li>
          <li>
            <strong>Gia hạn tự động:</strong> Đối với gói thuê bao tháng/năm,
            dịch vụ sẽ tự động gia hạn trừ khi bạn hủy trước ít nhất 24 giờ.
          </li>
          <li>
            <strong>Chính sách hoàn tiền:</strong> Hoàn tiền 100% trong vòng 7
            ngày đầu tiên nếu bạn không hài lòng về dịch vụ. Sau 7 ngày, chúng
            tôi không hỗ trợ hoàn tiền.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "license",
    title: "4. Sở hữu trí tuệ",
    icon: Copyright,
    content: (
      <p>
        Toàn bộ nội dung trên SmartKids bao gồm: Video bài giảng, Hình ảnh, Âm
        thanh, Mã nguồn, Tài liệu PDF... đều thuộc quyền sở hữu trí tuệ của
        SmartKids hoặc các bên cấp phép. Bạn <strong>không được phép</strong>{" "}
        sao chép, phân phối, bán lại hoặc sử dụng cho mục đích thương mại mà
        không có sự đồng ý bằng văn bản.
      </p>
    ),
  },
  {
    id: "conduct",
    title: "5. Quy tắc ứng xử",
    icon: Ban,
    content: (
      <>
        <p className="mb-4">
          Khi tham gia cộng đồng SmartKids (Phòng Live, Bình luận), bạn cam kết:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700 font-medium">
            🚫 Không sử dụng ngôn từ thô tục, xúc phạm.
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700 font-medium">
            🚫 Không quấy rối, bắt nạt người dùng khác.
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700 font-medium">
            🚫 Không spam quảng cáo, link độc hại.
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700 font-medium">
            🚫 Không giả danh nhân viên SmartKids.
          </div>
        </div>
        <p className="mt-4 text-sm italic">
          Chúng tôi có quyền khóa tài khoản vĩnh viễn nếu bạn vi phạm các quy
          tắc này.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "6. Miễn trừ trách nhiệm",
    icon: ShieldAlert,
    content: (
      <p>
        SmartKids cung cấp nền tảng học tập "như hiện trạng". Chúng tôi nỗ lực
        đảm bảo hệ thống hoạt động ổn định 99.9%, nhưng không chịu trách nhiệm
        cho các gián đoạn do sự cố mạng diện rộng, thiên tai hoặc bảo trì hệ
        thống định kỳ (được thông báo trước).
      </p>
    ),
  },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      TERMS_SECTIONS.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* 1. HEADER HERO */}
      <div className="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full filter blur-[150px] opacity-20 animate-pulse"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-4 py-1.5 rounded-full text-purple-200 text-xs font-bold uppercase tracking-wider mb-6">
            <Scale size={14} /> Thỏa thuận người dùng
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Điều Khoản <span className="text-purple-400">Dịch Vụ</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng dịch vụ.
            Việc sử dụng SmartKids đồng nghĩa với việc bạn chấp nhận các quy
            định này.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- LEFT SIDEBAR (Mục lục) --- */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-4 border border-slate-100">
              <h3 className="font-bold text-slate-800 px-4 py-2 mb-2 uppercase text-xs tracking-wider text-slate-400">
                Nội dung chính
              </h3>
              <ul className="space-y-1">
                {TERMS_SECTIONS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                        activeSection === item.id
                          ? "bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-200"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${activeSection === item.id ? "bg-purple-500" : "bg-slate-300"}`}
                      ></div>
                      {item.title.split(". ")[1]}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-slate-100 px-4">
                <Link
                  href="/contact"
                  className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-3 rounded-xl text-sm font-bold transition shadow-lg shadow-slate-200"
                >
                  Liên hệ hỗ trợ
                </Link>
              </div>
            </div>
          </div>

          {/* --- RIGHT CONTENT (Chi tiết) --- */}
          <div className="lg:col-span-9 space-y-8">
            {TERMS_SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 scroll-mt-28"
              >
                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                    <section.icon size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {section.title}
                  </h2>
                </div>

                <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                  {section.content}
                </div>
              </motion.div>
            ))}

            {/* Accept Box */}
            <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Bạn có câu hỏi khác?
                </h3>
                <p className="text-slate-600 text-sm">
                  Nếu bạn cần giải thích thêm về bất kỳ điều khoản nào, vui lòng
                  liên hệ với bộ phận pháp lý.
                </p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200"
              >
                <HelpCircle size={18} /> Gửi câu hỏi <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
