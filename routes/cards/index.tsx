import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
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

const operationPages: Record<Operation, { label: string; href: string }> = {
  credit: {
    label: "Recarga de Cartão",
    href: "/cards/operation?op=credit",
  },

  debit: {
    label: "Vendas",
    href: "/cards/operation?op=debit",
  },

  onboard: {
    label: "Cadastro de Cartão",
    href: "/cards/new",
  },

  read: {
    label: "Consulta de Saldo",
    href: "/cards/query",
  },
  manage: {
    label: "Administração",
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
    }
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
    <div class="p-4 flex flex-col">
      <h1 class="text-2xl">{`Bem-vindx, ${email}`}</h1>
      <span>Você tem acesso as seguintes páginas:</span>
      <ul>
        {allowedOperations.map((operation) => {
          const { label, href } = operationPages[operation];
          return (
            <li class="pt-1">
              <a href={href}>{label}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
