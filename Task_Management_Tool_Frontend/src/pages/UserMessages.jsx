import { useState, useEffect, useRef } from "react";
import { Send, User, ShieldCheck, Search, Mail, ChevronLeft } from "lucide-react";
import { useMessages } from "../context/MessageContext";
import { useAuth } from "../context/AuthContext";

// Mock contacts for the user to select from
const CONTACTS = [
  {
    id: "admin@task.com",
    name: "Admin User",
    role: "System Administrator",
    avatarIcon: ShieldCheck,
    color: "bg-primary-100 text-primary-700",
  },
  {
    id: "sarah@task.com",
    name: "Sarah K.",
    role: "Project Manager",
    avatarIcon: User,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "mike@task.com",
    name: "Mike R.",
    role: "Lead Developer",
    avatarIcon: User,
    color: "bg-indigo-100 text-indigo-700",
  },
];

export default function UserMessages() {
  const { conversation, sendMessage } = useMessages();
  const { user } = useAuth();

  const [selectedContact, setSelectedContact] = useState(CONTACTS[0]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);

  // Filter contacts by search
  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter conversation for the selected contact
  const chatMessages = conversation.filter(
    (m) => m.sender === selectedContact.id || m.receiver === selectedContact.id
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, selectedContact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text, selectedContact.id);
    setText("");
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Messages</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Select a contact to start a conversation.
        </p>
      </div>

      {/* Main Inbox Container - Forced Light Mode */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex overflow-hidden shadow-sm">

        {/* ================= LEFT: CONTACT LIST ================= */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => {
              const isActive = selectedContact.id === contact.id;
              const Icon = contact.avatarIcon;

              return (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-4 border-b border-slate-100 transition flex items-center gap-3 ${isActive
                      ? "bg-primary-50 border-l-4 border-l-primary-600"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${contact.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${isActive ? "text-primary-700" : "text-slate-800"}`}>
                      {contact.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {contact.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT: CONVERSATION AREA ================= */}
        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">

          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 bg-white">
            <button className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedContact.color}`}>
              <selectedContact.avatarIcon size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">{selectedContact.name}</p>
              <p className="text-xs text-slate-500">{selectedContact.role}</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Mail size={40} className="opacity-20 mb-3" />
                <p className="font-semibold text-slate-600">No messages yet</p>
                <p className="text-sm mt-1">Send a message to {selectedContact.name} to start.</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => {
                const isMe = msg.sender === user.email;
                const showDate = i === 0 || formatDate(msg.time) !== formatDate(chatMessages[i - 1].time);

                return (
                  <div key={msg.id} className="space-y-2">
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">
                          {formatDate(msg.time)}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`flex gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto ${isMe ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {isMe ? <User size={14} /> : <selectedContact.avatarIcon size={14} />}
                        </div>

                        <div className={`p-3 rounded-2xl text-sm ${isMe
                            ? "bg-primary-600 text-white rounded-br-sm shadow-sm"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm"
                          }`}>
                          {msg.text}
                          <span className={`block text-[10px] mt-1 text-right ${isMe ? "text-primary-200" : "text-slate-400"}`}>
                            {formatTime(msg.time)}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Message ${selectedContact.name}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="px-5 py-3 rounded-xl bg-primary-600 text-white font-bold flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-primary-600/20 active:scale-95"
              >
                <Send size={16} /> <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}