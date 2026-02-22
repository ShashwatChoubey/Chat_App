"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "@/components/Sidebar";
import { formatMessageTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/Status";
import MessageItem from "@/components/MessageItem";

export default function ConversationPage() {
    const { conversationId } = useParams();
    const [text, setText] = useState("");
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const prevMessageCountRef = useRef(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useOnlineStatus();

    const clearTyping = useMutation(api.typing.clearTyping);
    const markAsRead = useMutation(api.reads.markAsRead);
    const setTyping = useMutation(api.typing.setTyping);
    const sendMessage = useMutation(api.messages.sendMessage);

    const messages = useQuery(api.messages.getMessages, {
        conversationId: conversationId as Id<"conversations">,
    });
    const typingUser = useQuery(api.typing.getTyping, {
        conversationId: conversationId as Id<"conversations">,
    });
    const currentUser = useQuery(api.users.getMe);
    const conversation = useQuery(api.conversations.getConversationById, {
        conversationId: conversationId as Id<"conversations">,
    });

    const [sendError, setSendError] = useState<string | null>(null);

    useEffect(() => {
        markAsRead({ conversationId: conversationId as Id<"conversations"> });
    }, [conversationId]);

    useEffect(() => {
        if (!messages) return;
        const currentCount = messages.length;
        const prevCount = prevMessageCountRef.current;
        if (currentCount > prevCount) {
            markAsRead({ conversationId: conversationId as Id<"conversations"> });
            if (isAtBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                setHasNewMessages(false);
            } else {
                setHasNewMessages(true);
            }
        }
        prevMessageCountRef.current = currentCount;
    }, [messages]);

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        setIsAtBottom(isNearBottom);
        if (isNearBottom) setHasNewMessages(false);
    };

    const handleSend = async () => {
        if (!text.trim()) return;
        try {
            setSendError(null);
            await sendMessage({
                conversationId: conversationId as Id<"conversations">,
                content: text,
            });
            clearTyping({ conversationId: conversationId as Id<"conversations"> });
            setText("");
            setIsAtBottom(true);
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setHasNewMessages(false);
        } catch {
            setSendError("Failed to send message. Try again.");
        }
    };

    const handleTyping = (value: string) => {
        setText(value);
        setTyping({ conversationId: conversationId as Id<"conversations"> });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            clearTyping({ conversationId: conversationId as Id<"conversations"> });
        }, 2500);
    };

    // ── Header content ────────────────────────────────────────────────────
    const HeaderContent = () => {
        if (!conversation) {
            return (
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
                    <div className="flex flex-col gap-1.5">
                        <div className="w-24 h-3.5 rounded-full bg-slate-100 animate-pulse" />
                        <div className="w-16 h-2.5 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                </div>
            );
        }

        if (conversation.isGroup) {
            return (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{conversation.groupName}</p>
                        <p className="text-xs text-slate-400 truncate">
                            {conversation.memberCount} members · {conversation.memberNames}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <img
                        src={conversation.otherUser?.imageUrl}
                        alt={conversation.otherUser?.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                    {conversation.otherUser?.isOnline && (
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{conversation.otherUser?.name}</p>
                    <p className="text-xs text-slate-400">
                        {conversation.otherUser?.isOnline
                            ? "Online"
                            : `Last seen ${formatMessageTime(conversation.otherUser?.lastSeen ?? Date.now())}`}
                    </p>
                </div>
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="flex h-screen bg-[#F0F4FF] overflow-hidden">
            {/* Sidebar: hidden on mobile, shown on md+ */}
            <Sidebar />

            {/* Chat panel: full screen on mobile, flex-1 alongside sidebar on md+ */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 bg-white/70 backdrop-blur border-b border-slate-100 shadow-sm flex-shrink-0">
                    <button
                        onClick={() => router.push("/chat")}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0 md:hidden"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </button>
                    {/* Desktop back button */}
                    <button
                        onClick={() => router.push("/chat")}
                        className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                    </button>
                    <HeaderContent />
                </div>

                {/* Messages area */}
                <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2"
                >
                    {/* Loading spinner */}
                    {messages === undefined && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
                        </div>
                    )}

                    {/* Empty state — identical to new conversation empty state */}
                    {messages?.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">
                                Say hello to {conversation?.isGroup ? conversation.groupName : conversation?.otherUser?.name?.split(" ")[0]}!
                            </p>
                            <p className="text-slate-400 text-xs">Send your first message to start the conversation.</p>
                        </div>
                    )}

                    {/* Messages */}
                    {messages?.map((message) => {
                        const isMe = message.senderId === currentUser?._id;
                        return (
                            <MessageItem
                                key={message._id}
                                message={message}
                                isMe={isMe}
                                currentUserId={currentUser?._id as Id<"users">}
                                isGroup={conversation?.isGroup}
                            />
                        );
                    })}

                    <div ref={messagesEndRef} />
                </div>

                {/* New messages pill */}
                {hasNewMessages && !isAtBottom && (
                    <div className="flex justify-center pb-2 flex-shrink-0">
                        <button
                            onClick={() => {
                                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                                setIsAtBottom(true);
                                setHasNewMessages(false);
                            }}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                            </svg>
                            New messages
                        </button>
                    </div>
                )}

                {/* Typing indicator */}
                {typingUser && (
                    <div className="px-5 pb-1 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-xs text-slate-400">{typingUser} is typing</span>
                        </div>
                    </div>
                )}

                {/* Send error */}
                {sendError && (
                    <div className="mx-4 mb-2 flex items-center justify-between gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs flex-shrink-0">
                        <span>{sendError}</span>
                        <button onClick={handleSend} className="font-semibold underline underline-offset-2">Retry</button>
                    </div>
                )}

                {/* Input bar */}
                <div className="px-4 pb-5 pt-3 bg-white/60 backdrop-blur border-t border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-300 transition-all">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => handleTyping(e.target.value)}
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

            </div>
        </div>
    );
}