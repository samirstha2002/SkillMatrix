import { useState } from "react";
import API from "../lib/api";
import { Mail, Lock, GraduationCapIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      toast.success("Welcome back 🚀");

      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCapIcon className="w-8 h-8 text-blue-600" />

          <h1 className="text-3xl font-bold text-gray-800">SkillMatrix</h1>
        </div>

        <p className="text-center text-gray-500 mb-6">
          Login to continue your skill journey.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Enter your password"
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>

        {/* Footer Text */}
        <p className="text-xs text-gray-400 text-center mt-6 leading-5">
          SkillMatrix helps people connect through learning and teaching skills
          together.
        </p>
      </div>
    </div>
  );
}

export default Login;
