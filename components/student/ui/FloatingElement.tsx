"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: string | number;
  y?: string | number;
  className?: string;
  rotate?: number;
  scale?: number;
  float?: boolean; // Chế độ trôi ngang (như mây)
}

export default function FloatingElement({
  children,
  delay = 0,
  duration = 6,
  x = 0,
  y = 0,
  rotate = 0,
  scale = 1,
  float = false,
  className,
}: Props) {
  // Animation cấu hình
  const variants = {
    // Bay lên xuống tại chỗ (cho vật phẩm)
    hover: {
      y: [0, -20, 0],
      rotate: [rotate, rotate + 5, rotate - 5, rotate],
      scale: [scale, scale * 1.05, scale],
      transition: {
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      },
    },
    // Trôi ngang màn hình (cho mây, chim)
    drift: {
      x: ["-10%", "110%"], // Bay từ trái qua phải màn hình
      transition: {
        duration: duration * 5, // Trôi rất chậm
        repeat: Infinity,
        ease: "linear",
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      className={`absolute select-none pointer-events-none ${className}`}
      initial={{ x, y, rotate, scale, opacity: 0 }}
      animate={float ? "drift" : "hover"}
      variants={variants}
      whileInView={{ opacity: 1 }} // Hiện ra khi nhìn thấy
      style={{ left: float ? 0 : x, top: y, zIndex: 0 }}
    >
      {children}
    </motion.div>
  );
}
