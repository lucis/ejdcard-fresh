import { useEffect } from "preact/hooks";
import {
  getSupabaseClient,
  DEFAULT_RETURN_URL,
  RETURN_URL_QUERY_PARAM,
} from "../auth.ts";

const client = getSupabaseClient();
const useAuthStateChange = () =>
  useEffect(() => {
    const { data: authListener } = client.auth.onAuthStateChange(
      (event, session) => {
        console.log({ event, session });
        if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          // delete cookies on sign out
          const expires = new Date(0).toUTCString();
          document.cookie = `my-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
          document.cookie = `my-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
          document.cookie = `my-access-token=${session?.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
          document.cookie = `my-refresh-token=${session?.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
          const query = new URLSearchParams(window.location?.search);
          const returnUrl = query.get(RETURN_URL_QUERY_PARAM);

          window.location.replace(returnUrl || DEFAULT_RETURN_URL);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

export default function LoginListener() {
  useAuthStateChange();
  return <div></div>;
}
