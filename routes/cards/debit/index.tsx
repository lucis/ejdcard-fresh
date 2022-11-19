import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { createPrivateHandler, EjdcardState } from "../../../auth.ts";

type PageData = { successCardNumber?: number; errorMessage?: string };

export const handler = {
  GET: (req: Request, _ctx: HandlerContext<PageData>) => {
    const url = new URL(req.url);
    const search = new URLSearchParams(url.search);
    const cardNumber = search.get("successCardNumber");

    return _ctx.render({
      successCardNumber: cardNumber ? parseInt(cardNumber, 10) : undefined,
    });
  },
  POST: createPrivateHandler(
    // @ts-expect-error: Depois resolvo
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const data = await req.formData();
      const cardNumber = data.get("card_number"); // 123
      const updatedBalanceRaw = data.get("updated_balance"); // 200

      if (
        typeof cardNumber !== "string" ||
        typeof updatedBalanceRaw !== "string"
      ) {
        return ctx.render({ errorMessage: "Dados inválidos" });
      }

      const supabase = ctx.state.client;

      const updatedBalance = parseInt(updatedBalanceRaw, 10);

      if (updatedBalance < 0) {
        return ctx.render({
          errorMessage: "Novo saldo não pode ser menor que 0",
        });
      }

      const { error } = await supabase
        .from("cards")
        .update({ balance: updatedBalance })
        .eq("card_number", cardNumber);

      if (error) {
        console.log({ errorType: "DEBIT_DB", error });
        return ctx.render({
          errorMessage: "Ocorreu um erro inesperado, transação não efetuada.",
        });
      }

      return new Response(null, {
        headers: {
          location: "/cards/debit?successCardNumber=" + cardNumber,
        },
        status: 302,
      });
    }
  ),
} as Handlers;

export default function CardDebit(props: PageProps<PageData>) {
  const cardNumber = props.data?.successCardNumber;
  const showMessage = typeof cardNumber === "number";

  return (
    <div>
      {showMessage && (
        <span class="text-green-700">
          {`Operação para cartão ${cardNumber} realizada com sucesso.`}
        </span>
      )}
      <form
        action="/cards/debit/confirm"
        method="post"
        class="flex flex-col p-4 items-start"
      >
        <label>Número do Cartão</label>
        <input
          type="text"
          name="card_number"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          autoFocus
          class="border border-black rounded"
        />
        <label>Valor da Transação</label>
        <input
          type="text"
          name="amount"
          inputMode="decimal"
          pattern="[0-9,]*"
          required
          class="border border-black"
        />
        <button
          type="submit"
          class="inline-flex mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
