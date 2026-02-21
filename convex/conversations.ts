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
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        const conversations = await ctx.db.query("conversations").collect();

        // Filter conversations where current user is a participant
        const userConversations = conversations.filter((conv) =>
            conv.participants.includes(currentUser._id)
        );

        // Get the other participant's details for each conversation
        const conversationsWithUsers = await Promise.all(
            userConversations.map(async (conv) => {
                const otherUserId = conv.participants.find(
                    (id) => id !== currentUser._id
                );
                const otherUser = await ctx.db.get(otherUserId!);
                return {
                    ...conv,
                    otherUser,
                };
            })
        );

        return conversationsWithUsers;
    },
});