import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
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
            .query("reactions")
            .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), currentUser._id),
                    q.eq(q.field("emoji"), args.emoji)
                )
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: currentUser._id,
                emoji: args.emoji,
            });
        }
    },
});

export const getReactions = query({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
            .collect();

        const grouped: Record<string, { count: number; users: string[] }> = {};

        for (const reaction of reactions) {
            if (!grouped[reaction.emoji]) {
                grouped[reaction.emoji] = { count: 0, users: [] };
            }
            grouped[reaction.emoji].count++;
            grouped[reaction.emoji].users.push(reaction.userId);
        }

        return Object.entries(grouped).map(([emoji, data]) => ({
            emoji,
            count: data.count,
            users: data.users,
        }));
    },
});