"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { formatMessageTime } from "@/lib/utils";
import { useOnlineStatus } from "@/hooks/Status";

export default function Sidebar() {
    const conversations = useQuery(api.conversations.getConversations);
    const router = useRouter();
    useOnlineStatus()

    return (
        <div className="w-64 border-r h-screen overflow-y-auto flex flex-col">

            <div className="p-4 border-b">
                <h2 className="font-bold text-lg">Messages</h2>
            </div>
            {conversations?.length === 0 && (
                <p className="text-center text-gray-400 mt-4 p-4">No recent chats</p>
            )}

            {conversations?.map((conv) => (
                <div
                    key={conv._id}
                    onClick={() => router.push(`/chat/${conv._id}`)}
                    className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
                >
                    <div className="relative">
                        <img
                            src={conv.otherUser?.imageUrl}
                            alt={conv.otherUser?.name}
                            className="w-10 h-10 rounded-full"
                        />
                        {conv.otherUser?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className="font-medium">{conv.otherUser?.name}</span>
                        <span className="text-sm text-gray-500 truncate">
                            {conv.lastMessage?.content ?? "No messages yet"}
                            {conv.lastMessage && (
                                <p className="text-xs text-gray-400 mt-1">{formatMessageTime(conv.lastMessage._creationTime)}</p>
                            )}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}