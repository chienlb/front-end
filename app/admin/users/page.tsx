"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Gamepad2,
  TrendingUp,
  Gift,
  Lock,
  Eye,
  Ban,
  Loader2,
} from "lucide-react";
import { userService } from "@/services/user.service";

export default function UserManagementPage() {
  // State
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("STUDENT");

  // 1. Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await userService.getUsers({
        search: searchTerm,
        page,
        role: filter === "ALL" ? undefined : filter,
      });
      setUsers(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, page, filter]);

  // 2. Actions
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (
      !confirm(
        currentStatus
          ? "Bạn muốn khóa tài khoản này?"
          : "Mở khóa tài khoản này?",
      )
    )
      return;
    try {
      await userService.updateStatus(id, !currentStatus);
      fetchUsers(); // Refresh lại
    } catch (e) {
      alert("Lỗi cập nhật!");
    }
  };

  const handleGift = async (id: string) => {
    const gold = prompt("Nhập số vàng muốn tặng:");
    if (!gold) return;
    try {
      await userService.giveGift(id, { gold: parseInt(gold), diamond: 0 });
      alert("Đã tặng quà thành công! 🎁");
      fetchUsers();
    } catch (e) {
      alert("Lỗi tặng quà!");
    }
  };
  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* 1. HEADER & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">
              Tổng học viên
            </p>
            <h3 className="text-2xl font-bold text-slate-800">12,540</h3>
          </div>
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Gamepad2 />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">
              Tài khoản PRO
            </p>
            <h3 className="text-2xl font-bold text-slate-800">856</h3>
          </div>
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
            <TrendingUp />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">
              Online hôm nay
            </p>
            <h3 className="text-2xl font-bold text-slate-800">1,203</h3>
          </div>
          <div className="bg-green-100 text-green-600 p-3 rounded-lg">
            <Eye />
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm tên, email..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-80 focus:outline-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-4 text-sm bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="STUDENT">Học viên</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="ALL">Tất cả</option>
          </select>
        </div>
      </div>

      {/* 3. TABLE */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center h-64 items-center">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">Thông tin Học viên</th>
                  <th className="p-4">Liên hệ</th>
                  <th className="p-4">Tiến độ Game</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-blue-50/30 transition group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || "https://via.placeholder.com/40"}
                          className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-800">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.studentId} • {user.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 text-xs">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                          Lv.{user.stats?.level || 1}
                        </span>
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">
                          🟡 {user.stats?.gold || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleGift(user._id)}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
                          title="Tặng quà"
                        >
                          <Gift size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(user._id, user.isActive)
                          }
                          className={`p-2 rounded-lg ${
                            user.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {user.isActive ? (
                            <Ban size={16} />
                          ) : (
                            <Lock size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 text-xs font-bold text-gray-500 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Trước
          </button>
          <span>Trang {page}</span>
          <button
            disabled={users.length < 10}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
