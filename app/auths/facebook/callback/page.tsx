"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FacebookLegacyCallbackAliasContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const query = params.toString();
    router.replace(`/auth/facebook/callback${query ? `?${query}` : ""}`);
  }, [params, router]);

  return <div>Đang chuyển hướng đăng nhập Facebook...</div>;
}

export default function FacebookLegacyCallbackAliasPage() {
  return (
    <Suspense fallback={<div>Đang chuyển hướng đăng nhập Facebook...</div>}>
      <FacebookLegacyCallbackAliasContent />
    </Suspense>
  );
}

