"use client";

import { useState, useEffect } from "react";
import { CheckCircle, RefreshCw, HelpCircle, Sparkles } from "lucide-react";
import Confetti from "react-confetti";

interface Props {
  data: {
    content?: string;
    pairs: {
      left?: string;
      right?: string;
      contentA?: string;
      contentB?: string;
      _id?: string;
    }[];
  };
  onFinish: (isCorrect: boolean) => void;
}

interface CardItem {
  uniqueId: string;
  matchId: string;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function FlashcardGame({ data, onFinish }: Props) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    initGame();
  }, [data]);

  const initGame = () => {
    if (!data || !data.pairs || data.pairs.length === 0) return;

    const gameCards: CardItem[] = [];

    data.pairs.forEach((pair, index) => {
      const content1 = pair.contentA || pair.left || "";
      const content2 = pair.contentB || pair.right || "";
      const pairId = pair._id || `pair-${index}`;

      gameCards.push({
        uniqueId: `${pairId}-${index}-1`,
        matchId: pairId,
        content: content1,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        uniqueId: `${pairId}-${index}-2`,
        matchId: pairId,
        content: content2,
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIsCompleted(false);
    setFlippedCards([]);
    setIsProcessing(false);
  };

  const handleCardClick = (clickedCard: CardItem) => {
    if (isProcessing || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map((c) =>
      c.uniqueId === clickedCard.uniqueId ? { ...c, isFlipped: true } : c,
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      checkMatch(newFlipped, newCards);
    }
  };

  const checkMatch = (currentFlipped: CardItem[], currentCards: CardItem[]) => {
    const [card1, card2] = currentFlipped;
    const isMatch = card1.matchId === card2.matchId;

    if (isMatch) {
      const matchedCards = currentCards.map((c) =>
        c.uniqueId === card1.uniqueId || c.uniqueId === card2.uniqueId
          ? { ...c, isMatched: true, isFlipped: true }
          : c,
      );
      setCards(matchedCards);
      setFlippedCards([]);
      setIsProcessing(false);

      if (matchedCards.every((c) => c.isMatched)) {
        setIsCompleted(true);
        setTimeout(() => onFinish(true), 1500);
      }
    } else {
      setTimeout(() => {
        const resetCards = currentCards.map((c) =>
          c.uniqueId === card1.uniqueId || c.uniqueId === card2.uniqueId
            ? { ...c, isFlipped: false }
            : c,
        );
        setCards(resetCards);
        setFlippedCards([]);
        setIsProcessing(false);
      }, 1000);
    }
  };

  if (!data?.pairs?.length)
    return <div className="text-center p-4">Đang tải dữ liệu game...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
        <Sparkles className="text-yellow-500" />
        {data.content ? data.content.trim() : "Tìm cặp hình giống nhau"}
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
        {cards.map((card) => (
          <div
            key={card.uniqueId}
            onClick={() => handleCardClick(card)}
            className="group relative h-28 sm:h-32 cursor-pointer [perspective:1000px]"
          >
            <div
              className={`w-full h-full duration-500 transition-all [transform-style:preserve-3d] relative rounded-xl shadow-md border-2
                ${card.isFlipped ? "[transform:rotateY(180deg)]" : ""} 
                ${
                  card.isMatched
                    ? "border-green-500" // Khi đúng: viền xanh lá
                    : "border-slate-200 hover:border-blue-300"
                }
              `}
            >
              {/* --- MẶT SAU (ÚP - MÀU XANH DƯƠNG) --- */}
              <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl flex items-center justify-center bg-blue-500 border-b-4 border-blue-700 hover:bg-blue-600 z-10">
                <HelpCircle className="text-white w-8 h-8 opacity-80" />
              </div>

              {/* --- MẶT TRƯỚC (NGỬA - HIỂN THỊ NỘI DUNG) --- */}
              <div
                className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl flex items-center justify-center p-2 text-center z-20
                  ${
                    card.isMatched
                      ? "bg-green-50 border-2 border-green-500" // Khi đúng: Nền xanh nhạt
                      : "bg-white" // Bình thường: Nền trắng
                  }
                `}
              >
                {/* 🔥 LUÔN HIỂN THỊ NỘI DUNG (DÙ ĐÚNG HAY SAI) */}
                <span
                  className={`font-bold text-sm sm:text-lg select-none break-words px-1
                    ${card.isMatched ? "text-green-700" : "text-slate-700"}
                  `}
                >
                  {card.content}
                </span>

                {/* Icon Check nhỏ ở góc khi đúng */}
                {card.isMatched && (
                  <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle className="text-green-600 w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={initGame}
        className="mt-8 flex items-center gap-2 text-gray-400 hover:text-blue-600 text-sm font-bold transition"
      >
        <RefreshCw size={16} /> Trộn lại bài
      </button>

      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <Confetti recycle={false} numberOfPieces={300} />
        </div>
      )}
    </div>
  );
}
