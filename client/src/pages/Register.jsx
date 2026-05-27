import { useState } from "react";
import API from "../lib/api";
import { GraduationCapIcon, Lock, Mail, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/register", form);

      localStorage.setItem("token", res.data.token);
      setUser(res.data);
      toast.success("Account created successfully 🚀");

      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        {/* Logo + App Name */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCapIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">SkillMatrix</h1>
        </div>

        <p className="text-center text-gray-500 mb-6">
          Create your account and start swapping skills.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>

            <div className="flex items-center border rounded-xl px-3 py-3 mt-1">
              <User className="w-5 h-5 text-gray-400 mr-2" />

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>

            <div className="flex items-center border rounded-xl px-3 py-3 mt-1">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="flex items-center border rounded-xl px-3 py-3 mt-1">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />

              <input
                type="password"
                name="password"
                placeholder="Create password"
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <div className="flex items-center border rounded-xl px-3 py-3 mt-1">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-medium transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center mt-6 leading-5">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </div>
  );
}

export default Register;
