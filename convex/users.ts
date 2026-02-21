import { mutation, query } from "./_generated/server";
import { v } from "convex/values";





export const createUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (existingUser) {
            return existingUser._id;
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            email: identity.email ?? "",
            name: identity.nickname ?? identity.name ?? "",
            imageUrl: identity.pictureUrl ?? "",
            username: identity.nickname ?? identity.email ?? "",
            isOnline: true,
            lastSeen: Date.now()
        });

        return userId;
    },
});

export const getUsers = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return [];
        }

        const users = await ctx.db.query("users").collect();

        return users.filter((user) => user.clerkId !== identity.subject);
    },
});

export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        return user;
    },
});

export const setOnline = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        await ctx.db.patch(user._id, {
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

export const setOffline = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        await ctx.db.patch(user._id, {
            isOnline: false,
            lastSeen: Date.now(),
        });
    },
});