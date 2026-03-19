"use client";

import Link from "next/link";
import {
  Facebook,
  Youtube,
  Instagram,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 font-sans border-t-4 border-blue-600">
      {/* 1. TOP SECTION */}
      <div className="container mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* --- CỘT 1: LOGO & GIỚI THIỆU --- */}
          <div className="space-y-6">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3 group w-fit">
              {/* Icon Box */}
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50 group-hover:bg-blue-600 transition-colors">
                <GraduationCap size={22} strokeWidth={2.5} />
              </div>
              {/* Text Brand */}
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                  SmartKids
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Education System
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400">
              Nền tảng giáo dục tiếng Anh trực tuyến hàng đầu, áp dụng phương
              pháp Gamification tiên tiến giúp trẻ em phát triển tư duy ngôn ngữ
              tự nhiên và hiệu quả.
            </p>

            <div className="flex gap-4">
              <SocialIcon href="#" icon={<Facebook size={18} />} />
              <SocialIcon href="#" icon={<Youtube size={18} />} />
              <SocialIcon href="#" icon={<Instagram size={18} />} />
            </div>
          </div>

          {/* CỘT 2: LIÊN KẾT NHANH */}
          <div>
            <h3 className="text-white font-bold text-base mb-6 uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">
              Chương Trình Học
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/live-tutors" label="Tiếng Anh Lớp 1" />
              <FooterLink href="/live-tutors" label="Tiếng Anh Lớp 2" />
              <FooterLink href="/live-tutors" label="Tiếng Anh Lớp 3" />
              <FooterLink
                href="/live-tutors"
                label="Luyện Âm Chuẩn (Phonics)"
              />
              <FooterLink href="/live-tutors" label="Luyện Thi Cambridge" />
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h3 className="text-white font-bold text-base mb-6 uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/guide" label="Hướng dẫn kích hoạt khóa học" />
              <FooterLink href="/faq" label="Câu hỏi thường gặp (FAQ)" />
              <FooterLink href="/reviews" label="Blog & Cộng đồng phụ huynh" />
              <FooterLink href="/blogs" label="Blog & Tin tức" />
              <FooterLink href="/policy" label="Chính sách bảo mật" />
              <FooterLink href="/terms" label="Điều khoản dịch vụ" />
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ */}
          <div>
            <h3 className="text-white font-bold text-base mb-6 uppercase tracking-wider border-b border-gray-700 pb-2 inline-block">
              Liên Hệ
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <span className="text-gray-400">
                  Tầng 5, Tòa nhà TechTower, Số 15 Lê Văn Lương, Hà Nội, Việt
                  Nam.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-blue-500 shrink-0" size={18} />
                <a
                  href="tel:19001234"
                  className="hover:text-white transition text-gray-400"
                >
                  Hotline:{" "}
                  <span className="text-white font-semibold">1900 1234</span>{" "}
                  (8:00 - 18:00)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-blue-500 shrink-0" size={18} />
                <a
                  href="mailto:contact@smartkids.vn"
                  className="hover:text-white transition text-gray-400"
                >
                  contact@smartkids.vn
                </a>
              </li>
            </ul>

            {/* Trust Badge */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-800/50 p-3 rounded border border-gray-800">
              <ShieldCheck size={16} className="text-green-500" />
              <span>Website được bảo mật bởi SSL.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM BAR */}
      <div className="bg-gray-950 py-6 border-t border-gray-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2024 SmartKids English Center. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/sitemap" className="hover:text-blue-400 transition">
              Sitemap
            </Link>
            <Link href="/privacy" className="hover:text-blue-400 transition">
              Privacy Policy
            </Link>
            <Link href="/cookie" className="hover:text-blue-400 transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- SUB COMPONENTS ---

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <Link
      href={href}
      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
    >
      <ChevronRight
        size={14}
        className="text-gray-600 group-hover:text-blue-500 transition-colors"
      />
      {label}
    </Link>
  </li>
);

const SocialIcon = ({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) => (
  <a
    href={href}
    className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1"
  >
    {icon}
  </a>
);
