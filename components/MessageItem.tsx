"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

type Props = {
    message: {
        _id: Id<"messages">;
        content: string;
        senderId: Id<"users">;
        _creationTime: number;
        isDeleteMessage?: boolean;
    };
    isMe: boolean;
    currentUserId: Id<"users">;
};

export default function MessageItem({ message, isMe, currentUserId }: Props) {
    const reactions = useQuery(api.reactions.getReactions, {
        messageId: message._id,
    });
    const toggleReaction = useMutation(api.reactions.toggleReaction);
    const deleteMessage = useMutation(api.messages.deleteMessage);

    return (
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
            <div
                className={`p-2 rounded-lg max-w-xs ${isMe ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
                    }`}
            >
                {message.isDeleteMessage ? (
                    <p className="italic text-gray-400 text-sm">This message was deleted</p>
                ) : (
                    <>
                        <p>{message.content}</p>
                        {isMe && !message.isDeleteMessage && Date.now() - message._creationTime < 5 * 60 * 1000 && (
                            <button
                                onClick={() => deleteMessage({ messageId: message._id })}
                                className="text-xs text-red-400 mt-1"
                            >
                                Delete
                            </button>
                        )}
                    </>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatMessageTime(message._creationTime)}</p>
            </div>

            {!message.isDeleteMessage && (
                <div className="flex gap-1 mt-1">
                    {EMOJIS.map((emoji) => {
                        const reaction = reactions?.find((r) => r.emoji === emoji);
                        const hasReacted = reaction?.users.includes(currentUserId);
                        return (
                            <button
                                key={emoji}
                                onClick={() => toggleReaction({ messageId: message._id, emoji })}
                                className={`text-xs px-1 rounded ${hasReacted ? "bg-blue-100" : "hover:bg-gray-100"
                                    }`}
                            >
                                {emoji} {reaction?.count ? reaction.count : ""}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}