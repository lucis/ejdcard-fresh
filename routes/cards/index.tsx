import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import type { UserResponse } from "supabase";
import { createPrivateHandler, EjdcardState } from "../../auth.ts";

type Operation = "credit" | "debit" | "read" | "manage" | "onboard";

type PageData = { allowedOperations: Operation[]; user: UserResponse };

const permissionLetterToOperation: Record<string, Operation> = {
  m: "manage",
  c: "credit",
  d: "debit",
  r: "read",
  o: "onboard",
};

const operationPages: Record<Operation, { label: string; href: string, description: string}> = {
  credit: {
    label: "Recarga de Cartão",
    description: "Você deve receber dinheiro do usuário e adicionar crédito ao cartão.",
    href: "/cards/operation?op=credit",
  },

  debit: {
    label: "Vendas",
    description:"para lojinha ou lanchonete. Tenha cuidado e digite com atenção!",
    href: "/cards/operation?op=debit",
  },

  onboard: {
    label: "Cadastro de Cartão",
    description:"É necessario o número do cartão, o nome e celular do titular, e o saldo inicial",
    href: "/cards/new",
  },

  read: {
    label: "Consulta de Saldo",
    description: "Você só vai precisar do número do cartão.",
    href: "/cards/query",
  },
  manage: {
    label: "Administração",
    description:"Você poderá autorizar usuários e ver estatisticas sobre o evento.",
    href: "/cards/admin",
  },
};
// TODO: Replace with automatic types from Supabase
export type Profile = {
  id: string;
  email: string;
  permissions?: string;
};

export const handler = {
  GET: createPrivateHandler(
    // @ts-expect-error: Vou consertar
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const client = ctx.state.client;
      const { data } = await client.from("profiles").select("*");
      const myUserId = ctx.state.user.data.user?.id;
      // TODO: Remove coersion
      const myProfile = (data as Profile[]).find(({ id }) => id === myUserId);
      if (!myProfile?.permissions) {
        return ctx.render({ allowedOperations: [], user: ctx.state.user });
      }

      // Ex: 'vucrd'
      const allowedOperations = myProfile.permissions
        .split("")
        .map((letter) => permissionLetterToOperation[letter]);

      return ctx.render({ allowedOperations, user: ctx.state.user });
    },
  ),
} as Handlers;

export default function CardsIndex({
  data: {
    allowedOperations,
    user: { data: userData },
  },
}: PageProps<PageData>) {
  const email = userData?.user?.email;
  return (
    <div class=" flex flex-col bg-[#BAE6FD] h-screen w-full p-4">
      <div class="border border-black rounded-lg text-center max-w-xl m-auto px-5 py-10">
        <div class="text-center">
          <h1 class="text-2xl">
            Bem-vindx, <span class="font-bold">{`${email}`}</span>
          </h1>
          <span class="text-lg">Você tem acesso as seguintes páginas:</span>
        </div>
        <ul class="mt-10">
          {allowedOperations.map((operation) => {
            const { label, href, description} = operationPages[operation];
            return (
              <div class="pt-3">
                <a href={href}>
                  <li class="border border-gray-400 border-2  rounded-lg p-4 shadow text-left hover:bg-gray-700 hover:text-white  transition-easy">
                    <span class="font-semibold">{label}</span>
                    <p>{description}</p>
                  </li>
                </a>
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
