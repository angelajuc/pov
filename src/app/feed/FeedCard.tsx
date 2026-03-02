"use client";

import { useEffect, useState } from "react";
import ExpiresIn from "../gallery/ExpiresIn";

type Comment = {
  id: string;
  content: string;
  email: string;
  created_at: string;
};

type Props = {
  photo: {
    id: string;
    public_url: string;
    created_at: string;
    email: string;
  };
};

export default function FeedCard({ photo }: Props) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    // Fetch likes
    fetch(`/api/photos/${photo.id}/likes`)
      .then((r) => r.json())
      .then((data) => setLikeCount(data.count ?? 0));

    // Fetch comments
    fetch(`/api/photos/${photo.id}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      });
  }, [photo.id]);

  async function toggleLike() {
    const res = await fetch(`/api/photos/${photo.id}/likes`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount((c) => (data.liked ? c + 1 : c - 1));
    }
  }

  async function postComment() {
    if (!newComment.trim()) return;
    setPosting(true);

    const res = await fetch(`/api/photos/${photo.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      // Refresh comments
      const data = await fetch(`/api/photos/${photo.id}/comments`).then((r) => r.json());
      if (Array.isArray(data)) setComments(data);
    }
    setPosting(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {photo.email && (
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {photo.email}
          </span>
        )}
        <span className="text-xs text-zinc-400">
          <ExpiresIn createdAt={photo.created_at} ttlHours={24} />
        </span>
      </div>

      {/* Image */}
      <img
        src={photo.public_url}
        alt="Photo"
        className="w-full object-cover"
        loading="lazy"
      />

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={toggleLike} className="flex items-center gap-1 transition-transform active:scale-90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={liked ? "#f9a8d4" : "#bacfd6"}
              stroke={liked ? "#f43f5e" : "#ffffff"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
        </div>

        {/* Comments */}
        {comments.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{c.email}</span>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">{c.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") postComment();
            }}
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
          <button
            onClick={postComment}
            disabled={posting || !newComment.trim()}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}