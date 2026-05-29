import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../lib/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { Camera, Plus, X, Save } from "lucide-react";

function SkillTags({ label, skills, onChange, color }) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange([...skills, trimmed]);
    setInput("");
  };

  const remove = (skill) => onChange(skills.filter((s) => s !== skill));

  const colorMap = {
    blue: {
      tag: "bg-blue-50 text-blue-600 border border-blue-100",
      btn: "bg-blue-500 hover:bg-blue-600",
      ring: "focus-within:ring-blue-100 focus-within:border-blue-400",
    },
    purple: {
      tag: "bg-purple-50 text-purple-600 border border-purple-100",
      btn: "bg-purple-500 hover:bg-purple-600",
      ring: "focus-within:ring-purple-100 focus-within:border-purple-400",
    },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-8">
        {skills.map((skill) => (
          <span
            key={skill}
            className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${c.tag}`}
          >
            {skill}
            <button
              onClick={() => remove(skill)}
              className="hover:opacity-70 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <span className="text-sm text-gray-400 italic">
            No skills added yet
          </span>
        )}
      </div>

      {/* Input */}
      <div
        className={`flex gap-2 border rounded-xl px-3 py-2 bg-gray-50 transition-all ring-2 ring-transparent ${c.ring}`}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={`Add a skill and press Enter...`}
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
        />
        <button
          onClick={add}
          className={`${c.btn} text-white w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [picPreview, setPicPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Populate form from user
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setSkillsOffered(user.skillsOffered || []);
      setSkillsWanted(user.skillsWanted || []);
      setPicPreview(user.profilePic || "");
    }
  }, [user]);

  // Handle profile pic selection & upload
  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => setPicPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePic", file);
      const res = await API.post("/users/upload-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, profilePic: res.data.profilePic }));
      toast.success("Photo updated!");
    } catch (err) {
      toast.error("Failed to upload photo", err);
    } finally {
      setUploading(false);
    }
  };

  // Save profile text fields
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await API.put("/users/update", {
        bio,
        skillsOffered,
        skillsWanted,
      });
      setUser((prev) => ({ ...prev, ...res.data }));
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Avatar initials fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  const colors = [
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
  const avatarColor = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover + Avatar */}
          <div className="h-24 bg-linear-to-r from-blue-500 to-violet-500" />

          <div className="px-6 pb-6">
            {/* Avatar upload */}
            <div className="flex items-end gap-4 -mt-12 mb-6">
              <div className="relative">
                {picPreview ? (
                  <img
                    src={picPreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div
                    className={`w-24 h-24 ${avatarColor} rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold`}
                  >
                    {initials}
                  </div>
                )}

                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md transition active:scale-95 disabled:opacity-60"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePicChange}
                />
              </div>

              <div className="mb-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-6">
              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell others about yourself..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                />
              </div>

              {/* Skills Offered */}
              <SkillTags
                label="Skills I Can Teach"
                skills={skillsOffered}
                onChange={setSkillsOffered}
                color="blue"
              />

              {/* Skills Wanted */}
              <SkillTags
                label="Skills I Want to Learn"
                skills={skillsWanted}
                onChange={setSkillsWanted}
                color="purple"
              />

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition active:scale-[0.98]"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
