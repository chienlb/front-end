"use client";

import Footer from "@/components/student/Footer";
import Navbar from "@/components/student/Navbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
