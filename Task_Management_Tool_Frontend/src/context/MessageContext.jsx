import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { user } = useAuth();
  
  // Seed messages between user and admin
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("tm_messages");
    return stored ? JSON.parse(stored) : [
      {
        id: 1,
        sender: "admin@task.com",
        senderName: "Admin User",
        receiver: "user@task.com",
        text: "Hi John, let me know if you need any help with the Q4 roadmap task.",
        time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 2,
        sender: "user@task.com",
        senderName: "John Doe",
        receiver: "admin@task.com",
        text: "Thanks! I'm reviewing it now. Should have it submitted by tomorrow.",
        time: new Date(Date.now() - 82800000).toISOString(),
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("tm_messages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim() || !user) return;
    
    // Determine receiver based on role
    const receiver = user.role === "admin" ? "user@task.com" : "admin@task.com";
    const receiverName = user.role === "admin" ? "John Doe" : "Admin User";

    const newMsg = {
      id: Date.now(),
      sender: user.email,
      senderName: user.name,
      receiver: receiver,
      receiverName: receiverName,
      text: text.trim(),
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  // Filter messages that belong to the current user's conversation
  const conversation = messages.filter(
    (m) => 
      (m.sender === user?.email && m.receiver === (user?.role === "admin" ? "user@task.com" : "admin@task.com")) ||
      (m.receiver === user?.email && m.sender === (user?.role === "admin" ? "user@task.com" : "admin@task.com"))
  ).sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <MessageContext.Provider value={{ conversation, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
}

export const useMessages = () => useContext(MessageContext);