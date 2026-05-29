import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setProfile(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

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
    avatarColors[(profile?.name?.charCodeAt(0) || 0) % avatarColors.length];
  const initials =
    profile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !profile ? (
          <div className="text-center py-20 text-gray-400">User not found.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Cover */}
            <div className="h-24 bg-gradient-to-r from-blue-500 to-violet-500" />

            <div className="px-6 pb-6">
              {/* Avatar + name */}
              <div className="flex items-end gap-4 -mt-12 mb-6">
                {profile.profilePic ? (
                  <img
                    src={profile.profilePic}
                    alt="avatar"
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div
                    className={`w-24 h-24 ${avatarColor} rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold`}
                  >
                    {initials}
                  </div>
                )}
                <div className="mb-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    {profile.name}
                  </h2>
                  <p className="text-sm text-gray-400">{profile.email}</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Bio
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Skills Offered */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Skills They Can Teach
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skillsOffered?.length > 0 ? (
                    profile.skillsOffered.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-50 text-blue-600 border border-blue-100 text-sm px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      None listed
                    </span>
                  )}
                </div>
              </div>

              {/* Skills Wanted */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Skills They Want to Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skillsWanted?.length > 0 ? (
                    profile.skillsWanted.map((skill) => (
                      <span
                        key={skill}
                        className="bg-purple-50 text-purple-600 border border-purple-100 text-sm px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      None listed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
