"use client";

import { Button } from "@/components/ui/button";
import { Plus, Users, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Group {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Load groups from localStorage
    const storedGroups = localStorage.getItem("groups");
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    } else {
      const defaultGroups: Group[] = [
        {
          id: "1",
          name: "Sales Team",
          members: ["sales1@example.com", "sales2@example.com"],
          createdAt: "2024-01-20",
        },
        {
          id: "2",
          name: "Support Team",
          members: [
            "support1@example.com",
            "support2@example.com",
            "support3@example.com",
          ],
          createdAt: "2024-01-15",
        },
      ];
      setGroups(defaultGroups);
      localStorage.setItem("groups", JSON.stringify(defaultGroups));
    }
  }, []);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const members = memberEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.includes("@"));

      if (editingId) {
        // Update existing group
        const updatedGroups = groups.map((g) =>
          g.id === editingId
            ? {
                ...g,
                name: newGroupName,
                members: members,
              }
            : g
        );
        setGroups(updatedGroups);
        localStorage.setItem("groups", JSON.stringify(updatedGroups));
        setEditingId(null);
      } else {
        // Create new group
        const newGroup: Group = {
          id: String(groups.length + 1),
          name: newGroupName,
          members: members,
          createdAt: new Date().toISOString().split("T")[0],
        };
        const updatedGroups = [...groups, newGroup];
        setGroups(updatedGroups);
        localStorage.setItem("groups", JSON.stringify(updatedGroups));
      }

      setNewGroupName("");
      setMemberEmails("");
      setShowCreateForm(false);
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingId(group.id);
    setNewGroupName(group.name);
    setMemberEmails(group.members.join(", "));
    setShowCreateForm(true);
  };

  const handleDeleteGroup = (id: string) => {
    const updatedGroups = groups.filter((g) => g.id !== id);
    setGroups(updatedGroups);
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setNewGroupName("");
    setMemberEmails("");
  };

  return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Groups</h1>
              <p className="text-slate-600">
                Manage team groups and share bots with members
              </p>
            </div>
            {!showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Group
              </Button>
            )}
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {editingId ? "Edit Group" : "Create New Group"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Sales Team"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Member Emails (comma separated) *
                  </label>
                  <textarea
                    value={memberEmails}
                    onChange={(e) => setMemberEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter valid email addresses separated by commas
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateGroup}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {editingId ? "Update Group" : "Create Group"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Groups List */}
          {groups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {group.name}
                  </h3>

                  {/* Members List */}
                  <div className="bg-slate-50 rounded-lg p-3 mb-6 max-h-32 overflow-y-auto">
                    <p className="text-xs text-slate-600 font-semibold mb-2 uppercase">
                      Members
                    </p>
                    <div className="space-y-1">
                      {group.members.map((email, idx) => (
                        <p
                          key={idx}
                          className="text-xs text-slate-700 truncate hover:text-clip"
                          title={email}
                        >
                          {email}
                        </p>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    Created {group.createdAt}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
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
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                No groups yet
              </h2>
              <p className="text-slate-600 mb-6">
                Create a group to share bots with your team
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </Button>
            </div>
          )}
        </div>
      </div>
  );
}
