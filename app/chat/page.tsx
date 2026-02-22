"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "@/components/Sidebar";
import { useOnlineStatus } from "@/hooks/Status";

type User = {
    _id: Id<"users">;
    name: string;
    imageUrl: string;
    email: string;
    username: string;
    clerkId: string;
    isOnline?: boolean;
};

export default function Home() {
    const { user, isLoaded } = useUser();
    const createUser = useMutation(api.users.createUser);
    const [userSearch, setUserSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [text, setText] = useState("");
    const users = useQuery(api.users.getUsers);
    const conversations = useQuery(api.conversations.getConversations);
    const createConversation = useMutation(api.conversations.createConversation);
    const sendMessage = useMutation(api.messages.sendMessage);
    const router = useRouter();
    const [sendError, setSendError] = useState<string | null>(null);


    useOnlineStatus();
    useEffect(() => {
        if (selectedUser) {
            document.querySelector<HTMLInputElement>('input[placeholder="Type a message..."]')?.focus();
        }
    }, [selectedUser]);

    useEffect(() => {
        if (isLoaded && user) {
            createUser();
        }
    }, [isLoaded, user, createUser]);

    const handleClick = (clickedUser: User) => {
        const existingConversation = conversations?.find(
            (conv) => conv.otherUser?._id === clickedUser._id
        );
        if (existingConversation) {
            router.push(`/chat/${existingConversation._id}`);
            return;
        }
        setSelectedUser(clickedUser);
        setText("");
    };

    const handleSend = async () => {
        if (!text.trim() || !selectedUser) return;
        try {
            setSendError(null);
            const conversationId = await createConversation({
                participantId: selectedUser._id,
            });
            await sendMessage({
                conversationId: conversationId as Id<"conversations">,
                content: text,
            });
            setText("");
            router.push(`/chat/${conversationId}`);
        } catch {
            setSendError("Failed to send message. Try again.");
        }
    };

    const filteredUsers = users?.filter((u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (!isLoaded)
        return (
            <div className="flex h-screen items-center justify-center bg-[#F0F4FF]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Loading...</p>
                </div>
            </div>
        );

    // Shared input bar used in both mobile new-chat and desktop new-chat
    const InputBar = () => (
        <div className="px-4 pb-5 pt-3 bg-white/60 backdrop-blur border-t border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-300 transition-all">
                <input
                    autoFocus
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md hover:from-blue-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    );

    // People list panel — used on mobile (full screen) and desktop (right panel)
    const PeoplePanel = () => (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur border-b border-slate-100 shadow-sm flex-shrink-0">
                <div>
                    <h1 className="text-lg font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                        Simple Talk
                    </h1>
                    <p className="text-xs text-slate-400">Start a new conversation</p>
                </div>
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 ring-2 ring-indigo-200 shadow" } }} />
            </div>

            {/* Search */}
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300 transition-all">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search people..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                    />
                </div>
            </div>

            <p className="px-5 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-widest flex-shrink-0">People</p>

            <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
                {users?.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 mt-16 text-center px-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">No one here yet</p>
                        <p className="text-xs text-slate-400">Invite friends to start chatting!</p>
                    </div>
                )}
                {filteredUsers?.length === 0 && userSearch && (
                    <p className="text-center mt-12 text-sm text-slate-400">No users found for "{userSearch}"</p>
                )}
                {filteredUsers?.map((u) => (
                    <button
                        key={u._id}
                        onClick={() => handleClick(u as User)}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl hover:bg-white/80 hover:shadow-sm transition-all duration-150 text-left group"
                    >
                        <div className="relative flex-shrink-0">
                            <img src={u?.imageUrl} alt={u?.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow" />
                            {u?.isOnline && <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                            <p className="text-xs text-slate-400">{u?.isOnline ? "Online" : "Offline"}</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>
    );

    // New chat panel (after selecting a user)
    const NewChatPanel = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-white/70 backdrop-blur border-b border-slate-100 shadow-sm flex-shrink-0">
                <button
                    onClick={() => setSelectedUser(null)}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </button>
                <div className="relative">
                    <img src={selectedUser!.imageUrl} alt={selectedUser!.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow" />
                    {selectedUser!.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />}
                </div>
                <div>
                    <p className="font-semibold text-slate-800 text-sm leading-tight">{selectedUser!.name}</p>
                    <p className="text-xs text-slate-400">{selectedUser!.isOnline ? "Online" : "Offline"}</p>
                </div>
            </div>

            {/* Empty state */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">Say hello to {selectedUser!.name.split(" ")[0]}!</p>
                <p className="text-slate-400 text-xs">Send your first message to start the conversation.</p>
            </div>

            {sendError && (
                <div className="mx-4 mb-2 flex items-center justify-between gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs">
                    <span>{sendError}</span>
                    <button onClick={handleSend} className="font-semibold underline underline-offset-2">Retry</button>
                </div>
            )}

            <InputBar />
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F0F4FF] overflow-hidden">

            {/* ── DESKTOP: Sidebar always visible ── */}
            <Sidebar />

            {/* ── MOBILE: full-screen conversation list (default) ── */}
            {/* Hidden on md+, shown on mobile only when no user selected */}
            <div className={`md:hidden flex-1 flex flex-col overflow-hidden transition-all ${selectedUser ? "hidden" : "flex"}`}>
                <PeoplePanel />
            </div>

            {/* ── MOBILE: full-screen new chat (when user selected) ── */}
            <div className={`md:hidden flex-1 flex flex-col overflow-hidden ${selectedUser ? "flex" : "hidden"}`}>
                {selectedUser && <NewChatPanel />}  {/* add this check */}
            </div>

            {/* ── DESKTOP: right panel (always visible alongside sidebar) ── */}
            <div className="hidden md:flex flex-col flex-1 overflow-hidden">
                {selectedUser ? <NewChatPanel /> : <PeoplePanel />}
            </div>

        </div>
    );
}