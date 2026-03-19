"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic gửi mail
    alert("Cảm ơn ba mẹ đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-12 px-4 sm:px-6 lg:px-8">
      {/* 1. HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-blue-600 font-bold tracking-wider uppercase text-sm bg-blue-100 px-4 py-1 rounded-full">
          Liên hệ
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl md:text-5xl">
          Kết nối với <span className="text-blue-600">SmartKids</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Ba mẹ cần hỗ trợ tư vấn khóa học, kỹ thuật hay hợp tác?{" "}
          <br className="hidden md:block" />
          Đừng ngần ngại để lại lời nhắn, đội ngũ hỗ trợ sẽ phản hồi trong vòng
          24h.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* 2. LEFT SIDE: INFO & MAP */}
        <div className="space-y-8">
          {/* Info Cards Wrapper */}
          <div className="space-y-6">
            {/* Card 1: Address */}
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Địa chỉ trung tâm
                </h3>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Tầng 3, Tòa nhà TechTower, <br /> Số 123 Đường Cầu Giấy, Hà
                  Nội
                </p>
              </div>
            </div>

            {/* Card 2: Phone */}
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-green-100 text-green-600 rounded-full shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Hotline hỗ trợ
                </h3>
                <p className="text-slate-600 mt-1">
                  <span className="text-orange-500 font-bold text-xl">
                    1900 1234
                  </span>{" "}
                  (8:00 - 20:00)
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Zalo: 0912 345 678
                </p>
              </div>
            </div>

            {/* Card 3: Email */}
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Email</h3>
                <p className="text-slate-600 mt-1">hotro@smartkids.edu.vn</p>
                <p className="text-slate-600">hoptac@smartkids.edu.vn</p>
              </div>
            </div>
          </div>

          {/* GOOGLE MAP EMBED */}
          <div className="w-full h-80 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.78009371476336!3d21.02881188599828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86cece9ac1%3A0xa9bc04e04602dd31!2zVMOyYSBuaMOgIEZQVCBD4bqndSBHaeG6pXk!5e0!3m2!1svi!2s!4v1626246830303!5m2!1svi!2s" // Ví dụ map Cầu Giấy
              className="w-full h-full"
              allowFullScreen={true}
              loading="lazy"
              title="SmartKids Map"
              style={{ border: 0 }}
            ></iframe>
          </div>
        </div>

        {/* 3. RIGHT SIDE: CONTACT FORM */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-slate-100 sticky top-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Gửi tin nhắn{" "}
              <MessageSquare className="text-blue-500 fill-blue-100" />
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại ngay!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Họ tên phụ huynh
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200"
                placeholder="Ví dụ: Nguyễn Văn A"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Grid for Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder="0912..."
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email (nếu có)
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nội dung cần hỗ trợ
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 resize-none"
                placeholder="Ba mẹ cần tư vấn về lộ trình học cho bé lớp 1..."
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Gửi tin nhắn ngay <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
