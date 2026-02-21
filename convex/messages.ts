import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            content: args.content,
        });
    },
});

export const getMessages = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        return messages;
    },
});

export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        if (message.senderId !== currentUser._id) throw new Error("Unauthorized");

        await ctx.db.patch(args.messageId, { isDeleteMessage: true });
    },
});