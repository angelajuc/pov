"use client";

import { useEffect, useMemo, useState } from "react";

function formatTimeLeft(ms: number) {
    if (ms <= 0) return "Expired";

    const totalMinutes = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
}

export default function ExpiresIn({ createdAt, ttlHours = 24, }: {
    createdAt: string;
    ttlHours?: number;
}) {
    const expiresAtMs = useMemo(() => {
        return new Date(createdAt).getTime() + ttlHours * 60 * 60 * 1000;
    }, [createdAt, ttlHours]);

    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    return <span>{formatTimeLeft(expiresAtMs - nowMs)}</span>;
}
