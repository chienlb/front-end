"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FacebookCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userStr = params.get("user");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("currentUser", JSON.stringify(user));
      } catch {
        // ignore malformed user payload
      }
    }

    if (accessToken) {
      router.replace("/");
      return;
    }

    const query = params.toString();
    if (query) {
      router.replace(`/oauth-success?${query}`);
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return <div>Đang đăng nhập bằng Facebook...</div>;
}

export default function FacebookCallback() {
  return (
    <Suspense fallback={<div>Đang đăng nhập bằng Facebook...</div>}>
      <FacebookCallbackContent />
    </Suspense>
  );
}

