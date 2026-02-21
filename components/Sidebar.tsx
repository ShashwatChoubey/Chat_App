"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOnlineStatus } from "@/hooks/Status";
import ConversationItem from "./ConversationItem";

export default function Sidebar() {
    const conversations = useQuery(api.conversations.getConversations);
    useOnlineStatus();

    return (
        <div className="w-64 border-r h-screen overflow-y-auto flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-bold text-lg">Messages</h2>
            </div>

            {conversations?.length === 0 && (
                <p className="text-center text-gray-400 mt-4 p-4">No recent chats</p>
            )}

            {conversations?.map((conv) => (
                <ConversationItem key={conv._id} conv={conv} />
            ))}
        </div>
    );
}