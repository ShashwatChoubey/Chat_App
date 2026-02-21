"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
    const { user, isLoaded } = useUser();
    const createUser = useMutation(api.users.createUser);
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            createUser();
        }
    }, [isLoaded, user, createUser]);

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Chat App</h1>
            <UserButton />
        </div>

    );
}