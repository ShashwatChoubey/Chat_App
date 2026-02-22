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
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
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

    return (
        <div className="w-64 border-r h-screen overflow-y-auto flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-bold text-lg">Messages</h2>
                <button
                    onClick={() => setShowGroupModal(true)}
                    className="text-blue-500 text-sm font-medium"
                >
                    + Group
                </button>
            </div>

            {showGroupModal && (
                <div className="p-3 border-b flex flex-col gap-2">
                    <input
                        type="text"
                        placeholder="Group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="border rounded-lg p-2 text-sm w-full"
                    />
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                        {users?.map((u) => (
                            <div
                                key={u._id}
                                onClick={() => toggleUser(u._id)}
                                className={`flex items-center gap-2 p-1 rounded cursor-pointer ${selectedUsers.includes(u._id) ? "bg-blue-100" : "hover:bg-gray-50"
                                    }`}
                            >
                                <img src={u.imageUrl} className="w-6 h-6 rounded-full" />
                                <span className="text-sm">{u.name}</span>
                                {selectedUsers.includes(u._id) && (
                                    <span className="ml-auto text-blue-500 text-xs">✓</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateGroup}
                            className="flex-1 bg-blue-500 text-white text-sm py-1 rounded-lg"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => {
                                setShowGroupModal(false);
                                setGroupName("");
                                setSelectedUsers([]);
                            }}
                            className="flex-1 border text-sm py-1 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
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

            {conversations?.length === 0 && (
                <p className="text-center text-gray-400 mt-4 p-4">No recent chats</p>
            )}

            {conversations?.map((conv) => (
                <ConversationItem key={conv._id} conv={conv} />
            ))}
        </div>
    );
}