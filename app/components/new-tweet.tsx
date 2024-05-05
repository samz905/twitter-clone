import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export default function NewTweet() {
    const insertTweet = async (formData: FormData) => {
        "use server";
        const tweet = String(formData.get("tweet"));
        const supabase = createServerActionClient<Database>({ cookies });
        const { 
            data: { user } 
        } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("tweets").insert([{ tweet: tweet, user_id: user.id }]);

            // Revalidate the cache with new tweets fetched from the db to show them in real-time without needing to refresh the page
            revalidatePath("/");
        }
    };
    
    return (
        <div>
            <form action={insertTweet} className="p-4 max-w-xl mx-auto">
                <textarea 
                    placeholder="What's happening?" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    name="tweet"
                ></textarea>
                <button 
                    type="submit" 
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    Tweet!
                </button>
            </form>
        </div>
    );
}

