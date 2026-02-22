import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        imageUrl: v.string(),
        username: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number()
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        participants: v.array(v.id("users")),
        isGroup: v.optional(v.boolean()),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.string()),

    }),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        isDeleteMessage: v.optional(v.boolean()),

    }).index("by_conversationId", ["conversationId"]),

    typing: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastTyped: v.number(),
    }).index("by_conversationId", ["conversationId"]),

    reads: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastReadTime: v.number(),
    }).index("by_conversationId", ["conversationId"])
        .index("by_userId_conversationId", ["userId", "conversationId"]),

    reactions: defineTable({
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    }).index("by_messageId", ["messageId"]),


});