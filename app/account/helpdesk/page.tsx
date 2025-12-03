"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Download } from "lucide-react";
import { useState } from "react";

interface Ticket {
  id: string;
  title: string;
  status: "open" | "resolved";
  createdAt: string;
  priority: "high" | "medium" | "low";
  description?: string;
}

const ticketsData: Ticket[] = [
  {
    id: "1",
    title: "Bot not responding to greetings",
    status: "open",
    createdAt: "2024-01-22",
    priority: "high",
    description: "The bot fails to respond when users greet it with common phrases.",
  },
  {
    id: "2",
    title: "Integration issue with API",
    status: "resolved",
    createdAt: "2024-01-20",
    priority: "high",
    description: "Fixed the API integration issue.",
  },
  {
    id: "3",
    title: "Feature request: custom responses",
    status: "open",
    createdAt: "2024-01-18",
    priority: "low",
    description: "User requested ability to add custom response patterns.",
  },
];

const statsData = [
  { name: "Mon", resolved: 4, pending: 3 },
  { name: "Tue", resolved: 5, pending: 2 },
  { name: "Wed", resolved: 6, pending: 1 },
  { name: "Thu", resolved: 7, pending: 2 },
  { name: "Fri", resolved: 8, pending: 1 },
];

const trendsData = [
  { date: "Week 1", tickets: 15 },
  { date: "Week 2", tickets: 12 },
  { date: "Week 3", tickets: 9 },
  { date: "Week 4", tickets: 7 },
];

export default function Helpdesk() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Record<string, string[]>>({});

  const openTickets = ticketsData.filter((t) => t.status === "open").length;
  const resolvedTickets = ticketsData.filter((t) => t.status === "resolved").length;

  const handleReply = (ticketId: string) => {
    if (replyText.trim()) {
      setReplies((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), replyText],
      }));
      setReplyText("");
    }
  };

  return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Helpdesk</h1>

          <Tabs defaultValue="tickets" className="space-y-6">
            <TabsList>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Open Tickets</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {openTickets}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Resolved Tickets
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {resolvedTickets}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Avg Resolution Time
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        2.5h
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Tickets List and Detail */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-1 bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">All Tickets</h3>
                  </div>
                  <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                    {ticketsData.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full p-4 text-left transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <p className="font-medium text-slate-900 text-sm mb-1">
                          {ticket.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              ticket.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              ticket.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : ticket.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ticket Detail */}
                {selectedTicket ? (
                  <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {selectedTicket.title}
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          selectedTicket.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {selectedTicket.status === "resolved"
                          ? "Resolved"
                          : "Open"}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          selectedTicket.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : selectedTicket.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {selectedTicket.priority.charAt(0).toUpperCase() +
                          selectedTicket.priority.slice(1)}
                      </span>
                      <p className="text-sm text-slate-600 ml-auto">
                        Created {selectedTicket.createdAt}
                      </p>
                    </div>

                    <p className="text-slate-700 mb-6">
                      {selectedTicket.description || "No description provided."}
                    </p>

                    {/* Replies Section */}
                    <div className="flex-1 border-t border-slate-200 pt-6 mb-6">
                      <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Replies
                      </h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {replies[selectedTicket.id]?.map((reply, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 border border-slate-200"
                          >
                            {reply}
                          </div>
                        ))}
                        {!replies[selectedTicket.id]?.length && (
                          <p className="text-sm text-slate-500 italic">
                            No replies yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reply Input */}
                    <div className="border-t border-slate-200 pt-4">
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Reply to this ticket
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                      />
                      <Button
                        onClick={() => handleReply(selectedTicket.id)}
                        className="mt-3 bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-12 flex items-center justify-center text-center">
                    <p className="text-slate-600">
                      Select a ticket to view details and reply
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    const csvContent = [
                      ["Date", "Resolved", "Pending"],
                      ...statsData.map(row => [row.name, row.resolved, row.pending])
                    ].map(row => row.join(",")).join("\n");

                    const link = document.createElement("a");
                    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
                    link.download = `helpdesk-statistics-${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Statistics
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Daily Resolution Chart */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Daily Resolutions
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="resolved" fill="#10b981" />
                      <Bar dataKey="pending" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Ticket Trends */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Ticket Trends
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="tickets"
                        stroke="#3b82f6"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
