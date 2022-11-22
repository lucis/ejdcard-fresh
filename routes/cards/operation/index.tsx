import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { createPrivateHandler, EjdcardState } from "../../../auth.ts";

type PageData = {
  successCardNumber?: number;
  errorMessage?: string;
  op: "credit" | "debit";
};

export const handler = {
  GET: (req: Request, _ctx: HandlerContext<PageData>) => {
    const url = new URL(req.url);
    const search = new URLSearchParams(url.search);
    const cardNumber = search.get("successCardNumber");
    const op = search.get("op") === "credit" ? "credit" : "debit";

    return _ctx.render({
      successCardNumber: cardNumber ? parseInt(cardNumber, 10) : undefined,
      op,
    });
  },
  POST: createPrivateHandler(
    // @ts-expect-error: Depois resolvo
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const data = await req.formData();
      const cardNumber = data.get("card_number"); // 123
      const updatedBalanceRaw = data.get("updated_balance"); // 200
      const op = data.get("op") === "credit" ? "credit" : "debit";

      if (
        typeof cardNumber !== "string" ||
        typeof updatedBalanceRaw !== "string"
      ) {
        return ctx.render({ errorMessage: "Dados inválidos", op });
      }

      const supabase = ctx.state.client;

      const updatedBalance = parseInt(updatedBalanceRaw, 10);

      if (updatedBalance < 0) {
        return ctx.render({
          errorMessage: "Novo saldo não pode ser menor que 0",
          op,
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
          op,
        });
      }

      return new Response(null, {
        headers: {
          location: `/cards/operation?successCardNumber=${cardNumber}&op=${op}`,
        },
        status: 302,
      });
    }
  ),
} as Handlers;

export default function CardOperation(props: PageProps<PageData>) {
  const cardNumber = props.data?.successCardNumber;
  const showMessage = typeof cardNumber === "number";
  const op = props.data.op;

  return (
    <div>
      {showMessage && (
        <span class="text-green-700">
          {`Operação para cartão ${cardNumber} realizada com sucesso.`}
        </span>
      )}
      <h1 class="text-2xl font-bold">
        {op === "credit" ? "Recarga de Cartão" : "Venda com Cartão"}
      </h1>
      <form action={`/cards/operation/confirm?op=${op}`} method="post">
        <div class="flex flex-row p-4">
          <div class="flex-col flex w-1/2">
            <label>Número do Cartão</label>
            <input
              type="text"
              name="card_number"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              autoFocus
              class="border border-black rounded bg-blue-400 p-2 text-2xl font-bold border-blue-800"
            />
          </div>
          <div class="flex flex-col pl-2 w-1/4">
            <label>
              {op === "debit" ? "Valor da Transação" : "Valor da Recarga"}
            </label>
            <input
              type="text"
              name="amount"
              inputMode="decimal"
              pattern="[0-9,]*"
              required
              class="border border-black rounded bg-blue-400 p-2 text-2xl font-bold border-blue-800"
            />
          </div>
        </div>
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
