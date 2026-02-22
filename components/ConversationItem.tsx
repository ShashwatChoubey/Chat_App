"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = {
    conv: {
        _id: Id<"conversations">;
        isGroup?: boolean;
        groupName?: string;
        memberCount?: number | null;
        otherUser?: {
            _id: Id<"users">;
            name: string;
            imageUrl: string;
            isOnline?: boolean;
            lastSeen?: number;
        } | null;
        lastMessage?: {
            content: string;
            _creationTime: number;
            senderId: Id<"users">;
            senderName?: string;
        } | null;
        lastReaction?: {
            preview: string;
            _creationTime: number;
        } | null;
    };
};

export default function ConversationItem({ conv }: Props) {
    const router = useRouter();
    const unreadCount = useQuery(api.reads.getUnreadCount, {
        conversationId: conv._id,
    });

    // ── Derived display values ──────────────────────────────────────────────
    const name = conv.isGroup ? conv.groupName : conv.otherUser?.name;

    const previewText = (() => {
        if (conv.lastReaction) return conv.lastReaction.preview;
        if (!conv.lastMessage) return "No messages yet";
        if (conv.isGroup) {
            const sender = conv.lastMessage.senderName ? `${conv.lastMessage.senderName}: ` : "";
            return `${sender}${conv.lastMessage.content}`;
        }
        const isOther = conv.lastMessage.senderId === conv.otherUser?._id;
        return `${isOther ? conv.otherUser?.name : "You"}: ${conv.lastMessage.content}`;
    })();

    const timestamp = conv.lastReaction?._creationTime ?? conv.lastMessage?._creationTime;
    const hasUnread = unreadCount && unreadCount > 0;

    // ── Avatar ──────────────────────────────────────────────────────────────
    const Avatar = () => {
        if (conv.isGroup) {
            return (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
            );
        }
        return (
            <div className="relative flex-shrink-0">
                <img
                    src={conv.otherUser?.imageUrl}
                    alt={conv.otherUser?.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                {conv.otherUser?.isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                )}
            </div>
        );
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <button
            onClick={() => router.push(`/chat/${conv._id}`)}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl hover:bg-white/80 hover:shadow-sm transition-all duration-150 text-left group"
        >
            <Avatar />

            {/* Text content */}
            <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                {/* Name + time */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${hasUnread ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}>
                        {name}
                    </span>
                    {timestamp && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">
                            {formatMessageTime(timestamp)}
                        </span>
                    )}
                </div>

                {/* Preview + unread badge */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs truncate ${hasUnread ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                        {previewText}
                    </span>
                    {hasUnread && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-[10px] font-bold flex-shrink-0 shadow-sm">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>

                {/* Group member count */}
                {conv.isGroup && conv.memberCount && (
                    <span className="text-[10px] text-slate-400">{conv.memberCount} members</span>
                )}
            </div>
        </button>
    );
}