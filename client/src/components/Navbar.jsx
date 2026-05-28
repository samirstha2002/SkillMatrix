import { GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />

          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            SkillMatrix
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm sm:text-lg overflow-hidden">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>

          {/* User Info */}
          <div className="hidden sm:block pr-3 border-r border-gray-200">
            <p className="font-medium text-gray-800">{user?.name || "User"}</p>

            <p className="text-sm text-gray-500 whitespace-nowrap">
              {user?.email}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 active:scale-[0.98] transition text-white px-3 sm:px-4 py-2 rounded-xl"
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
