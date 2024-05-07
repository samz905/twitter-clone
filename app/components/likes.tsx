"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Likes({
  tweet,
  addOptimisticTweet,
}: {
  tweet: TweetWithAuthor;
  addOptimisticTweet: (newTweet: TweetWithAuthor) => void;
}) {
    const supabase = createClientComponentClient<Database>();
    const router = useRouter();

    useEffect(() => {
        const channel = supabase
          .channel("realtime likes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "likes",
            },
            (payload) => {
              router.refresh();
            }
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(channel);
        };
      }, [supabase, router]);
    
    const handleLikes = async () => {
        const {
        data: { user },
        } = await supabase.auth.getUser();

        if (user) {
        if (tweet.user_has_liked_tweet) {
            addOptimisticTweet({
            ...tweet,
            likes: tweet.likes - 1,
            user_has_liked_tweet: !tweet.user_has_liked_tweet,
            });
            await supabase
            .from("likes")
            .delete()
            .match({ user_id: user.id, tweet_id: tweet.id });
        } else {
            addOptimisticTweet({
            ...tweet,
            likes: tweet.likes + 1,
            user_has_liked_tweet: !tweet.user_has_liked_tweet,
            });
            await supabase
            .from("likes")
            .insert({ user_id: user.id, tweet_id: tweet.id });
        }
        }
    };

    return (
        <button onClick={handleLikes} className="group flex items-center">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`group-hover:fill-red-600 group-hover:stroke-red-600 ${
            tweet.user_has_liked_tweet
                ? "fill-red-600 stroke-red-600"
                : "fill-none stroke-gray-500"
            }`}
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span
            className={`ml-2 text-sm group-hover:text-red-600 ${
            tweet.user_has_liked_tweet ? "text-red-600" : "text-gray-500"
            }`}
        >
            {tweet.likes}
        </span>
        </button>
    );
}