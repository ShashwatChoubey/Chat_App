export function formatMessageTime(creationTime: number): string {
    const messageDate = new Date(creationTime);
    const now = new Date();

    const isToday = messageDate.toDateString() === now.toDateString();
    const isThisYear = messageDate.getFullYear() === now.getFullYear();

    const timeStr = messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    if (isToday) {
        return timeStr;
    }

    const dateStr = messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(isThisYear ? {} : { year: "numeric" }),
    });

    return `${dateStr}, ${timeStr}`;
}