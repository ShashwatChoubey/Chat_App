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
import MessageItem from "@/components/MessageItem";

export default function ConversationPage() {
    const { conversationId } = useParams();
    const [text, setText] = useState("");
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const prevMessageCountRef = useRef(0);
    useOnlineStatus();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

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
    const router = useRouter();
    const conversation = useQuery(api.conversations.getConversationById, {
        conversationId: conversationId as Id<"conversations">,
    });
    const [sendError, setSendError] = useState<string | null>(null);

    useEffect(() => {
        if (!messages) return;

        const currentCount = messages.length;
        const prevCount = prevMessageCountRef.current;

        if (currentCount > prevCount) {
            markAsRead({ conversationId: conversationId as Id<"conversations"> });
            if (isAtBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                setHasNewMessages(false);
            } else {
                setHasNewMessages(true);
            }
        }

        prevMessageCountRef.current = currentCount;
    }, [messages]);


    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        setIsAtBottom(isNearBottom);
        if (isNearBottom) setHasNewMessages(false);
    };

    const handleSend = async () => {
        if (!text.trim()) return;
        try {
            setSendError(null);
            await sendMessage({
                conversationId: conversationId as Id<"conversations">,
                content: text,
            });
            clearTyping({ conversationId: conversationId as Id<"conversations"> });
            setText("");
            setIsAtBottom(true);
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setHasNewMessages(false);
        } catch (error) {
            setSendError("Failed to send message. Try again.");
        }
    };



    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex items-center gap-3 p-4 border-b">
                <button onClick={() => router.push("/chat")}>← Back</button>

                {conversation?.isGroup ? (
                    <>
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {conversation.groupName?.[0]}
                        </div>
                        <div>
                            <p className="font-medium">{conversation.groupName}</p>
                            <p className="text-xs text-gray-400">{conversation.memberCount} members · {conversation.memberNames}</p>


                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>
            {messages === undefined && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
            >
                {messages?.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Send a message to begin the conversation
                    </div>
                )}

                {messages?.map((message) => {
                    const isMe = message.senderId === currentUser?._id;
                    return (
                        <MessageItem
                            key={message._id}
                            message={message}
                            isMe={isMe}
                            currentUserId={currentUser?._id as Id<"users">}
                            isGroup={conversation?.isGroup}
                        />
                    );
                })}



                <div ref={messagesEndRef} />
            </div>

            {hasNewMessages && !isAtBottom && (
                <button
                    onClick={() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                        setIsAtBottom(true);
                        setHasNewMessages(false);
                    }}
                    className="mx-auto mb-2 px-4 py-1 bg-blue-500 text-white text-sm rounded-full"
                >
                    ↓ New messages
                </button>
            )}

            {typingUser && (
                <p className="text-xs text-gray-400 px-4 pb-1">{typingUser} is typing...</p>
            )}
            {sendError && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 text-sm">
                    <span>{sendError}</span>
                    <button onClick={handleSend} className="underline font-medium">Retry</button>
                </div>
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

    );
}