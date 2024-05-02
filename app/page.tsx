import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonServer from "./components/auth-button-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

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
  const { data: tweets, error } = await supabase.from("tweets").select("*");

  return (
    <div>
      <AuthButtonServer />
      <pre>{JSON.stringify(tweets, null, 2)}</pre>
    </div>
  );
}
