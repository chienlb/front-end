"use client";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

// Dữ liệu Pet mặc định
const DEFAULT_PET_URL =
  "https://lottie.host/56d2b45e-53c7-4585-b040-525997235555/default-dog.json";

interface Props {
  src?: string;
  className?: string;
  onError?: () => void; // 🔥 Thêm prop này
}

export default function LottiePet({ src, className, onError }: Props) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const fetchLottie = async () => {
      try {
        const url = src || DEFAULT_PET_URL;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Fetch failed");

        const json = await response.json();
        setAnimationData(json);
      } catch (error) {
        console.error("Lỗi tải Pet:", error);
        if (onError) onError(); // 🔥 Báo lỗi ra ngoài để component cha chuyển sang ảnh tĩnh
      }
    };

    if (src) fetchLottie();
  }, [src]);

  if (!animationData) return null;

  return (
    <div className={className}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}
