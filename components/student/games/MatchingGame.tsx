"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Sparkles } from "lucide-react";
import Confetti from "react-confetti";

export default function MatchingGame({ data, onFinish }: any) {
  // State lưu 2 danh sách riêng biệt
  const [leftItems, setLeftItems] = useState<any[]>([]);
  const [rightItems, setRightItems] = useState<any[]>([]);

  // State lưu ID của cặp đang được chọn
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);

  // State lưu danh sách các ID đã nối đúng
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongPair, setWrongPair] = useState(false); // Để tạo hiệu ứng rung khi sai

  useEffect(() => {
    // Data truyền vào chính là mảng pairs, không cần data.pairs
    // Xử lý contentA/B hoặc left/right
    const pairsArray = Array.isArray(data) ? data : data?.pairs || [];

    if (pairsArray.length > 0) {
      const itemsWithId = pairsArray.map((p: any, index: number) => ({
        uniqueId: `pair-${index}`, // ID dùng để khớp
        leftContent: p.contentA || p.left || "???", // Chuẩn hóa dữ liệu
        rightContent: p.contentB || p.right || "???",
      }));

      // Cột Trái: Giữ nguyên
      setLeftItems(itemsWithId);

      // Cột Phải: XÁO TRỘN
      const shuffledRight = [...itemsWithId].sort(() => Math.random() - 0.5);
      setRightItems(shuffledRight);
    }
  }, [data]);

  // Kiểm tra Logic Nối
  useEffect(() => {
    if (selectedLeftId && selectedRightId) {
      // So sánh ID gốc xem có khớp nhau không
      if (selectedLeftId === selectedRightId) {
        // --- ĐÚNG ---
        const newMatched = [...matchedIds, selectedLeftId];
        setMatchedIds(newMatched);
        setSelectedLeftId(null);
        setSelectedRightId(null);

        // Check Win
        if (newMatched.length === leftItems.length && leftItems.length > 0) {
          setIsCompleted(true);
          setTimeout(() => onFinish(true), 1500);
        }
      } else {
        // --- SAI ---
        setWrongPair(true);
        setTimeout(() => {
          setSelectedLeftId(null);
          setSelectedRightId(null);
          setWrongPair(false);
        }, 500);
      }
    }
  }, [selectedLeftId, selectedRightId]);

  // Helper để render nội dung (Text hoặc Ảnh)
  const renderContent = (content: string) => {
    if (!content) return null;
    // Check nếu là link ảnh/audio/video (đơn giản)
    const isMedia =
      content.startsWith("http") ||
      content.startsWith("blob") ||
      content.startsWith("/uploads");

    if (isMedia) {
      // Nếu là ảnh
      if (
        content.match(/\.(jpeg|jpg|gif|png)$/) != null ||
        content.includes("images")
      ) {
        return (
          <img
            src={content}
            alt="match"
            className="h-20 w-full object-contain"
          />
        );
      }
      // Nếu không xác định được, cứ hiện text cho an toàn
      return <span className="text-sm break-words">{content}</span>;
    }
    return <span className="text-lg font-bold">{content}</span>;
  };

  if (!leftItems.length)
    return <div className="text-center p-4">Đang tải dữ liệu nối từ...</div>;

  return (
    <div className="w-full h-full flex flex-col items-center">
      {isCompleted && <Confetti recycle={false} numberOfPieces={200} />}

      <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
        <Sparkles className="text-yellow-500" /> Nối cặp tương ứng
      </h3>

      <div className="flex gap-4 w-full justify-between max-w-4xl relative">
        {/* --- CỘT TRÁI (LEFT) --- */}
        <div className="flex-1 flex flex-col gap-3">
          {leftItems.map((item) => {
            const isMatched = matchedIds.includes(item.uniqueId);
            const isSelected = selectedLeftId === item.uniqueId;
            const isWrong = isSelected && wrongPair;

            return (
              <button
                key={`L-${item.uniqueId}`}
                onClick={() => !isMatched && setSelectedLeftId(item.uniqueId)}
                disabled={isMatched}
                className={`
                  relative p-4 rounded-xl border-2 font-bold transition-all h-24 flex items-center justify-center shadow-sm w-full
                  ${isMatched ? "bg-green-100 border-green-400 opacity-50 cursor-default" : "bg-white hover:scale-[1.02] active:scale-95"}
                  ${isSelected ? "border-blue-500 ring-2 ring-blue-200 z-10" : "border-slate-200"}
                  ${isWrong ? "bg-red-50 border-red-500 animate-shake" : ""}
                `}
              >
                {renderContent(item.leftContent)}

                {/* Dây nối ảo (Indicator) */}
                {isSelected && !isMatched && (
                  <div className="absolute -right-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
                {isMatched && (
                  <CheckCircle className="absolute top-1 right-1 text-green-600 w-5 h-5" />
                )}
              </button>
            );
          })}
        </div>

        {/* --- SVG LINE (Trang trí ở giữa - Tuỳ chọn) --- */}
        {/* <div className="w-8 flex items-center justify-center"></div> */}

        {/* --- CỘT PHẢI (RIGHT) --- */}
        <div className="flex-1 flex flex-col gap-3">
          {rightItems.map((item) => {
            const isMatched = matchedIds.includes(item.uniqueId);
            const isSelected = selectedRightId === item.uniqueId;
            const isWrong = isSelected && wrongPair;

            return (
              <button
                key={`R-${item.uniqueId}`}
                onClick={() => !isMatched && setSelectedRightId(item.uniqueId)}
                disabled={isMatched}
                className={`
                  relative p-4 rounded-xl border-2 font-bold transition-all h-24 flex items-center justify-center shadow-sm w-full
                  ${isMatched ? "bg-green-100 border-green-400 opacity-50 cursor-default" : "bg-white hover:scale-[1.02] active:scale-95"}
                  ${isSelected ? "border-purple-500 ring-2 ring-purple-200 z-10" : "border-slate-200"}
                  ${isWrong ? "bg-red-50 border-red-500 animate-shake" : ""}
                `}
              >
                {renderContent(item.rightContent)}

                {/* Dây nối ảo (Indicator) */}
                {isSelected && !isMatched && (
                  <div className="absolute -left-3 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                )}
                {isMatched && (
                  <CheckCircle className="absolute top-1 right-1 text-green-600 w-5 h-5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
