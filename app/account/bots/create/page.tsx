"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowLeft, Upload, Link as LinkIcon, Send, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
}

export default function BotCreate() {
  const [model, setModel] = useState("gpt4");
  const [botName, setBotName] = useState("");
  const [knowledgeSource, setKnowledgeSource] = useState<"url" | "file" | null>(null);
  const [knowledgeUrl, setKnowledgeUrl] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [botCreated, setBotCreated] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [responseAdjustment, setResponseAdjustment] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const packageType = localStorage.getItem("packageType") || "individual";
  const router = useRouter();

  // Mock groups
  const [availableGroups] = useState<Group[]>([
    { id: "1", name: "Sales Team" },
    { id: "2", name: "Support Team" },
    { id: "3", name: "Marketing Team" },
  ]);

  const handleCreateBot = () => {
    if (botName.trim()) {
      // Save bot to localStorage
      const storedBots = localStorage.getItem("bots");
      const bots = storedBots ? JSON.parse(storedBots) : [];
      const newBot = {
        id: String(bots.length + 1),
        name: botName,
        model: model,
        createdAt: new Date().toISOString().split("T")[0],
        status: "active",
      };
      bots.push(newBot);
      localStorage.setItem("bots", JSON.stringify(bots));
      setBotCreated(true);
    }
  };

  const handleSendMessage = () => {
    if (testMessage.trim()) {
      let botResponse = `Response from ${botName} using ${model}`;
      
      if (responseAdjustment.trim()) {
        botResponse = responseAdjustment;
      }

      setChatMessages([
        ...chatMessages,
        { role: "user", content: testMessage },
        {
          role: "assistant",
          content: botResponse,
        },
      ]);
      setTestMessage("");
    }
  };

  const handleFinishCreation = () => {
    router.push("/account/bots");
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/account/bots">
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {botCreated ? "Test Bot" : "Create New Bot"}
              </h1>
              <p className="text-slate-600">
                {botCreated
                  ? "Chat with your bot to test responses"
                  : "Configure your AI-powered chatbot"}
              </p>
            </div>
          </div>

          {!botCreated ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Part 1: AI Model Selection */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    AI Model
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <input
                        type="radio"
                        name="model"
                        value="gpt4"
                        checked={model === "gpt4"}
                        onChange={(e) => setModel(e.target.value)}
                      />
                      <div>
                        <div className="font-semibold text-slate-900">GPT-4</div>
                        <div className="text-xs text-slate-600">Most advanced</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <input
                        type="radio"
                        name="model"
                        value="claude3"
                        checked={model === "claude3"}
                        onChange={(e) => setModel(e.target.value)}
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          Claude 3
                        </div>
                        <div className="text-xs text-slate-600">
                          Balanced & fast
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                      <input
                        type="radio"
                        name="model"
                        value="gemini"
                        checked={model === "gemini"}
                        onChange={(e) => setModel(e.target.value)}
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          Gemini
                        </div>
                        <div className="text-xs text-slate-600">
                          Cost effective
                        </div>
                      </div>
                    </label>
                  </div>

                  {packageType === "business" && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4">
                        Share with Groups
                      </h3>
                      <Button
                        onClick={() => setShowGroupModal(true)}
                        variant="outline"
                        className="w-full"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Select Groups ({selectedGroups.length})
                      </Button>
                      {selectedGroups.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedGroups.map((groupId) => {
                            const group = availableGroups.find((g) => g.id === groupId);
                            return (
                              <div key={groupId} className="flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
                                <span className="text-blue-700">{group?.name}</span>
                                <button
                                  onClick={() => toggleGroupSelection(groupId)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Part 2: Bot Configuration */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-6">
                    Bot Configuration
                  </h2>

                  <div className="space-y-6">
                    {/* Bot Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Bot Name *
                      </label>
                      <input
                        type="text"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        placeholder="e.g., Customer Support Bot"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Knowledge Base */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 mb-4">
                        Knowledge Base
                      </h3>
                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            setKnowledgeSource(
                              knowledgeSource === "url" ? null : "url"
                            )
                          }
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            knowledgeSource === "url"
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-300 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <LinkIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-slate-900">
                              Add Website Link
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Train bot with website content
                          </p>
                        </button>

                        {knowledgeSource === "url" && (
                          <input
                            type="url"
                            value={knowledgeUrl}
                            onChange={(e) => setKnowledgeUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        )}

                        <button
                          onClick={() =>
                            setKnowledgeSource(
                              knowledgeSource === "file" ? null : "file"
                            )
                          }
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            knowledgeSource === "file"
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-300 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Upload className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-slate-900">
                              Upload File
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            PDF, TXT, or DOCX files
                          </p>
                        </button>

                        {knowledgeSource === "file" && (
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">
                              Click to upload or drag and drop
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Create Button */}
                    <Button
                      onClick={handleCreateBot}
                      disabled={!botName.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      size="lg"
                    >
                      Create Bot
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Part 3: Chat Interface */
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-slate-200 flex flex-col h-96 mb-6">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center">
                        <div>
                          <p className="text-slate-500 mb-2">No messages yet</p>
                          <p className="text-sm text-slate-400">
                            Start chatting with your bot below
                          </p>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-slate-200 p-4 flex gap-2">
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Test your bot..."
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Response Adjustment Area */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Adjust Bot Response
                  </h3>
                  <textarea
                    value={responseAdjustment}
                    onChange={(e) => setResponseAdjustment(e.target.value)}
                    placeholder="Enter custom response here to test how the bot will respond. Leave empty to use default responses."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-sm text-slate-600 mt-2">
                    Use this area to fine-tune and test different response patterns before finalizing your bot.
                  </p>
                </div>
              </div>

              {/* Bot Info */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24 h-fit">
                <h3 className="font-bold text-slate-900 mb-4">Bot Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide">
                      Name
                    </p>
                    <p className="font-semibold text-slate-900">{botName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide">
                      Model
                    </p>
                    <p className="font-semibold text-slate-900 capitalize">
                      {model.replace(/([A-Z])/g, " $1")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide">
                      Status
                    </p>
                    <p className="font-semibold text-green-600">Active</p>
                  </div>
                  {selectedGroups.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">
                        Shared Groups
                      </p>
                      <p className="font-semibold text-slate-900">
                        {selectedGroups.length} group(s)
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <Button
                      onClick={handleFinishCreation}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Finish & Save Bot
                    </Button>
                    <Button
                      onClick={() => setBotCreated(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Group Selection Modal */}
          {showGroupModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Select Groups
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableGroups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => toggleGroupSelection(group.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-900 font-medium">
                        {group.name}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setShowGroupModal(false)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    Done
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedGroups([]);
                      setShowGroupModal(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
