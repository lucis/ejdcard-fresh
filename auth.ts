import { createClient, SupabaseClient, UserResponse } from "supabase";
import { Handler } from "$fresh/server.ts";
import { getCookies } from "std/http/mod.ts";

export const RETURN_URL_QUERY_PARAM = "returnUrl";

export const DEFAULT_RETURN_URL = "/private";

const SUPABASE_PROJECT_URL = "https://nytnqaopjcnvsebekgsy.supabase.co";
const SUPABASE_ANON_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dG5xYW9wamNudnNlYmVrZ3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjYzODI4OTksImV4cCI6MTk4MTk1ODg5OX0.eHQPZYkozJyUiW6Gu0xLIMNgcuDxl3aCBIAZzN3XB0k";

export const getAnonSupabaseClient = () => {
  return createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_TOKEN);
};

export async function getSupabaseClientForUser(req: Request) {
  const cookies = getCookies(req.headers);
  const refreshToken = cookies["my-refresh-token"];
  const accessToken = cookies["my-access-token"];

  const client = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_TOKEN, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  if (refreshToken && accessToken) {
    await client.auth.setSession({
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  }

  return client;
}

export async function getUser(req: Request) {
  const client = await getSupabaseClientForUser(req);
  if (!client) {
    return null;
  }
  return client.auth.getUser();
}

export interface EjdcardState {
  user: UserResponse;
  client: SupabaseClient;
}

export function createPrivateHandler<T>(handler: Handler<T>): Handler<T> {
  return async (req, ctx) => {
    let res: Response;
    const url = new URL(req.url);
    const pathname = url.pathname;
    const client = await getSupabaseClientForUser(req);
    const user = await getUser(req);

    if (!user || user.error) {
      const returnUrlQuery = new URLSearchParams();
      returnUrlQuery.set(RETURN_URL_QUERY_PARAM, pathname);

      res = new Response(user?.error.message ?? "Redirecting to login", {
        status: 302,
        headers: { location: `/login?${returnUrlQuery.toString()}` },
      });
    } else {
      ctx.state.user = user;
      ctx.state.client = client;
      res = await handler(req, ctx);
    }
    return res;
  };
}
