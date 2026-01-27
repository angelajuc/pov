"use client";

import { useState } from "react";
import ExpiresIn from "./ExpiresIn";

export default function PhotoTile({ id, public_url, created_at, }: {
    id: string;
    public_url: string;
    created_at: string;
}) {
    const [show, setShow] = useState(false);

    return (
        <a
            href={public_url}
            target="_blank"
            rel="noreferrer"
            className="group relative block"
            onClick={(e) => {
                // First tap shows overlay, second tap opens the image.
                /*
                if (!show) {
                    e.preventDefault();
                    setShow(true);
                }
                 */
                if (window.matchMedia("(hover: none)").matches) {
                    e.preventDefault();
                    setShow((s) => !s);
                }
            }}
            //onBlur={() => setShow(false)}
        >
            <img
                src={public_url}
                alt="Uploaded"
                className="aspect-square w-full rounded-xl object-cover border border-black/[.08] dark:border-white/[.145]"
                loading="lazy"
            />

            <div
                className={[
                    "pointer-events-none absolute inset-0 flex items-end rounded-xl transition duration-200",
                    // Desktop hover
                    "sm:opacity-0 sm:group-hover:opacity-100 sm:bg-black/0 sm:group-hover:bg-black/40",
                    // Mobile tap-toggle
                    show ? "opacity-100 bg-black/40" : "opacity-0 bg-black/0 sm:bg-black/0",
                ].join(" ")}
            >
                <div className="m-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                    Expires in <ExpiresIn createdAt={created_at} ttlHours={24} />
                </div>
            </div>
        </a>
    );
}
