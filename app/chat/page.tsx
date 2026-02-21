"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "@/components/Sidebar";

type User = {
    _id: Id<"users">;
    name: string;
    imageUrl: string;
    email: string;
    username: string;
    clerkId: string;
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

    useEffect(() => {
        if (isLoaded && user) {
            createUser();
        }
    }, [isLoaded, user, createUser]);

    const handleClick = (clickedUser: User) => {
        // Check if conversation already exists
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

        const conversationId = await createConversation({
            participantId: selectedUser._id,
        });

        await sendMessage({
            conversationId: conversationId as Id<"conversations">,
            content: text,
        });

        setText("");
        router.push(`/chat/${conversationId}`);
    };

    const filteredUsers = users?.filter((u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex flex-col flex-1">
                {selectedUser ? (
                    <>
                        <div className="flex items-center gap-3 p-4 border-b">
                            <button onClick={() => setSelectedUser(null)} className="text-gray-500">
                                ← Back
                            </button>
                            <img src={selectedUser.imageUrl} alt={selectedUser.name} className="w-8 h-8 rounded-full" />
                            <span className="font-medium">{selectedUser.name}</span>
                        </div>

                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Send a message to begin the conversation
                        </div>

                        <div className="p-4 border-t flex gap-2">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 border rounded-lg p-2"
                            />
                            <button
                                onClick={handleSend}
                                className="px-4 py-2 bg-black text-white rounded-lg"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h1 className="text-xl font-bold">Chat App</h1>
                            <UserButton />
                        </div>

                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full border rounded-lg p-2 mb-4"
                            />

                            {users?.length === 0 && (
                                <p className="text-center text-gray-400 mt-4">
                                    Invite more people to start chatting!
                                </p>
                            )}

                            {filteredUsers?.length === 0 && userSearch && (
                                <p className="text-center text-gray-400 mt-4">No users found</p>
                            )}

                            <div className="flex flex-col gap-2">
                                {filteredUsers?.map((u) => (
                                    <div
                                        key={u._id}
                                        onClick={() => handleClick(u as User)}
                                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                    >
                                        <img
                                            src={u.imageUrl}
                                            alt={u.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <span>{u.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}