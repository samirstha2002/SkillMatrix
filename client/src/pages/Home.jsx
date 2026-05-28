import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import { SearchIcon, SearchX } from "lucide-react";

function Home() {
  const [skill, setSkill] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search users
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

  // 🔥 Auto search after 3 letters (with debounce)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (skill.trim().length >= 3) {
        handleSearch(skill);
      }

      if (skill.trim().length === 0) {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [skill]);

  // Send swap request
  const sendRequest = async (receiverId) => {
    try {
      await API.post("/swap/send", {
        receiverId,
        offeredSkill: "JavaScript",
        requestedSkill: skill,
      });

      toast.success("Swap request sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Search Section */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Find Teachers</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Input */}
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

            {/* Button (still useful) */}
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
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                {user.name}
              </h3>

              <p className="text-gray-500 mt-1 break-words">{user.email}</p>

              {/* Skills */}
              <div className="mt-4">
                <p className="font-medium text-gray-700">Skills Offered</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {user.skillsOffered?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => sendRequest(user._id)}
                className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition"
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
            <span className="font-semibold">"{skill}"</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
