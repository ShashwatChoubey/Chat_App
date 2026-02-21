"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "@/components/Sidebar";
import { formatMessageTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ConversationPage() {
    const { conversationId } = useParams();
    const [text, setText] = useState("");

    const messages = useQuery(api.messages.getMessages, {
        conversationId: conversationId as Id<"conversations">,
    });

    const currentUser = useQuery(api.users.getMe);
    const sendMessage = useMutation(api.messages.sendMessage);

    const handleSend = async () => {
        if (!text.trim()) return;
        await sendMessage({
            conversationId: conversationId as Id<"conversations">,
            content: text,
        });
        setText("");
    };

    const router = useRouter();


    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {messages?.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Send a message to begin the conversation
                        </div>
                    )}

                    <button onClick={() => router.push("/chat")}>← Back</button>
                    {messages?.map((message) => {
                        const isMe = message.senderId === currentUser?._id;
                        return (
                            <div
                                key={message._id}
                                className={`p-2 rounded-lg max-w-xs ${isMe
                                    ? "ml-auto bg-blue-100 text-right"
                                    : "mr-auto bg-gray-100 text-left"
                                    }`}
                            >
                                {message.content}
                                <p className="text-xs text-gray-400 mt-1">{formatMessageTime(message._creationTime)}</p>
                            </div>
                        );
                    })}
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
            </div>
        </div>
    );
}