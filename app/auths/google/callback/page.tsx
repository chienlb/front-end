"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleLegacyCallbackAliasContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const query = params.toString();
    router.replace(`/auth/google/callback${query ? `?${query}` : ""}`);
  }, [params, router]);

  return <div>Đang chuyển hướng đăng nhập Google...</div>;
}

export default function GoogleLegacyCallbackAliasPage() {
  return (
    <Suspense fallback={<div>Đang chuyển hướng đăng nhập Google...</div>}>
      <GoogleLegacyCallbackAliasContent />
    </Suspense>
  );
}

