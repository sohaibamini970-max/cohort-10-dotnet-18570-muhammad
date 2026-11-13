import { useState } from "react";
import {
  Search,
  Send,
  Inbox,
  User,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const MOCK_MESSAGES = [
  {
    id: 1,
    sender: "Sarah K.",
    subject: "Update on Landing Page Design",
    preview: "Hey, I've finished the wireframes. Could you review them?",
    body: "Hey Admin,\n\nI've finished the wireframes for the new landing page. I ran into a slight issue with the brand colors but I managed to find a workaround.\n\nCould you review them when you have a moment? The link to the Figma file is in the task submission.\n\nThanks!",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    sender: "Mike R.",
    subject: "API Documentation Delay",
    preview: "I might need an extra day for the API docs.",
    body: "Hi,\n\nJust a heads up — I might need an extra day for the API documentation. I found a few undocumented endpoints that need testing.\n\nLet me know if that's an issue.\n\nMike",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 3,
    sender: "Emma L.",
    subject: "Q4 Roadmap Review",
    preview: "Can we push our 1:1 to tomorrow?",
    body: "Hi Admin,\n\nSomething came up this afternoon. Can we push our 1:1 meeting to tomorrow morning instead?\n\nLet me know.",
    time: "Mon",
    unread: false,
  },
];

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeId, setActiveId] = useState(messages[0].id);
  const [replyText, setReplyText] = useState("");

  const activeMsg = messages.find((m) => m.id === activeId);

  const handleSelect = (id) => {
    setActiveId(id);
    // Mark as read
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
    );
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    // Mock sending reply (just clears input)
    alert(`Reply sent to ${activeMsg.sender}:\n\n"${replyText}"`);
    setReplyText("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Messages</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Communicate with your team members.
        </p>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex overflow-hidden">
        
        {/* Sidebar (Inbox) */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 hidden md:flex">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 transition flex flex-col gap-1 ${
                  activeId === m.id
                    ? "bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-600"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-sm ${m.unread ? "font-bold text-slate-800 dark:text-white" : "font-medium text-slate-600 dark:text-slate-300"}`}>
                    {m.sender}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.time}</span>
                </div>
                <p className={`text-xs truncate ${m.unread ? "font-semibold text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
                  {m.subject}
                </p>
                <p className="text-xs text-slate-400 truncate">{m.preview}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900/50">
          {activeMsg ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button className="md:hidden p-2 rounded-lg hover:bg-slate-100">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    {activeMsg.sender[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{activeMsg.sender}</p>
                    <p className="text-xs text-slate-500">{activeMsg.subject}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="flex gap-3 max-w-2xl">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                    {activeMsg.sender[0]}
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                      {activeMsg.body}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">{activeMsg.time}</span>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleReply} className="flex gap-3">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeMsg.sender}...`}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Send size={16} /> <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
              <Inbox size={48} className="opacity-20" />
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}