# Real-Time Chat Application

A full-stack real-time chat application built with Next.js, Convex, Clerk, and Tailwind CSS.  
Supports one-to-one messaging, group chats, reactions, typing indicators, unread tracking, and live sidebar activity updates.

## Live Demo
Deploy Link:https://chat-app-sable-chi.vercel.app/

## Architecture

The app is structured into React components, Convex backend functions, and reusable hooks.
Realtime updates are handled through Convex queries and subscriptions.

##  Local Setup

1. Clone the repo
2. Install dependencies

npm install

3. Add environment variables:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

CLERK_SECRET_KEY=

NEXT_PUBLIC_CONVEX_URL=

4. Run development server

npm run dev

## Highlight Feature

**Real-Time Activity Preview in Sidebar**

The sidebar dynamically updates based on the latest conversation activity.  
The conversation preview reflects both new messages and recent reactions in real time, helping users understand what changed without opening the chat.
