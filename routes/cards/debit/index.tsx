import { router } from "https://deno.land/x/rutt@0.0.13/mod.ts";

import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";

type PageData = { successCardNumber: number };

export const handler = {
  GET: async (req: Request, _ctx: HandlerContext<PageData>) => {
    return _ctx.render();
  },
  POST: async (req: Request, _ctx: HandlerContext<PageData>) => {
    return _ctx.render();
  },
} as Handlers;

export default function CardDebit(props: PageProps<PageData>) {
  return (
    <div>
      <form action="/cards/debit/confirm" method="post" class="flex flex-col p-4 justify-start">
        <label>Número do Cartão</label>
        <input type="text" name="card_number" class="border border-black rounded"></input>
        <label>Valor da Transação</label>
        <input type="text" name="amount" inputMode="numeric" pattern="[0-9]*" class="border border-black" />
      </form>
    </div>
  );
}
