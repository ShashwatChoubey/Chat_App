"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "@/components/Sidebar";

export default function Home() {
    const { user, isLoaded } = useUser();
    const createUser = useMutation(api.users.createUser);
    const router = useRouter();
    const [userSearch, setUserSearch] = useState("");
    const users = useQuery(api.users.getUsers);
    const createConversation = useMutation(api.conversations.createConversation);

    useEffect(() => {
        if (isLoaded && user) {
            createUser();
        }
    }, [isLoaded, user, createUser]);

    const handleClick = async (participantId: Id<"users">) => {
        const conversationId = await createConversation({ participantId });
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

                    <div className="flex flex-col gap-2">
                        {filteredUsers?.map((u) => (
                            <div
                                key={u._id}
                                onClick={() => handleClick(u._id)}
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
            </div>
        </div>
    );
}