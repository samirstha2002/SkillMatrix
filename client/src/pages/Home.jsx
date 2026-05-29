import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import { SearchIcon, SearchX, X, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Modal to pick which skill to offer
function SwapModal({ teacher, requestedSkill, mySkills, onConfirm, onClose }) {
  const [selected, setSelected] = useState(mySkills[0] || "");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Send Swap Request</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* To */}
        <p className="text-sm text-gray-500 mb-4">
          To:{" "}
          <span className="font-semibold text-gray-700">{teacher.name}</span>
        </p>

        {/* Skill they want to learn */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            You want to learn
          </p>
          <span className="inline-block bg-purple-50 text-purple-600 border border-purple-100 text-sm px-3 py-1.5 rounded-xl font-medium">
            {requestedSkill}
          </span>
        </div>

        {/* Skill to offer */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            You'll offer in return
          </p>

          {mySkills.length === 0 ? (
            <p className="text-sm text-amber-500">
              ⚠️ No skills in your profile.{" "}
              <a href="/profile" className="underline font-medium">
                Add skills
              </a>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {mySkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelected(skill)}
                  className={`text-sm px-3 py-1.5 rounded-xl border font-medium transition
                    ${
                      selected === skill
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exchange preview */}
        {selected && (
          <div className="flex items-center gap-2 mb-5 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
            <span className="text-sm text-blue-600 font-medium">
              {selected}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-purple-600 font-medium">
              {requestedSkill}
            </span>
          </div>
        )}

        {/* Confirm */}
        <button
          onClick={() => onConfirm(selected)}
          disabled={!selected}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold transition active:scale-[0.98]"
        >
          Send Request
        </button>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const [skill, setSkill] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalTeacher, setModalTeacher] = useState(null); // the user we're sending to

  const handleSearch = async (value = skill) => {
    if (!value.trim()) return;
    try {
      setLoading(true);
      const res = await API.get(`/match/teachers?skill=${value}`);
      setUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (skill.trim().length >= 3) handleSearch(skill);
      if (skill.trim().length === 0) setUsers([]);
    }, 500);
    return () => clearTimeout(delay);
  }, [skill]);

  // Called when user confirms from modal
  const sendRequest = async (offeredSkill) => {
    if (!offeredSkill) return;
    try {
      await API.post("/swap/send", {
        receiverId: modalTeacher._id,
        offeredSkill,
        requestedSkill: skill,
      });
      toast.success("Swap request sent!");
      setModalTeacher(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Swap Modal */}
      {modalTeacher && (
        <SwapModal
          teacher={modalTeacher}
          requestedSkill={skill}
          mySkills={user?.skillsOffered || []}
          onConfirm={sendRequest}
          onClose={() => setModalTeacher(null)}
        />
      )}

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Search Section */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Find Teachers</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="flex items-center flex-1 border rounded-xl px-4 py-3 bg-gray-50">
              <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search skills like React, Node.js..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
            <button
              onClick={() => handleSearch(skill)}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white px-6 py-3 rounded-xl font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {users.map((u) => (
            <div
              key={u._id}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                {u.name}
              </h3>
              <p className="text-gray-500 mt-1 break-words text-sm">
                {u.email}
              </p>

              {u.bio && (
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                  {u.bio}
                </p>
              )}

              <div className="mt-4">
                <p className="font-medium text-gray-700 text-sm">
                  Skills Offered
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {u.skillsOffered?.map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setModalTeacher(u)}
                className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition font-medium"
              >
                Send Swap Request
              </button>
            </div>
          ))}
        </div>

        {/* Empty States */}
        {!loading && users.length === 0 && !skill && (
          <div className="flex flex-col items-center justify-center mt-10 text-gray-500 py-10">
            <SearchX className="w-10 h-10 text-gray-400 mb-3" />
            Search a skill to find teachers
          </div>
        )}

        {!loading && users.length === 0 && skill && (
          <div className="flex flex-col items-center justify-center mt-10 text-gray-500 py-10">
            <SearchX className="w-10 h-10 text-gray-400 mb-3" />
            No teachers found for{" "}
            <span className="font-semibold ml-1">"{skill}"</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
