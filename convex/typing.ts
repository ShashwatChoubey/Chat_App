import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), currentUser._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { lastTyped: Date.now() });
        } else {
            await ctx.db.insert("typing", {
                conversationId: args.conversationId,
                userId: currentUser._id,
                lastTyped: Date.now(),
            });
        }
    },
});

export const getTyping = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return null;

        const typingUsers = await ctx.db
            .query("typing")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();


        const activeTypers = typingUsers.filter(
            (t) =>
                t.userId !== currentUser._id

        );

        if (activeTypers.length === 0) return null;

        const typingUser = await ctx.db.get(activeTypers[0].userId);
        return typingUser?.name;
    },
});

export const clearTyping = mutation({
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
            .query("typing")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), currentUser._id))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});