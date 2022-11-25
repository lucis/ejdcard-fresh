import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { convertReaisStringToCents } from "$ejdcard/currencyUtils.ts";
import { Card } from "../new.tsx";
import { createPrivateHandler, EjdcardState } from "$ejdcard/auth.ts";
import RealDisplay from "$ejdcard/components/RealDisplay.tsx";

type TentativeTransaction = {
  valid?: boolean;
  amount: number;
  balanceAfterTransaction: number;
};

type PageData = {
  card?: Card;
  transaction?: TentativeTransaction;
  error?: string;
  op: "credit" | "debit";
};

export const handler = {
  GET: (req: Request, _ctx: HandlerContext<PageData>) => {
    const url = new URL(req.url);
    const search = new URLSearchParams(url.search);
    const op = search.get("op");

    if (!op || !["credit", "debit"].includes(op)) {
      return new Response(null, {
        headers: {
          location: "/cards/operation?op=debit",
        },
        status: 301,
      });
    }

    return _ctx.render({ op: op as "credit" | "debit" });
  },
  POST: createPrivateHandler(
    // @ts-expect-error: Depois resolvo
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const url = new URL(req.url);
      const search = new URLSearchParams(url.search);
      const data = await req.formData();
      const cardNumber = data.get("card_number"); // "123"
      const amountString = data.get("amount"); // "13,00" => 1300
      const op = search.get("op") as "credit" | "debit";

      if (!op || !["credit", "debit"].includes(op)) {
        return new Response(null, {
          headers: {
            location: "/cards/operation?op=debit",
          },
          status: 301,
        });
      }

      if (typeof amountString !== "string" || !amountString?.length) {
        return ctx.render({
          error: "Valor não foi informado.",
          op,
        });
      }

      const supabase = ctx.state.client;

      const { data: foundCard } = await supabase
        .from("cards")
        .select("id, balance, card_number, name, phone")
        .eq("card_number", cardNumber)
        .limit(1)
        .single();

      if (!foundCard) {
        return ctx.render({ error: `Cartão ${cardNumber} não existe.`, op });
      }

      const amount = convertReaisStringToCents(amountString);

      // Não permit recargas maiores que R$ 100,00
      const valid = op === "debit"
        ? amount <= foundCard.balance
        : amount < 10000;

      const balanceAfterTransaction = foundCard.balance +
        amount * (op === "credit" ? 1 : -1);

      const pageData: PageData = {
        card: foundCard,
        transaction: {
          amount,
          balanceAfterTransaction,
          valid,
        },
        op,
      };

      return ctx.render(pageData);
    },
  ),
} as Handlers;

export default function OperationConfirm(props: PageProps<PageData>) {
  const op = props.data.op;
  if (!props.data.card || !props.data.transaction) {
    return (
      <div class="flex flex-col items-start">
        Cartão não cadastrado
        <a
          href={`/cards/operation?op=${op}`}
          class="inline-flex mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ok
        </a>
      </div>
    );
  }

  return (
    <div class="flex-col flex bg-[#BAE6FD] h-screen w-full p-6 ">
      <div class="sm:max-w-xl mx-auto">
        {props.data.transaction.valid
          ? (
            <div class="p-4 border border-black rounded-xl">
              <div class="block">
                <div>
                  <h1 class="text-2xl font-bold mb-2">
                    Confirme a {op === "debit" ? "transação" : "recarga"}
                  </h1>
                </div>
                <div class="mt-4">
                  <span class="font-bold text-xl ">
                    Valor da {op === "debit" ? "Transação" : "Recarga"}:
                  </span>{" "}
                  <RealDisplay valueInCents={props.data.transaction.amount} />
                </div>
                <div class="mt-2">
                  <span class="font-bold text-xl">
                    Saldo após {op === "debit" ? "Transação" : "Recarga"}:
                  </span>{" "}
                  <RealDisplay
                    valueInCents={props.data.transaction
                      .balanceAfterTransaction}
                  />
                </div>
                <div class="mt-2">
                  <span class="font-bold text-xl mt-4">Saldo Atual:</span>{" "}
                  <RealDisplay valueInCents={props.data.card.balance} />
                </div>
              </div>
              <form action="/cards/operation" method="post">
                <input
                  type="hidden"
                  name="card_number"
                  value={props.data.card.card_number}
                />
                <input
                  type="hidden"
                  name="updated_balance"
                  value={props.data.transaction.balanceAfterTransaction}
                />
                <input type="hidden" name="op" value={op} />
                <div class="mt-8 ">
                  <button
                    type="submit"
                    class="inline-flex  w-full mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none "
                  >
                    Confirmar {op === "debit" ? "Transação" : "Recarga"}
                  </button>
                </div>
              </form>
              <a
                href={`/cards/operation?op=${op}`}
                class="inline-flex w-full mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none"
              >
                Voltar
              </a>
            </div>
          )
          : (
            <div class="flex flex-col items-start">
              {op === "credit"
                ? (
                  <span>
                    Valor de Recarga (
                    <RealDisplay
                      valueInCents={props.data.transaction.amount}
                    />) é maior que máximo permitido (R$ 100,00)
                  </span>
                )
                : (
                  <span>
                    Saldo Atual (
                    <RealDisplay valueInCents={props.data.card.balance} />) não
                    é suficiente.
                  </span>
                )}

              <a
                href={`/cards/operation?op=${op}`}
                class="inline-flex mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voltar
              </a>
            </div>
          )}
      </div>
    </div>
  );
}
