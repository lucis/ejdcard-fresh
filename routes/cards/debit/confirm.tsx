import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { convertReaisStringToCents } from "$ejdcard/currencyUtils.ts";
import { Card } from "../new.tsx";
import { createPrivateHandler, EjdcardState } from "$ejdcard/auth.ts";
import RealDisplay from "../../../components/RealDisplay.tsx";

type TentativeTransaction = {
  valid?: boolean;
  amount: number;
  balanceAfterTransaction: number;
};

type PageData = {
  card?: Card;
  transaction?: TentativeTransaction;
  error?: string;
};

export const handler = {
  GET: (req: Request, _ctx: HandlerContext<PageData>) => {
    return _ctx.render({});
  },
  POST: createPrivateHandler(
    // @ts-expect-error: Depois resolvo
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const data = await req.formData();
      const cardNumber = data.get("card_number"); // "123"
      const amountString = data.get("amount"); // "13,00" => 1300

      if (typeof amountString !== "string" || !amountString?.length) {
        return ctx.render({ error: "Valor da transação não foi informado." });
      }

      const supabase = ctx.state.client;

      const { data: foundCard } = await supabase
        .from("cards")
        .select("id, balance, card_number, name, phone")
        .eq("card_number", cardNumber)
        .limit(1)
        .single();

      if (!foundCard) {
        return ctx.render({ error: `Cartão ${cardNumber} não existe.` });
      }

      const amount = convertReaisStringToCents(amountString);
      const valid = amount <= foundCard.balance;
      const balanceAfterTransaction = foundCard.balance - amount;

      const pageData: PageData = {
        card: foundCard,
        transaction: {
          amount,
          balanceAfterTransaction,
          valid,
        },
      };

      return ctx.render(pageData);
    }
  ),
} as Handlers;

export default function DebitConfirm(props: PageProps<PageData>) {
  if (!props.data.card || !props.data.transaction) {
    return (
      <div class="flex flex-col items-start">
        Cartão não cadastrado
        <a
          href="/cards/debit"
          class="inline-flex mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ok
        </a>
      </div>
    );
  }

  return (
    <div class="flex-col flex">
      {props.data.transaction.valid ? (
        <>
          <span>Confirme a transação</span>

          <span class="font-bold">Valor da Transação</span>
          <RealDisplay valueInCents={props.data.transaction.amount} />

          <span class="font-bold">Saldo após Transação</span>
          <RealDisplay
            valueInCents={props.data.transaction.balanceAfterTransaction}
          />

          <span class="font-bold">Saldo Atual</span>
          <RealDisplay valueInCents={props.data.card.balance} />

          <form action="/cards/debit" method="post">
            <input
              type="hidden"
              name="card_number"
              class="border border-black"
              value={props.data.card.card_number}
            />
            <input
              type="hidden"
              name="updated_balance"
              class="border border-black"
              value={props.data.transaction.balanceAfterTransaction}
            />
            <button
              type="submit"
              class="inline-flex mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Confirmar Transação
            </button>
          </form>
        </>
      ) : (
        <div class="flex flex-col items-start">
          <span>
            Saldo Atual (<RealDisplay valueInCents={props.data.card.balance} />)
            não é suficiente.
          </span>
          <a
            href="/cards/debit"
            class="inline-flex mt-4 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ok
          </a>
        </div>
      )}
    </div>
  );
}
