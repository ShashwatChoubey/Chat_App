"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Sidebar from "@/components/Sidebar";
import { formatMessageTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/Status";


export default function ConversationPage() {
    const { conversationId } = useParams();
    const [text, setText] = useState("");
    useOnlineStatus();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearTyping = useMutation(api.typing.clearTyping);

    const markAsRead = useMutation(api.reads.markAsRead);

    useEffect(() => {
        markAsRead({ conversationId: conversationId as Id<"conversations"> });
    }, [conversationId]);

    const messages = useQuery(api.messages.getMessages, {
        conversationId: conversationId as Id<"conversations">,
    });

    const setTyping = useMutation(api.typing.setTyping);
    const typingUser = useQuery(api.typing.getTyping, {
        conversationId: conversationId as Id<"conversations">,
    });

    const currentUser = useQuery(api.users.getMe);
    const sendMessage = useMutation(api.messages.sendMessage);

    const handleSend = async () => {
        if (!text.trim()) return;
        await sendMessage({
            conversationId: conversationId as Id<"conversations">,
            content: text,
        })
        clearTyping({ conversationId: conversationId as Id<"conversations"> })
        setText("");
    };

    const router = useRouter();
    const conversation = useQuery(api.conversations.getConversationById, {
        conversationId: conversationId as Id<"conversations">,
    });

    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <div className="flex items-center gap-3 p-4 border-b">
                    <button onClick={() => router.push("/chat")}>← Back</button>
                    <div className="relative">
                        <img src={conversation?.otherUser?.imageUrl} className="w-8 h-8 rounded-full" />
                        {conversation?.otherUser?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium">{conversation?.otherUser?.name}</p>
                        <p className="text-xs text-gray-400">
                            {conversation?.otherUser?.isOnline
                                ? "Online"
                                : `Last seen ${formatMessageTime(conversation?.otherUser?.lastSeen ?? Date.now())}`}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {messages?.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Send a message to begin the conversation
                        </div>
                    )}

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

                {typingUser && (
                    <p className="text-xs text-gray-400 px-4 pb-1">{typingUser} is typing...</p>
                )}

                <div className="p-4 border-t flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                            const value = e.target.value;
                            setText(value);


                            setTyping({ conversationId: conversationId as Id<"conversations"> });


                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }


                            typingTimeoutRef.current = setTimeout(() => {
                                clearTyping({ conversationId: conversationId as Id<"conversations"> });
                            }, 2500);
                        }}
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