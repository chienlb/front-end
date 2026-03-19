"use client";
import { useState } from "react";
import {
  MoreVertical,
  UserPlus,
  Search,
  Mail,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import InviteUserModal from "./InviteUserModal";

// --- TYPES & MOCK DATA ---
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: "TEACHER" | "STUDENT";
}

const INITIAL_TEACHERS: User[] = [
  {
    id: 101,
    name: "Cô Minh Anh",
    email: "minhanh@school.edu",
    role: "TEACHER",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
];

const INITIAL_STUDENTS: User[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    role: "STUDENT",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@gmail.com",
    role: "STUDENT",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

interface TabPeopleProps {
  readonly?: boolean; // Prop để xác định chế độ xem (Giáo viên vs Học sinh)
}

export default function TabPeople({ readonly = false }: TabPeopleProps) {
  const [teachers, setTeachers] = useState<User[]>(INITIAL_TEACHERS);
  const [students, setStudents] = useState<User[]>(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"TEACHER" | "STUDENT">("STUDENT");

  // --- HANDLERS ---
  const openInviteModal = (role: "TEACHER" | "STUDENT") => {
    setModalRole(role);
    setIsModalOpen(true);
  };

  const handleAddUser = (name: string, email: string) => {
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role: modalRole,
    };
    if (modalRole === "TEACHER") {
      setTeachers([...teachers, newUser]);
    } else {
      setStudents([...students, newUser]);
    }
  };

  const handleRemove = (id: number, role: "TEACHER" | "STUDENT") => {
    if (confirm("Bạn chắc chắn muốn xóa người này khỏi lớp?")) {
      if (role === "TEACHER") {
        setTeachers(teachers.filter((t) => t.id !== id));
      } else {
        setStudents(students.filter((s) => s.id !== id));
      }
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* --- SECTION: GIÁO VIÊN --- */}
      <div>
        <div className="flex justify-between items-end border-b border-blue-200 pb-4 mb-4">
          <h2 className="text-3xl font-bold text-blue-600">Giáo viên</h2>
          {/* 1. Chỉ hiện nút thêm nếu KHÔNG phải readonly */}
          {!readonly && (
            <button
              onClick={() => openInviteModal("TEACHER")}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
              title="Mời giáo viên"
            >
              <UserPlus size={24} />
            </button>
          )}
        </div>
        <div className="space-y-1">
          {teachers.map((teacher) => (
            <PersonItem
              key={teacher.id}
              user={teacher}
              readonly={readonly} // Truyền readonly xuống
              onRemove={() => handleRemove(teacher.id, "TEACHER")}
            />
          ))}
        </div>
      </div>

      {/* --- SECTION: HỌC SINH --- */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-blue-200 pb-4 mb-4 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-3xl font-bold text-blue-600">Học sinh</h2>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {students.length} học viên
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="Tìm học viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* 2. Chỉ hiện nút thêm nếu KHÔNG phải readonly */}
            {!readonly && (
              <button
                onClick={() => openInviteModal("STUDENT")}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                title="Mời học viên"
              >
                <UserPlus size={24} />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((st) => (
              <PersonItem
                key={st.id}
                user={st}
                readonly={readonly} // Truyền readonly xuống
                onRemove={() => handleRemove(st.id, "STUDENT")}
              />
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 italic">
              Không tìm thấy học viên nào.
            </div>
          )}
        </div>
      </div>

      {/* 3. Chỉ render Modal nếu KHÔNG phải readonly */}
      {!readonly && (
        <InviteUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          role={modalRole}
          onSubmit={handleAddUser}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: PersonItem ---
interface PersonItemProps {
  user: User;
  onRemove: () => void;
  readonly: boolean;
}

function PersonItem({ user, onRemove, readonly }: PersonItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-50 last:border-none hover:bg-slate-50 transition group">
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <img
            src={user.avatar}
            className="w-10 h-10 rounded-full border border-slate-200 object-cover"
            alt={user.name}
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              user.role === "TEACHER" ? "bg-blue-600" : "bg-orange-500"
            }`}
          >
            {user.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-bold text-slate-700 flex items-center gap-2">
            {user.name}
            {user.role === "TEACHER" && (
              <ShieldCheck size={14} className="text-blue-500" />
            )}
          </div>
          <div className="text-xs text-slate-400 font-medium">{user.email}</div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
          title="Gửi Email"
        >
          <Mail size={18} />
        </button>

        {/* 4. Ẩn nút Xóa và Menu nếu là readonly */}
        {!readonly && (
          <>
            <button
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              onClick={onRemove}
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 rounded-full transition">
              <MoreVertical size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
