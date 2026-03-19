"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PhanHoiRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/feedback");
  }, [router]);
  return null;
}

