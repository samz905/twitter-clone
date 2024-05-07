import { User, createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import { revalidatePath } from "next/cache";

export default function NewTweet({ user }: { user: User }) {
    const insertTweet = async (formData: FormData) => {
        "use server";
        const tweet = String(formData.get("tweet"));
        const supabase = createServerActionClient<Database>({ cookies });

        await supabase.from("tweets").insert([{ tweet: tweet, user_id: user.id }]);

        // Revalidate the cache with new tweets fetched from the db to show them in real-time without needing to refresh the page
        revalidatePath("/");
    };

    return (
        <form className="border border-gray-800 border-t-0 py-4 px-4" action={insertTweet}>
            <div className="flex">
                <div className="h-12 w-12">
                <Image
                    src={user.user_metadata.avatar_url}
                    alt="user avatar"
                    width={48}
                    height={48}
                    className="rounded-full"
                />
                </div>
                <input
                    name="tweet"
                    className="bg-inherit flex-1 ml-4 mb-4 text-2xl leading-loose placeholder-gray-500 px-2"
                    placeholder="What is happening?!"
                />
            </div>
            <div className="flex justify-end">
                <button 
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 rounded-full "
                >
                    Tweet
                </button>
            </div>
        </form>
    );
}