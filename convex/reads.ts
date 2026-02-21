import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return;

        const existing = await ctx.db
            .query("reads")
            .withIndex("by_userId_conversationId", (q) =>
                q.eq("userId", currentUser._id).eq("conversationId", args.conversationId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
        } else {
            await ctx.db.insert("reads", {
                conversationId: args.conversationId,
                userId: currentUser._id,
                lastReadTime: Date.now(),
            });
        }
    },
});

export const getUnreadCount = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return 0;

        const read = await ctx.db
            .query("reads")
            .withIndex("by_userId_conversationId", (q) =>
                q.eq("userId", currentUser._id).eq("conversationId", args.conversationId)
            )
            .unique();

        const lastReadTime = read?.lastReadTime ?? 0;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const unreadCount = messages.filter(
            (m) => m._creationTime > lastReadTime && m.senderId !== currentUser._id
        ).length;

        return unreadCount;
    },
});