"use client";

import { Button } from "@/components/ui/button";
import { Plus, Bot, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BotItem {
  id: string;
  name: string;
  model: string;
  createdAt: string;
  status: "active" | "inactive";
}

export default function Bots() {
  const [bots, setBots] = useState<BotItem[]>([]);

  useEffect(() => {
    // Load bots from localStorage
    const storedBots = localStorage.getItem("bots");
    if (storedBots) {
      setBots(JSON.parse(storedBots));
    } else {
      // Default bots
      const defaultBots: BotItem[] = [
        {
          id: "1",
          name: "Customer Support Bot",
          model: "GPT-4",
          createdAt: "2024-01-15",
          status: "active",
        },
        {
          id: "2",
          name: "Sales Assistant",
          model: "Claude 3",
          createdAt: "2024-01-10",
          status: "active",
        },
      ];
      setBots(defaultBots);
      localStorage.setItem("bots", JSON.stringify(defaultBots));
    }
  }, []);

  const handleDeleteBot = (id: string) => {
    const updatedBots = bots.filter((bot) => bot.id !== id);
    setBots(updatedBots);
    localStorage.setItem("bots", JSON.stringify(updatedBots));
  };

  return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Bot</h1>
              <p className="text-slate-600">
                Build and manage your AI-powered chatbots
              </p>
            </div>
            <Link href="/account/bots/create">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Create New Bot
              </Button>
            </Link>
          </div>

          {/* Bots Grid */}
          {bots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bot.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {bot.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {bot.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">Model: {bot.model}</p>
                  <p className="text-xs text-slate-500 mb-6">
                    Created {bot.createdAt}
                  </p>

                  <div className="flex gap-2">
                    <Link href={`/account/bots/${bot.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDeleteBot(bot.id)}
                      className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                No bots yet
              </h2>
              <p className="text-slate-600 mb-6">
                Create your first bot to get started
              </p>
              <Link href="/account/bots/create">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Create Your First Bot
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
  );
}
