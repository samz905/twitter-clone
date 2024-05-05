import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonServer from "./components/auth-button-server";
import { redirect } from "next/navigation";
import NewTweet from "./components/new-tweet";
import Likes from "./components/likes";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

  // The next 7 lines (including the space in between) is how you protect routes from logged out users
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // The db has a RLS policy that only allows authenticated users to view all tweets
  // After auth, the user is redirected to the /auth/callback route (redirectURL of auth) where the code is exchanged for an access token (session)
  // If the session expires, the middleware will use the access token in the request to generate a new session
  // The user is then redirected back to the home page where the below line fetches tweets from the db for authenticated users to view
  const { data } = await supabase
    .from("tweets")
    .select("*, author: profiles(*), likes(user_id)");

  const tweets =
    data?.map((tweet) => ({
      ...tweet,
      author: Array.isArray(tweet.author) ? tweet.author[0] : tweet.author,
      user_has_liked_tweet: !!tweet.likes.find(
        (like: any) => like.user_id === session.user.id
      ),
      likes: tweet.likes.length,
    })) ?? [];

  return (
    <>
      <AuthButtonServer />
      <NewTweet />
      {tweets?.map((tweet) => (
        <div key={tweet.id}>
          <p>
            {tweet.author.name} {tweet.author.email}
          </p>
          <p>{tweet.tweet}</p>
          <Likes tweet={tweet} />
        </div>
      ))}
    </>
  );
}
