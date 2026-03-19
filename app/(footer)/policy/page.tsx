"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Globe,
  Bell,
  Cookie,
  Mail,
  ArrowRight,
  Menu,
} from "lucide-react";
import Link from "next/link";

// --- DỮ LIỆU CHÍNH SÁCH ---
const SECTIONS = [
  {
    id: "collect",
    title: "1. Thu thập thông tin",
    icon: FileText,
    content: (
      <>
        <p className="mb-4">
          Chúng tôi thu thập thông tin để cung cấp các dịch vụ tốt hơn cho tất
          cả người dùng. Các loại thông tin bao gồm:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>
            <strong>Thông tin bạn cung cấp:</strong> Khi đăng ký tài khoản (Họ
            tên, Email, Số điện thoại, Độ tuổi của bé).
          </li>
          <li>
            <strong>Dữ liệu học tập:</strong> Tiến độ bài học, điểm số, và các
            tương tác trong ứng dụng để cá nhân hóa lộ trình.
          </li>
          <li>
            <strong>Thông tin thiết bị:</strong> Dòng máy, hệ điều hành, địa chỉ
            IP để đảm bảo an ninh và tương thích.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "2. Sử dụng thông tin",
    icon: UserCheck,
    content: (
      <>
        <p className="mb-4">
          SmartKids cam kết chỉ sử dụng thông tin của bạn cho các mục đích chính
          đáng sau:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Cung cấp, duy trì và cải thiện các dịch vụ giáo dục.</li>
          <li>
            Gửi thông báo về lộ trình học tập, báo cáo kết quả của bé cho phụ
            huynh.
          </li>
          <li>
            Phát hiện và ngăn chặn các hành vi gian lận hoặc truy cập trái phép.
          </li>
          <li>Hỗ trợ kỹ thuật và giải đáp thắc mắc khách hàng.</li>
        </ul>
      </>
    ),
  },
  {
    id: "share",
    title: "3. Chia sẻ thông tin",
    icon: Globe,
    content: (
      <>
        <p className="mb-4">
          Chúng tôi{" "}
          <strong className="text-red-500">tuyệt đối không bán</strong> thông
          tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin
          trong các trường hợp hãn hữu:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>Có sự đồng ý rõ ràng của bạn.</li>
          <li>
            Cho các đối tác xử lý dữ liệu tin cậy (VD: Server AWS, Cổng thanh
            toán) tuân thủ nghiêm ngặt quy định bảo mật của chúng tôi.
          </li>
          <li>Khi có yêu cầu pháp lý từ cơ quan nhà nước có thẩm quyền.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "4. Bảo mật dữ liệu",
    icon: Lock,
    content: (
      <>
        <p className="mb-4">
          Chúng tôi nỗ lực làm việc để bảo vệ SmartKids và người dùng khỏi hành
          vi truy cập trái phép:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>
            Sử dụng mã hóa <strong>SSL/TLS</strong> cho toàn bộ dữ liệu truyền
            tải.
          </li>
          <li>
            Hệ thống máy chủ được bảo vệ bởi tường lửa và các lớp bảo mật đa
            tầng.
          </li>
          <li>
            Kiểm soát nghiêm ngặt quyền truy cập dữ liệu nội bộ của nhân viên.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "5. Cookies & Tracking",
    icon: Cookie,
    content: (
      <p>
        Chúng tôi sử dụng Cookies để ghi nhớ trạng thái đăng nhập và các tùy
        chọn hiển thị của bạn. Bạn có thể tắt Cookies trong cài đặt trình duyệt,
        nhưng điều này có thể ảnh hưởng đến trải nghiệm sử dụng website.
      </p>
    ),
  },
  {
    id: "children",
    title: "6. Quyền riêng tư trẻ em",
    icon: Shield,
    content: (
      <p>
        SmartKids tuân thủ nghiêm ngặt các quy định về bảo vệ trẻ em trên không
        gian mạng. Chúng tôi không thu thập thông tin cá nhân từ trẻ em dưới 13
        tuổi mà không có sự đồng ý xác thực của cha mẹ hoặc người giám hộ.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("collect");

  // Scroll Spy Logic (Tự động highlight mục lục khi cuộn)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset

      SECTIONS.forEach((section) => {
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
        top: element.offsetTop - 120, // Trừ đi chiều cao header
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* 1. HEADER HERO */}
      <div className="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 rounded-full text-blue-200 text-xs font-bold uppercase tracking-wider mb-6">
            <Shield size={14} /> SmartKids Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Chính Sách & <span className="text-blue-400">Bảo Mật</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Chúng tôi hiểu rằng sự riêng tư là vô cùng quan trọng đối với gia
            đình bạn. SmartKids cam kết minh bạch về cách chúng tôi thu thập, sử
            dụng và bảo vệ thông tin.
          </p>
          <div className="mt-8 text-sm font-medium text-slate-500">
            Cập nhật lần cuối:{" "}
            <span className="text-slate-300">24/01/2026</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT LAYOUT */}
      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- LEFT SIDEBAR (Sticky Navigation) --- */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-4 border border-slate-100">
              <h3 className="font-bold text-slate-800 px-4 py-2 mb-2 flex items-center gap-2">
                <Menu size={18} /> Mục lục
              </h3>
              <ul className="space-y-1">
                {SECTIONS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-200"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <item.icon
                        size={16}
                        className={
                          activeSection === item.id
                            ? "text-blue-500"
                            : "text-slate-400"
                        }
                      />
                      {item.title.split(". ")[1]} {/* Lấy tên ngắn gọn */}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-slate-100 px-4">
                <p className="text-xs text-slate-400 mb-3">Bạn có thắc mắc?</p>
                <Link
                  href="/contact"
                  className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  Liên hệ ngay <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* --- RIGHT CONTENT (Policy Details) --- */}
          <div className="lg:col-span-9 space-y-8">
            {SECTIONS.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 scroll-mt-28"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
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

            {/* Contact Box */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">
                  Vẫn còn điều chưa rõ?
                </h3>
                <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                  Đội ngũ pháp lý và hỗ trợ của chúng tôi luôn sẵn sàng giải đáp
                  mọi thắc mắc về dữ liệu của bạn.
                </p>
                <Link
                  href="mailto:privacy@smartkids.edu.vn"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
                >
                  <Mail size={18} /> Gửi Email cho chúng tôi
                </Link>
              </div>
              {/* Decor */}
              <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
