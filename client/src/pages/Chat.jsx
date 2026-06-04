import { useEffect, useState, useRef } from "react";
import socket from "../lib/socket";
import API from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Send,
  MessageSquare,
  Search,
  Trash2,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Avatar({ name, profilePic, size = "md", online }) {
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
  const sizeClass =
    size === "lg"
      ? "w-11 h-11 text-sm"
      : size === "sm"
        ? "w-7 h-7 text-[10px]"
        : "w-10 h-10 text-xs";

  return (
    <div className="relative flex-shrink-0">
      {profilePic ? (
        <img
          src={profilePic}
          alt={name}
          className={`${sizeClass} rounded-full object-cover shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-bold text-white shadow-sm`}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? "bg-emerald-400" : "bg-gray-300"}`}
        />
      )}
    </div>
  );
}

// Confirm dialog
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5">
        <p className="text-gray-800 font-medium mb-1">Are you sure?</p>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Hover state for message delete button
  const [hoveredMsg, setHoveredMsg] = useState(null);

  // Chat menu (3-dot)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Confirm dialog
  const [confirm, setConfirm] = useState(null); // { type: 'message'|'conversation', id? }

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get("/messages/chats");
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(
          (c) =>
            c.user.name.toLowerCase().includes(search.toLowerCase()) ||
            c.user.email.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, users]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const res = await API.get(`/messages/conversation/${selectedUser._id}`);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    const handler = (data) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
      setUsers((prev) =>
        prev.map((c) => {
          const otherId = data.sender?._id || data.sender;
          const receiverId = data.receiver?._id || data.receiver;
          if (c.user._id === otherId || c.user._id === receiverId) {
            return { ...c, lastMessage: data.message, time: data.createdAt };
          }
          return c;
        }),
      );
    };
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, []);

  useEffect(() => {
    socket.on("online_users", setOnlineUsers);
    return () => socket.off("online_users", setOnlineUsers);
  }, []);

  useEffect(() => {
    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, []);

  useEffect(() => {
    socket.on("error", (data) => toast.error(data.message));
    return () => socket.off("error");
  }, []);

  const handleTyping = () => {
    if (!selectedUser) return;
    socket.emit("typing", { senderId: user._id, receiverId: selectedUser._id });
    setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    }, 800);
  };

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;
    socket.emit("send_message", { receiverId: selectedUser._id, message });
    setMessage("");
    inputRef.current?.focus();
  };

  // ✅ Delete single message
  const handleDeleteMessage = async (msgId) => {
    try {
      await API.delete(`/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    }
    setConfirm(null);
  };

  // ✅ Delete entire conversation
  const handleDeleteConversation = async () => {
    try {
      await API.delete(`/messages/conversation/${selectedUser._id}`);
      setMessages([]);
      setUsers((prev) => prev.filter((c) => c.user._id !== selectedUser._id));
      setSelectedUser(null);
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error("Failed to delete conversation");
    }
    setConfirm(null);
    setMenuOpen(false);
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="h-screen flex bg-[#efeae2] overflow-hidden">
      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          message={
            confirm.type === "message"
              ? "This message will be permanently deleted."
              : "All messages in this conversation will be deleted for you."
          }
          onConfirm={() =>
            confirm.type === "message"
              ? handleDeleteMessage(confirm.id)
              : handleDeleteConversation()
          }
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div className="w-[340px] flex flex-col bg-white border-r border-gray-100">
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Chats</h1>
            <span className="text-xs bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
              {users.length} conversation{users.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-16">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <p className="text-sm">
                {search ? "No results" : "No chats yet"}
              </p>
            </div>
          ) : (
            filteredUsers.map((chat) => {
              const online = isOnline(chat.user._id);
              const isSelected = selectedUser?._id === chat.user._id;

              return (
                <div
                  key={chat.user._id}
                  onClick={() => setSelectedUser(chat.user)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-gray-50
                    ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50 border-l-4 border-l-transparent"}`}
                >
                  <Avatar
                    name={chat.user.name}
                    profilePic={chat.user.profilePic}
                    online={online}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800 text-sm truncate">
                        {chat.user.name}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {formatTime(chat.time)}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-400 truncate">
                      {chat.user.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-100 shadow-sm">
              {/* Clickable avatar/name → profile */}
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition"
                onClick={() => navigate(`/profile/${selectedUser._id}`)}
              >
                <Avatar
                  name={selectedUser.name}
                  profilePic={selectedUser.profilePic}
                  online={isOnline(selectedUser._id)}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-800 leading-tight truncate">
                    {selectedUser.name}
                  </h2>
                  <p className="text-xs text-gray-400 truncate">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Online badge */}
              {isOnline(selectedUser._id) ? (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                  ● Online
                </span>
              ) : (
                <span className="text-gray-400 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                  ● Offline
                </span>
              )}

              {/* ✅ 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        setConfirm({ type: "conversation" });
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Typing indicator */}
            {typing && (
              <div className="px-6 py-1.5 text-xs text-gray-400 italic bg-white/80">
                {selectedUser.name} is typing...
              </div>
            )}

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5b8a8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-300/50" />
                    <span className="text-[11px] text-gray-500 font-medium bg-white/80 px-3 py-1 rounded-full shadow-sm border border-gray-200/50">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-gray-300/50" />
                  </div>

                  <div className="space-y-1.5">
                    {msgs.map((msg, idx) => {
                      const isMine =
                        msg.sender === user._id || msg.sender?._id === user._id;
                      const prevMsg = msgs[idx - 1];
                      const prevSenderId =
                        prevMsg?.sender?._id || prevMsg?.sender;
                      const currSenderId = msg.sender?._id || msg.sender;
                      const isFirstInGroup =
                        !prevMsg || prevSenderId !== currSenderId;

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}
                          onMouseEnter={() => setHoveredMsg(msg._id)}
                          onMouseLeave={() => setHoveredMsg(null)}
                        >
                          {!isMine && (
                            <div className="flex-shrink-0 mb-1">
                              {isFirstInGroup ? (
                                <Avatar
                                  name={selectedUser.name}
                                  profilePic={selectedUser.profilePic}
                                  size="sm"
                                />
                              ) : (
                                <div className="w-7" />
                              )}
                            </div>
                          )}

                          <div
                            className={`flex items-end gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"} max-w-[65%]`}
                          >
                            <div
                              className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm
                                ${
                                  isMine
                                    ? "bg-[#d9fdd3] text-gray-800 rounded-2xl rounded-br-sm"
                                    : "bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100"
                                }`}
                            >
                              {msg.message}
                              <span className="text-[10px] ml-2 align-bottom inline-block text-gray-400">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>

                            {/* ✅ Delete button — only for own messages, on hover */}
                            {isMine && hoveredMsg === msg._id && (
                              <button
                                onClick={() =>
                                  setConfirm({ type: "message", id: msg._id })
                                }
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-red-400 hover:text-red-600 hover:bg-red-50 transition mb-1 flex-shrink-0"
                                title="Delete message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-[#f0f2f5] border-t border-gray-200">
              <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 py-1"
                  placeholder={`Message ${selectedUser.name}...`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 bg-[#efeae2]">
            <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-600 text-lg">
                Your Messages
              </p>
              <p className="text-sm mt-1 text-gray-400">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
