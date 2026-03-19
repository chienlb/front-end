"use client";
import FloatingElement from "./FloatingElement";
import { Rocket, Book, Star, Music, Palette } from "lucide-react";

export default function GameBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 bg-gradient-to-b from-sky-200 via-purple-100 to-white">
      {/* --- LỚP 1: BẦU TRỜI & THIÊN NHIÊN --- */}

      {/* Mặt trời vui vẻ */}
      <FloatingElement x="85%" y="5%" duration={8}>
        <div className="w-32 h-32 bg-yellow-300 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(253,224,71,0.6)]">
          <span className="text-6xl animate-pulse">☀️</span>
        </div>
      </FloatingElement>

      {/* Mây trôi (Chế độ float) */}
      <div className="absolute top-20 w-full h-full opacity-60">
        <FloatingElement y="10%" duration={15} float delay={0}>
          <CloudSVG scale={1.2} />
        </FloatingElement>
        <FloatingElement y="30%" duration={20} float delay={5}>
          <CloudSVG scale={0.8} />
        </FloatingElement>
        <FloatingElement y="50%" duration={18} float delay={10}>
          <CloudSVG scale={1} />
        </FloatingElement>
      </div>

      {/* --- LỚP 2: VẬT PHẨM GIÁO DỤC BAY (Rõ ràng & Cute) --- */}

      {/* Tên lửa tri thức (Góc trái) */}
      <FloatingElement x="10%" y="20%" rotate={-15} duration={6}>
        <div className="bg-white/60 p-4 rounded-3xl backdrop-blur-sm border border-white shadow-lg text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto">
            <Rocket size={40} className="text-orange-500" />
          </div>
          <span className="text-xs font-bold text-orange-400">Khám phá</span>
        </div>
      </FloatingElement>

      {/* Sách phép thuật (Góc phải dưới) */}
      <FloatingElement x="80%" y="60%" rotate={10} duration={7} delay={1}>
        <div className="bg-white/60 p-4 rounded-3xl backdrop-blur-sm border border-white shadow-lg text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-2 mx-auto">
            <Book size={40} className="text-blue-500" />
          </div>
          <span className="text-xs font-bold text-blue-400">Từ vựng</span>
        </div>
      </FloatingElement>

      {/* Bảng màu nghệ thuật (Góc trái dưới) */}
      <FloatingElement x="5%" y="65%" rotate={-10} duration={8} delay={2}>
        <div className="text-6xl drop-shadow-xl filter opacity-80">🎨</div>
      </FloatingElement>

      {/* --- LỚP 3: CÁC YẾU TỐ VUI NHỘN (Trang trí) --- */}

      {/* Cầu vồng mờ */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] border-[40px] border-t-pink-200/40 border-r-transparent border-l-transparent border-b-transparent rounded-full pointer-events-none"></div>

      {/* Các ngôi sao nhỏ lấp lánh */}
      <FloatingElement x="20%" y="15%" duration={4}>
        <Star size={24} className="text-yellow-400 fill-yellow-200" />
      </FloatingElement>
      <FloatingElement x="60%" y="10%" duration={5} delay={1}>
        <Star size={32} className="text-yellow-400 fill-yellow-200" />
      </FloatingElement>
      <FloatingElement x="90%" y="30%" duration={3} delay={2}>
        <Star size={20} className="text-yellow-400 fill-yellow-200" />
      </FloatingElement>

      {/* --- LỚP 4: ĐỊA HÌNH (Tạo cảm giác thế giới) --- */}
      {/* Đồi núi vector ở đáy */}
      <div className="absolute bottom-0 left-0 w-full leading-none">
        <svg
          className="w-full h-auto"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#E0F2FE"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-full leading-none opacity-50">
        <svg
          className="w-full h-auto"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#C7D2FE"
            fillOpacity="1"
            d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,160C672,149,768,171,864,197.3C960,224,1056,256,1152,245.3C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

// SVG Đám mây
const CloudSVG = ({ scale = 1 }) => (
  <div style={{ transform: `scale(${scale})` }} className="opacity-80">
    <svg
      width="200"
      height="120"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md"
    >
      <path
        d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.405,0.044-0.799,0.126-1.181c-0.27-0.034-0.545-0.054-0.826-0.054
      c-2.671,0-4.98,1.603-5.992,3.876C5.129,16.059,5.066,16.057,5,16.057c-2.481,0-4.5,2.019-4.5,4.5s2.019,4.5,4.5,4.5h12.5
      c3.037,0,5.5-2.463,5.5-5.5S20.537,19,17.5,19z"
      />
    </svg>
  </div>
);
