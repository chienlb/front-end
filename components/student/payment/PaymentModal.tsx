// "use client";
// import { X, CheckCircle, Copy } from "lucide-react";
// import { useState } from "react";

// export default function PaymentModal({
//   isOpen,
//   onClose,
//   transaction,
//   packName,
// }: any) {
//   if (!isOpen || !transaction) return null;

//   // Cấu hình tài khoản nhận tiền (Thay bằng số của bạn)
//   const BANK_ID = "MB"; // Ngân hàng MB (hoặc VCB, ACB...)
//   const ACCOUNT_NO = "0909123456"; // Số tài khoản
//   const ACCOUNT_NAME = "NGUYEN VAN A"; // Tên chủ TK

//   // Tạo link VietQR động
//   // Cú pháp: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>
//   const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${
//     transaction.amount
//   }&addInfo=${transaction._id}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
//         <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
//           <h3 className="font-bold text-lg">Thanh toán: {packName}</h3>
//           <button onClick={onClose}>
//             <X />
//           </button>
//         </div>

//         <div className="p-6 flex flex-col items-center text-center">
//           <p className="text-sm text-gray-500 mb-4">
//             Quét mã QR bên dưới bằng ứng dụng Ngân hàng hoặc MoMo
//           </p>

//           {/* QR CODE */}
//           <div className="border-2 border-blue-100 rounded-xl p-2 mb-4">
//             <img
//               src={qrUrl}
//               alt="VietQR"
//               className="w-64 h-64 object-contain"
//             />
//           </div>

//           <div className="bg-gray-50 p-3 rounded-lg w-full text-sm mb-4">
//             <div className="flex justify-between mb-1">
//               <span className="text-gray-500">Số tiền:</span>
//               <span className="font-bold text-blue-600 text-lg">
//                 {new Intl.NumberFormat("vi-VN").format(transaction.amount)}đ
//               </span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-500">Nội dung CK:</span>
//               <span className="font-mono font-bold bg-white px-2 py-1 border rounded flex items-center gap-2">
//                 {transaction._id} <Copy size={12} className="cursor-pointer" />
//               </span>
//             </div>
//           </div>

//           <p className="text-xs text-red-500 italic mb-4">
//             * Hệ thống sẽ tự động kích hoạt gói sau 1-5 phút khi nhận được tiền.
//           </p>

//           {/* Giả lập nút "Tôi đã chuyển tiền" để demo */}
//           <button
//             onClick={onClose}
//             className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
//           >
//             <CheckCircle size={20} /> Tôi đã chuyển khoản
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
