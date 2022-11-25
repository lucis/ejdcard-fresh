import LoginButtons from "$ejdcard/components/LoginButtons.tsx";
import { Handler, PageProps } from "$fresh/server.ts";
import { getSupabaseClientForUser } from "$ejdcard/auth.ts";

export const RETURN_URL_QUERY_PARAM = "returnUrl";

export const DEFAULT_RETURN_URL = "/cards";

type LoginData = {
  loginLinks: {
    google: string;
  };
};

export const handler: Handler<LoginData> = async (req, ctx) => {
  const url = new URL(req.url);
  const query = new URLSearchParams(url.search);
  const providedReturnUrl = query.get(RETURN_URL_QUERY_PARAM);
  const returnUrl = providedReturnUrl || DEFAULT_RETURN_URL;

  const successQueryParams = new URLSearchParams();
  successQueryParams.set(RETURN_URL_QUERY_PARAM, returnUrl);

  const redirectTo =
    url.protocol +
    "//" +
    url.host +
    "/login/success?" +
    successQueryParams.toString();

  const client = await getSupabaseClientForUser(req);

  console.log({ client });

  if (!client) {
    return ctx.render({
      loginLinks: {
        google: "#",
      },
    });
  }

  const {
    data: { url: googleLoginUrl },
    error,
  } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  console.log({ error });
  return ctx.render({
    loginLinks: {
      google: googleLoginUrl ?? "#",
    },
  });
};
export default function LoginRoute({
  data: {
    loginLinks: { google },
  },
}: PageProps<LoginData>) {
  return (
    <div>
      <LoginButtons googleLoginUrl={google} />
    </div>
  );
}
