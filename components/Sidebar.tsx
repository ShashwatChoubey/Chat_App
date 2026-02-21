"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOnlineStatus } from "@/hooks/Status";
import ConversationItem from "./ConversationItem";
import Skeleton from "./Skeleton";

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
            {conversations === undefined && (
                <div className="flex flex-col gap-2 p-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex flex-col gap-2 flex-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {conversations?.map((conv) => (
                <ConversationItem key={conv._id} conv={conv} />
            ))}
        </div>
    );
}