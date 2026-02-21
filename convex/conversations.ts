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

                // Get last message
                const messages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .collect();

                const lastMessage = messages[messages.length - 1] ?? null;

                return {
                    ...conv,
                    otherUser,
                    lastMessage,
                };
            })
        );

        return conversationsWithDetails;
    },
});