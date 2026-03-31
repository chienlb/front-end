"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/student/Footer";
import Navbar from "@/components/student/Navbar";
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      const role = String(parsed?.role?.name || parsed?.role || "").trim().toLowerCase();
      if (!["student", "teacher", "admin"].includes(role)) {
        router.replace("/login");
        return;
      }
      setAuthorized(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div
      className="customer-wrapper relative font-sans"
      style={{ minHeight: "100vh", backgroundColor: "#f0f8ff" }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>{children}</main>

      <Footer />
    </div>
  );
}
