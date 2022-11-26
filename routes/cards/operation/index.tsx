import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { createPrivateHandler, EjdcardState } from "../../../auth.ts";
import RealInput from "$ejdcard/islands/RealInput.tsx";

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
    <div class="bg-[#BAE6FD] h-screen w-full rounded-xl p-6 mx-auto md:mt-0 text-[#113032]">
      <a href="/cards" class="text-xl font-bold p-2 mb-2 text-blue-600">
        Voltar
      </a>
      {showMessage && (
        <span class="text-green-700">
          {`Operação para cartão ${cardNumber} realizada com sucesso.`}
        </span>
      )}
      <div class="border border-black rounded-lg p-4 max-w-xl mx-auto">
        <h1 class="text-4xl font-bold text-center">
          {op === "credit" ? "Recarga de Cartão" : "Venda com Cartão"}
        </h1>
        <form action={`/cards/operation/confirm?op=${op}`} method="post">
          <div class="p-4">
            <div class="">
              <label class="text-2xl">Número do Cartão:</label>

              <div class="w-1/2">
                <input
                  type="text"
                  name="card_number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  autoFocus
                  class="text-black text-2xl font-normal w-full mt-2 focus:outline-none block w-full bg-gray-100 p-2 sm:text-lg border-gray-300 rounded-lg placeholder-[#B8BCCA]"
                />
              </div>
            </div>
            <div class="mt-6">
              <label class="text-2xl">
                {op === "debit" ? "Valor da Transação:" : "Valor da Recarga:"}
              </label>
              <div class="w-1/2">
                <RealInput
                  name="amount"
                  classes="text-black w-full text-2xl font-normal mt-2 focus:outline-none block w-full bg-gray-100 p-2 sm:text-md border-gray-300 rounded-lg placeholder-[#B8BCCA]"
                />
              </div>
            </div>
            <div class="mt-6">
              <button
                type="submit"
                class="inline-flex mt-6 items-center px-6 mt-4 py-3 font-bold border border-transparent text-lg leading-4 font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none"
              >
                Enviar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
