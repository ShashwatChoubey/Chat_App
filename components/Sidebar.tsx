"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { formatMessageTime } from "@/lib/utils";

export default function Sidebar() {
    const conversations = useQuery(api.conversations.getConversations);
    const router = useRouter();

    return (
        <div className="w-64 border-r h-screen overflow-y-auto flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-bold text-lg">Messages</h2>
            </div>

            {conversations?.map((conv) => (
                <div
                    key={conv._id}
                    onClick={() => router.push(`/chat/${conv._id}`)}
                    className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
                >
                    <img
                        src={conv.otherUser?.imageUrl}
                        alt={conv.otherUser?.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="flex flex-col">
                        <span className="font-medium">{conv.otherUser?.name}</span>
                        <span className="text-sm text-gray-500 truncate">
                            {conv.lastMessage?.content ?? "No messages yet"}
                            <p className="text-xs text-gray-400 mt-1">{formatMessageTime(conv.lastMessage._creationTime)}</p>
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}