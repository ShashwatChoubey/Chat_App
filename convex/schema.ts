import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        imageUrl: v.string(),
        username: v.string(),
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        participants: v.array(v.id("users")),

    }),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),

    }).index("by_conversationId", ["conversationId"]),
});