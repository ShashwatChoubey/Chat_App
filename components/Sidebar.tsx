"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOnlineStatus } from "@/hooks/Status";
import ConversationItem from "./ConversationItem";
import Skeleton from "./Skeleton";
import { Id } from "@/convex/_generated/dataModel";

export default function Sidebar() {
    const conversations = useQuery(api.conversations.getConversations);
    const users = useQuery(api.users.getUsers);
    const createGroupConversation = useMutation(api.conversations.createGroupConversation);
    useOnlineStatus();

    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

    const toggleUser = (userId: Id<"users">) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        await createGroupConversation({
            participantIds: selectedUsers,
            groupName: groupName.trim(),
        });
        setGroupName("");
        setSelectedUsers([]);
        setShowGroupModal(false);
    };

    const handleCancel = () => {
        setShowGroupModal(false);
        setGroupName("");
        setSelectedUsers([]);
    };

    return (
        <div className="hidden md:flex w-72 h-screen flex-col bg-white/80 backdrop-blur border-r border-slate-100 shadow-sm flex-shrink-0">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                    <h2
                        className="font-bold text-slate-800 text-base tracking-tight"
                        style={{ fontFamily: "'Georgia', serif" }}
                    >
                        Messages
                    </h2>
                    {conversations !== undefined && (
                        <p className="text-xs text-slate-400 mt-0.5">
                            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowGroupModal((v) => !v)}
                    title="New group"
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all active:scale-95"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                </button>
            </div>

            {/* Group creation panel */}
            {showGroupModal && (
                <div className="mx-3 my-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">New Group</p>

                    {/* Group name */}
                    <input
                        type="text"
                        placeholder="Group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                    />

                    {/* User picker */}
                    <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                        {users?.map((u) => {
                            const selected = selectedUsers.includes(u._id);
                            return (
                                <button
                                    key={u._id}
                                    onClick={() => toggleUser(u._id)}
                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${selected
                                            ? "bg-indigo-50 border border-indigo-200"
                                            : "hover:bg-white border border-transparent"
                                        }`}
                                >
                                    <img src={u.imageUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-white shadow-sm" />
                                    <span className="text-sm text-slate-700 flex-1 truncate">{u.name}</span>
                                    {selected && (
                                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 flex-shrink-0">
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={handleCreateGroup}
                            disabled={!groupName.trim() || selectedUsers.length === 0}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold shadow-sm hover:from-blue-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            Create Group
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Section label */}
            <p className="px-5 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Recent
            </p>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-0.5">

                {/* Skeletons while loading */}
                {conversations === undefined &&
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl">
                            <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                            <div className="flex flex-col gap-2 flex-1">
                                <Skeleton className="h-3.5 w-24 rounded-full" />
                                <Skeleton className="h-3 w-32 rounded-full" />
                            </div>
                        </div>
                    ))}

                {/* Empty state */}
                {conversations?.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 mt-12 px-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">No chats yet</p>
                        <p className="text-xs text-slate-400">Start a conversation from the people list.</p>
                    </div>
                )}

                {/* Conversations */}
                {conversations?.map((conv) => (
                    <ConversationItem key={conv._id} conv={conv} />
                ))}
            </div>
        </div>
    );
}