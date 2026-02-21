import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const createConversation = mutation({
    args: {
        participantId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Check if conversation already exists
        const existingConversation = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.or(
                    q.and(
                        q.eq(q.field("participants"), [currentUser._id, args.participantId]),
                    ),
                    q.and(
                        q.eq(q.field("participants"), [args.participantId, currentUser._id]),
                    )
                )
            )
            .unique();

        if (existingConversation) {
            return existingConversation._id;
        }

        const conversationId = await ctx.db.insert("conversations", {
            participants: [currentUser._id, args.participantId],
        });

        return conversationId;
    },
});

export const getConversations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        const conversations = await ctx.db.query("conversations").collect();

        const userConversations = conversations.filter((conv) =>
            conv.participants.includes(currentUser._id)
        );

        const conversationsWithDetails = await Promise.all(
            userConversations.map(async (conv) => {
                const otherUserId = conv.participants.find(
                    (id) => id !== currentUser._id
                );
                const otherUser = await ctx.db.get(otherUserId!);

                const messages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .collect();

                const lastMessage = messages[messages.length - 1] ?? null;


                let lastReaction = null;
                for (const message of messages) {
                    const reactions = await ctx.db
                        .query("reactions")
                        .withIndex("by_messageId", (q) => q.eq("messageId", message._id))
                        .collect();

                    for (const reaction of reactions) {
                        if (!lastReaction || reaction._creationTime > lastReaction._creationTime) {
                            const reactor = await ctx.db.get(reaction.userId);
                            const messageOwner = await ctx.db.get(message.senderId);
                            const reactorName = reaction.userId === currentUser._id ? "You" : reactor?.name ?? "Someone";
                            const ownerName = message.senderId === currentUser._id ? "your" : `${messageOwner?.name}'s`;

                            lastReaction = {
                                _creationTime: reaction._creationTime,
                                preview: `${reactorName} reacted ${reaction.emoji} to ${ownerName} message`,
                            };
                        }
                    }
                }

                // Compare lastMessage and lastReaction timestamps
                let preview = null;
                if (lastMessage && lastReaction) {
                    preview = lastReaction._creationTime > lastMessage._creationTime ? lastReaction : null;
                } else if (lastReaction) {
                    preview = lastReaction;
                }

                return {
                    ...conv,
                    otherUser,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        _creationTime: lastMessage._creationTime,
                        senderId: lastMessage.senderId,
                    } : null,
                    lastReaction: preview,
                };
            })
        );

        return conversationsWithDetails;
    },
});





export const getConversationById = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return null;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return null;

        const otherUserId = conversation.participants.find(
            (id) => id !== currentUser._id
        );
        const otherUser = await ctx.db.get(otherUserId!);

        return { ...conversation, otherUser };
    },
});