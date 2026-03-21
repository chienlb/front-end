"use client";

import { useEffect, useState } from "react";
import { DIALOG_OPEN_EVENT, type DialogPayload } from "@/utils/dialog";

export default function GlobalDialog() {
  const [queue, setQueue] = useState<DialogPayload[]>([]);
  const current = queue[0] || null;

  useEffect(() => {
    const onOpen = (event: Event) => {
      const custom = event as CustomEvent<DialogPayload>;
      if (!custom.detail) return;
      setQueue((prev) => [...prev, custom.detail]);
    };
    window.addEventListener(DIALOG_OPEN_EVENT, onOpen as EventListener);
    return () =>
      window.removeEventListener(DIALOG_OPEN_EVENT, onOpen as EventListener);
  }, []);

  const closeCurrent = () => {
    setQueue((prev) => prev.slice(1));
  };

  const onCancel = () => {
    if (!current) return;
    if (current.type === "confirm") {
      current.resolver(false);
    } else {
      current.resolver();
    }
    closeCurrent();
  };

  const onOk = () => {
    if (!current) return;
    if (current.type === "confirm") {
      current.resolver(true);
    } else {
      current.resolver();
    }
    closeCurrent();
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900">
            {current.title || "Thông báo"}
          </h3>
        </div>
        <div className="px-5 py-5 text-sm text-slate-700 whitespace-pre-wrap">
          {current.message}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          {current.type === "confirm" && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50"
            >
              Hủy
            </button>
          )}
          <button
            onClick={onOk}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
          >
            {current.type === "confirm" ? "Đồng ý" : "Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
}

