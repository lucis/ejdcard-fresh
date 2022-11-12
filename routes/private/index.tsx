import { Handlers } from "$fresh/server.ts";
import { createPrivateHandler } from "../../auth.ts";

export const handler: Handlers = {
  GET: createPrivateHandler<null>((req, ctx) => {
    return ctx.render();
  }),
};

export default function PrivateRoute() {
  return <div>Private</div>;
}
