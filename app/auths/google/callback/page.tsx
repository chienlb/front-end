"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleLegacyCallbackAliasPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const query = params.toString();
    router.replace(`/auth/google/callback${query ? `?${query}` : ""}`);
  }, [params, router]);

  return <div>Đang chuyển hướng đăng nhập Google...</div>;
}

