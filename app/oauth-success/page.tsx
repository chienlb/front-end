"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getRedirectByRole(role?: string): string {
  const normalized = (role || "").toUpperCase();
  if (normalized === "ADMIN") return "/admin";
  if (normalized === "TEACHER") return "/teacher";
  if (normalized === "PARENT") return "/parent";
  return "/";
}

const API_BASE_URL =
  "https://teach-english-3786e536fe68.herokuapp.com/api/v1";

function OAuthSuccessContent() {
  const params = useSearchParams();

  useEffect(() => {
    const hydrateProfileThenRedirect = async (
      accessToken: string,
      fallbackRole: string,
      fallbackUserId: string,
    ) => {
      try {
        const res = await fetch(`${API_BASE_URL}/auths/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (res.ok) {
          const json: any = await res.json();
          const profile =
            json?.data ??
            json?.user ??
            json ??
            null;

          if (profile && typeof profile === "object") {
            localStorage.setItem("currentUser", JSON.stringify(profile));
            const role =
              profile?.role || profile?.roleName || profile?.userRole || fallbackRole;
            window.location.replace(getRedirectByRole(role));
            return;
          }
        }
      } catch {
        // ignore and fallback below
      }

      // fallback nếu profile endpoint lỗi
      const fallbackUser = {
        _id: fallbackUserId || "",
        userId: fallbackUserId || "",
        role: String(fallbackRole || "STUDENT").toUpperCase(),
      };
      localStorage.setItem("currentUser", JSON.stringify(fallbackUser));
      window.location.replace(getRedirectByRole(fallbackRole));
    };

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userStr = params.get("user");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    let roleFromUser = "";
    let userIdFromToken = "";
    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("currentUser", JSON.stringify(user));
        roleFromUser =
          user?.role || user?.roleName || user?.userRole || "";
      } catch {
        // ignore malformed user payload
      }
    }

    // Fallback lấy role từ accessToken nếu backend chưa trả "user"
    const tokenPayload = accessToken ? decodeJwtPayload(accessToken) : null;
    const roleFromToken = tokenPayload?.role || "";
    userIdFromToken = tokenPayload?.userId || "";

    if (accessToken) {
      const role = roleFromUser || roleFromToken;
      void hydrateProfileThenRedirect(accessToken, role, userIdFromToken);
    } else {
      window.location.replace("/login");
    }
  }, [params]);

  return <div>Đang chuyển về trang chính...</div>;
}

export default function OAuthSuccess() {
  return (
    <Suspense fallback={<div>Đang chuyển về trang chính...</div>}>
      <OAuthSuccessContent />
    </Suspense>
  );
}