import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useOnlineStatus() {
    const setOnline = useMutation(api.users.setOnline);
    const setOffline = useMutation(api.users.setOffline);

    useEffect(() => {
        setOnline();

        return () => {
            setOffline();
        };
    }, [setOnline, setOffline]);
}