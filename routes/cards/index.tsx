import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { createPrivateHandler, EjdcardState } from "../../auth.ts";

type Operation = "credit" | "debit" | "read" | "manage";
type PageData = { allowedOperations: Operation[] };

export const handler = {
  GET: createPrivateHandler(
    // @ts-expect-error: Vou consertar
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const client = ctx.state.client;
      const { data } = await client.from("profiles").select("*");
      console.log({ data });
      return ctx.render();
    }
  ),
} as Handlers;

export default function CardsIndex(props: PageProps<PageData>) {
  return <div></div>;
}
