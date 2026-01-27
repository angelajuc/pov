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

    const [mounted, setMounted] = useState(false);
    const [nowMs, setNowMs] = useState(Date.now());

    useEffect(() => {
        setMounted(true);
        setNowMs(Date.now());
        const id = setInterval(() => setNowMs(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    if(!mounted) return <span className="opacity-70">...</span>;

    return <span>{formatTimeLeft(expiresAtMs - nowMs)}</span>;
}
