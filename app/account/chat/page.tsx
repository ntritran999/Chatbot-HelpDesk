"use client";

import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [selectedBot, setSelectedBot] = useState("bot1");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "bot",
      content: "Hi! How can I help you today?",
      timestamp: "10:30 AM",
    },
  ]);
  const [input, setInput] = useState("");

  const bots = [
    { id: "bot1", name: "Customer Support Bot", status: "online" },
    { id: "bot2", name: "Sales Assistant", status: "online" },
  ];

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage: ChatMessage = {
        id: String(messages.length + 1),
        role: "user",
        content: input,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            role: "bot",
            content: "Thanks for your message! How else can I assist you?",
            timestamp: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }, 500);

      setInput("");
    }
  };

  return (
      <div className="p-8 h-[calc(100vh-80px)]">
        <div className="max-w-6xl mx-auto h-full flex gap-8">
          {/* Bot List Sidebar */}
          <div className="w-64 bg-white rounded-lg border border-slate-200 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Bots</h2>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {bots.map((bot) => (
                <button
                  key={bot.id}
                  onClick={() => setSelectedBot(bot.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedBot === bot.id
                      ? "bg-blue-50 border border-blue-300"
                      : "border border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <span className="font-medium text-slate-900">{bot.name}</span>
                  </div>
                  <p className="text-xs text-slate-600">{bot.status}</p>
                </button>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-lg border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 p-6">
              <h1 className="text-lg font-bold text-slate-900">
                {bots.find((b) => b.id === selectedBot)?.name}
              </h1>
              <p className="text-sm text-slate-600">Chat with your bot</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-sm">
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 px-2">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
