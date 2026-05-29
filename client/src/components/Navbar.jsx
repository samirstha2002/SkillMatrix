import { GraduationCap, LogOut, Bell, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../App";

const typeIcon = (type) => {
  if (type === "swap_request") return "🔔";
  if (type === "swap_accepted") return "🎉";
  if (type === "swap_rejected") return "❌";
  return "📬";
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, removeNotification, clearNotifications } =
    useNotifications();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarColors = [
    "bg-rose-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-emerald-400",
    "bg-teal-400",
    "bg-cyan-400",
    "bg-blue-400",
    "bg-violet-400",
    "bg-pink-400",
  ];
  const avatarColor =
    avatarColors[(user?.name?.charCodeAt(0) || 0) % avatarColors.length];
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <nav className="bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold">SkillMatrix</h1>
        </div>

        {/* CENTER MENU */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/chat" className="hover:text-blue-600 transition">
            Chats
          </Link>
          <Link to="/requests" className="hover:text-blue-600 transition">
            Requests
          </Link>
          <Link to="/profile" className="hover:text-blue-600 transition">
            Profile
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* NOTIFICATION BELL */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="relative p-1 rounded-full hover:bg-gray-100 transition"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <p className="font-semibold text-gray-800 text-sm">
                    Notifications
                    {notifications.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </p>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.requestId}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition group"
                      >
                        <span className="text-lg mt-0.5 shrink-0">
                          {typeIcon(n.type)}
                        </span>
                        <p className="text-sm text-gray-700 flex-1 leading-snug">
                          {n.message}
                        </p>
                        <button
                          onClick={() => removeNotification(n.requestId)}
                          className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AVATAR — clickable, goes to profile */}
          <Link to="/profile" className="flex items-center gap-2 group">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition"
              />
            ) : (
              <div
                className={`w-9 h-9 ${avatarColor} rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition`}
              >
                {initials}
              </div>
            )}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-xs text-gray-400 truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
          </Link>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
