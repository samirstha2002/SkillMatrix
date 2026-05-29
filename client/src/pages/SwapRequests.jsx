import { useEffect, useState } from "react";
import API from "../lib/api";
import socket from "../lib/socket";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useNotifications } from "../App";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Trash2,
} from "lucide-react";

function Avatar({ name, profilePic, onClick }) {
  const initials = name
    ? name
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
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];

  return profilePic ? (
    <img
      src={profilePic}
      alt={name}
      onClick={onClick}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
    />
  ) : (
    <div
      onClick={onClick}
      className={`w-10 h-10 ${color} rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  if (status === "accepted")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" /> Accepted
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  return null;
}

function SwapRequests() {
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const fetchReceived = async () => {
    const res = await API.get("/swap/my-requests");
    setReceived(res.data.filter((r) => r.status === "pending"));
  };

  const fetchSent = async () => {
    const res = await API.get("/swap/sent-requests");
    setSent(res.data);
  };

  useEffect(() => {
    fetchReceived();
    fetchSent();
  }, []);

  useEffect(() => {
    socket.on("notification", (data) => {
      if (data.type === "swap_accepted") {
        setSent((prev) =>
          prev.map((r) =>
            r._id === data.requestId ? { ...r, status: "accepted" } : r,
          ),
        );
      }
      if (data.type === "swap_rejected") {
        setSent((prev) =>
          prev.map((r) =>
            r._id === data.requestId ? { ...r, status: "rejected" } : r,
          ),
        );
      }
    });
    return () => socket.off("notification");
  }, []);

  const accept = async (req) => {
    await API.put(`/swap/accept/${req._id}`);
    addNotification({
      type: "swap_accepted",
      message: `You accepted ${req.sender?.name}'s swap request 🎉`,
      requestId: `${req._id}_accepted_${Date.now()}`,
    });
    setReceived((prev) => prev.filter((r) => r._id !== req._id));
    toast.success("Request accepted!");
    navigate("/chat");
  };

  const reject = async (req) => {
    await API.put(`/swap/reject/${req._id}`);
    addNotification({
      type: "swap_rejected",
      message: `You rejected ${req.sender?.name}'s swap request ❌`,
      requestId: `${req._id}_rejected_${Date.now()}`,
    });
    setReceived((prev) => prev.filter((r) => r._id !== req._id));
    toast.error("Request rejected.");
  };

  const cancelRequest = async (req) => {
    try {
      await API.delete(`/swap/cancel/${req._id}`);
      setSent((prev) => prev.filter((r) => r._id !== req._id));
      toast.success("Request cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    }
  };

  const deleteRequest = async (req) => {
    try {
      await API.delete(`/swap/delete/${req._id}`);
      setSent((prev) => prev.filter((r) => r._id !== req._id));
      toast.success("Request deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const tabs = [
    {
      key: "received",
      label: "Received",
      icon: ArrowDownLeft,
      count: received.length,
    },
    { key: "sent", label: "Sent", icon: ArrowUpRight, count: sent.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Swap Requests</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === key ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* RECEIVED TAB */}
        {tab === "received" && (
          <div className="flex flex-col gap-3">
            {received.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ArrowDownLeft className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">No pending requests</p>
                <p className="text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              received.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                >
                  {/* ✅ Clickable avatar → public profile */}
                  <Avatar
                    name={req.sender?.name}
                    profilePic={req.sender?.profilePic}
                    onClick={() => navigate(`/profile/${req.sender?._id}`)}
                  />
                  <div className="flex-1 min-w-0">
                    {/* ✅ Clickable name → public profile */}
                    <p
                      className="font-semibold text-gray-800 cursor-pointer hover:text-blue-500 transition"
                      onClick={() => navigate(`/profile/${req.sender?._id}`)}
                    >
                      {req.sender?.name}
                    </p>
                    <p className="text-xs text-gray-400">{req.sender?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-100">
                        {req.offeredSkill}
                      </span>
                      <span className="text-gray-300 text-xs">→</span>
                      <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full border border-purple-100">
                        {req.requestedSkill}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => accept(req)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition active:scale-95"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => reject(req)}
                      className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-4 py-1.5 rounded-xl text-sm font-medium transition active:scale-95"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SENT TAB */}
        {tab === "sent" && (
          <div className="flex flex-col gap-3">
            {sent.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ArrowUpRight className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">No sent requests</p>
                <p className="text-sm mt-1">
                  Send a swap request from the home page
                </p>
              </div>
            ) : (
              sent.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
                >
                  {/* ✅ Clickable avatar → public profile */}
                  <Avatar
                    name={req.receiver?.name}
                    profilePic={req.receiver?.profilePic}
                    onClick={() => navigate(`/profile/${req.receiver?._id}`)}
                  />
                  <div className="flex-1 min-w-0">
                    {/* ✅ Clickable name → public profile */}
                    <p
                      className="font-semibold text-gray-800 cursor-pointer hover:text-blue-500 transition"
                      onClick={() => navigate(`/profile/${req.receiver?._id}`)}
                    >
                      {req.receiver?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {req.receiver?.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-100">
                        {req.offeredSkill}
                      </span>
                      <span className="text-gray-300 text-xs">→</span>
                      <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full border border-purple-100">
                        {req.requestedSkill}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={req.status} />
                    {req.status === "pending" && (
                      <button
                        onClick={() => cancelRequest(req)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                    {(req.status === "accepted" ||
                      req.status === "rejected") && (
                      <button
                        onClick={() => deleteRequest(req)}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SwapRequests;
