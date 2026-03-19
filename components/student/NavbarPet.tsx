"use client";
import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Lottie from "lottie-react";
import dragonAnimation from "@/public/lottie/Cute Doggie.json";

export default function NavbarPet() {
  const controls = useAnimation();

  const startJourney = async () => {
    if (typeof window === "undefined") return;
    const screenWidth = window.innerWidth;

    // 1. Reset vị trí (Ẩn bên trái màn hình)
    await controls.set({ x: -150, opacity: 1 });

    // 2. Đi bộ thẳng một mạch sang bên phải
    await controls.start({
      x: screenWidth + 150, // Đi lố qua màn hình phải một chút để khuất hẳn
      transition: {
        duration: 25, // Tốc độ chậm rãi (25 giây)
        ease: "linear", // Đi đều bước
      },
    });

    // 3. Reset và lặp lại sau 3 giây nghỉ
    await controls.set({ opacity: 0 });
    setTimeout(() => startJourney(), 3000);
  };

  useEffect(() => {
    startJourney();
    const handleResize = () => {
      controls.stop();
      startJourney();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div
      animate={controls}
      // fixed: Dính chặt màn hình
      // top-[-45px]: Kéo lên trên một chút để chân chó khớp với mép dưới Navbar
      // z-[101]: Nổi lên trên Navbar
      className="fixed top-[5px] left-0 z-[101] pointer-events-none"
      style={{ width: "140px", height: "140px" }}
    >
      <motion.div
        // Hiệu ứng nhún nhảy nhẹ khi đi
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
        // scale-x-[-1]: Lật ngược ảnh để chó quay mặt sang phải
        className="w-full h-full transform scale-x-[-1]"
      >
        <Lottie animationData={dragonAnimation} loop={true} autoplay={true} />
      </motion.div>
    </motion.div>
  );
}
