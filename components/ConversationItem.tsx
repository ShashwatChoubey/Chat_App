"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Props = {
    conv: {
        _id: Id<"conversations">;
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
        } | null;
    };
};

export default function ConversationItem({ conv }: Props) {
    const router = useRouter();
    const unreadCount = useQuery(api.reads.getUnreadCount, {
        conversationId: conv._id,
    });

    return (
        <div
            onClick={() => router.push(`/chat/${conv._id}`)}
            className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
        >
            <div className="relative flex-shrink-0">
                <img
                    src={conv.otherUser?.imageUrl}
                    alt={conv.otherUser?.name}
                    className="w-10 h-10 rounded-full"
                />
                {conv.otherUser?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-medium">{conv.otherUser?.name}</span>
                    {conv.lastMessage && (
                        <span className="text-xs text-gray-400">
                            {formatMessageTime(conv.lastMessage._creationTime)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 truncate">
                        {conv.lastMessage?.content ?? "No messages yet"}
                    </span>
                    {unreadCount ? (
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}