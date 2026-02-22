"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

type Props = {
    message: {
        _id: Id<"messages">;
        content: string;
        senderId: Id<"users">;
        senderName?: string;
        _creationTime: number;
        isDeleteMessage?: boolean;
    };
    isMe: boolean;
    currentUserId: Id<"users">;
    isGroup?: boolean;
};

export default function MessageItem({ message, isMe, currentUserId, isGroup }: Props) {
    const [showEmojis, setShowEmojis] = useState(false);
    const emojiRef = useRef<HTMLDivElement>(null);

    const reactions = useQuery(api.reactions.getReactions, { messageId: message._id });
    const toggleReaction = useMutation(api.reactions.toggleReaction);
    const deleteMessage = useMutation(api.messages.deleteMessage);

    const canDelete = isMe && !message.isDeleteMessage && Date.now() - message._creationTime < 5 * 60 * 1000;
    const hasReactions = reactions && reactions.some((r) => r.count > 0);

    // Close emoji picker on outside click
    useEffect(() => {
        if (!showEmojis) return;
        const handle = (e: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setShowEmojis(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [showEmojis]);

    return (
        <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>

            {/* Sender name for group chats */}
            {!isMe && isGroup && !message.isDeleteMessage && (
                <p className="text-[11px] font-semibold text-indigo-400 px-1">{message.senderName}</p>
            )}

            <div className={`flex items-end gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {/* Bubble */}
                <div
                    className={`relative group flex flex-col px-4 py-2.5 rounded-2xl shadow-sm ${message.isDeleteMessage
                        ? "bg-slate-100 border border-slate-200"
                        : isMe
                            ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-br-sm"
                            : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
                        }`}
                >
                    {message.isDeleteMessage ? (
                        <p className="text-xs italic text-slate-400">This message was deleted</p>
                    ) : (
                        <>
                            <p className={`text-sm leading-relaxed ${isMe ? "text-white" : "text-slate-800"}`}>
                                {message.content}
                            </p>

                            {/* Timestamp + emoji trigger */}
                            <div className={`flex items-center gap-2 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                <span className={`text-[10px] tabular-nums ${isMe ? "text-blue-100" : "text-slate-400"}`}>
                                    {formatMessageTime(message._creationTime)}
                                </span>

                                {/* Emoji trigger button — fades in on hover */}
                                <button
                                    onClick={() => setShowEmojis((v) => !v)}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity text-[13px] leading-none ${isMe ? "text-blue-100 hover:text-white" : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    😊
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Emoji picker — outside bubble, closes on outside click */}
            {showEmojis && !message.isDeleteMessage && (
                <div
                    ref={emojiRef}
                    className={`flex items-center gap-1 px-2 py-1.5 bg-white border border-slate-200 rounded-2xl shadow-md ${isMe ? "mr-1" : "ml-1"}`}
                >
                    {EMOJIS.map((emoji) => {
                        const reaction = reactions?.find((r) => r.emoji === emoji);
                        const hasReacted = reaction?.users.includes(currentUserId);
                        return (
                            <button
                                key={emoji}
                                onClick={() => {
                                    toggleReaction({ messageId: message._id, emoji });
                                    setShowEmojis(false);
                                }}
                                className={`flex items-center justify-center w-8 h-8 rounded-xl text-base transition-all hover:scale-110 active:scale-95 ${hasReacted ? "bg-indigo-50 ring-1 ring-indigo-200" : "hover:bg-slate-50"
                                    }`}
                            >
                                {emoji}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Reaction counts */}
            {hasReactions && !message.isDeleteMessage && (
                <div className={`flex flex-wrap gap-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    {reactions
                        ?.filter((r) => r.count > 0)
                        .map((r) => {
                            const hasReacted = r.users.includes(currentUserId);
                            return (
                                <button
                                    key={r.emoji}
                                    onClick={() => toggleReaction({ messageId: message._id, emoji: r.emoji })}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${hasReacted
                                        ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <span>{r.emoji}</span>
                                    <span>{r.count}</span>
                                </button>
                            );
                        })}
                </div>
            )}

            {/* Delete — below bubble, only for sender, fades in on hover */}
            {canDelete && (
                <button
                    onClick={() => deleteMessage({ messageId: message._id })}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-red-400 transition-colors px-1"
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                    </svg>
                    Delete
                </button>
            )}
        </div>
    );
}