"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FacebookLegacyCallbackAliasPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const query = params.toString();
    router.replace(`/auth/facebook/callback${query ? `?${query}` : ""}`);
  }, [params, router]);

  return <div>Đang chuyển hướng đăng nhập Facebook...</div>;
}

