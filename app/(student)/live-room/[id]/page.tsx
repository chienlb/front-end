"use client";

import { useEffect, useState, use } from "react";
import {
  LiveKitRoom,
  VideoConference,
  PreJoin,
  LocalUserChoices,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft, Video, Mic } from "lucide-react";
import { liveClassService } from "@/services/live-class.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function LiveRoomPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const roomID = resolvedParams.id;

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loadingToken, setLoadingToken] = useState(true);

  // 🔥 State cho màn hình Pre-Join
  const [preJoinChoices, setPreJoinChoices] = useState<
    LocalUserChoices | undefined
  >(undefined);

  // 1. Fetch Token khi vào trang
  useEffect(() => {
    const fetchToken = async () => {
      if (!roomID) return;
      try {
        setLoadingToken(true);
        setError("");

        // Gọi API Backend lấy vé vào cửa
        const res: any = await liveClassService.joinRoom(roomID);
        const payload = res.data ? res.data : res;

        console.log(payload);

        if (payload && payload.token) {
          setToken(payload.token);
        } else {
          throw new Error("Không nhận được token hợp lệ.");
        }
      } catch (err: any) {
        console.error("Lỗi vào phòng:", err);
        const msg = err.response?.data?.message || "Không thể kết nối máy chủ.";
        setError(msg);
      } finally {
        setLoadingToken(false);
      }
    };
    fetchToken();
  }, [roomID]);

  // --- MÀN HÌNH 1: LOADING TOKEN ---
  if (loadingToken) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
        <p className="font-medium animate-pulse text-slate-300">
          Đang kết nối tới lớp học...
        </p>
      </div>
    );
  }

  // --- MÀN HÌNH 2: LỖI ---
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Không thể vào lớp
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH 3: PRE-JOIN (CHECK CAM/MIC) ---
  // Nếu chưa chọn thiết bị xong (preJoinChoices = undefined) thì hiện màn hình này
  if (!preJoinChoices) {
    return (
      <div
        className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center"
        data-lk-theme="default"
      >
        <div className="max-w-4xl w-full p-4">
          <h1 className="text-white text-2xl font-bold text-center mb-2">
            Chuẩn bị vào lớp
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Hãy kiểm tra Camera và Micro của bạn trước khi tham gia.
          </p>

          {/* Component PreJoin có sẵn của LiveKit - Rất xịn */}
          <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
            <PreJoin
              onError={(err) => console.error("PreJoin error:", err)}
              defaults={{
                audioDeviceId: "",
                videoDeviceId: "",
                audioEnabled: true,
                videoEnabled: true,
              }}
              onSubmit={(values) => {
                console.log("Người dùng đã chọn:", values);
                setPreJoinChoices(values); // Lưu lựa chọn -> Chuyển sang màn hình Live
              }}
            />
          </div>

          <button
            onClick={() => router.back()}
            className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH 4: LIVE ROOM (HỌC CHÍNH THỨC) ---
  return (
    <div className="h-screen w-full bg-black" data-lk-theme="default">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        // 🔥 Truyền cấu hình User vừa chọn ở PreJoin vào đây
        video={preJoinChoices.videoEnabled}
        audio={preJoinChoices.audioEnabled}
        onDisconnected={() => {
          // Khi rời phòng -> Quay lại trang chi tiết lớp học để xem bài tập/record
          router.push(`/my-classes/${roomID}`);
        }}
        onError={(err) => console.error("LiveKit Error:", err)}
        className="h-full"
      >
        {/* Giao diện chính của buổi học */}
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
