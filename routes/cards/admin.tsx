import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { createPrivateHandler, EjdcardState } from "../../auth.ts";
import { Profile } from "./index.tsx";

type PageData = { allUsers: Profile[]; postOperation?: boolean };

export const handler = {
  GET: createPrivateHandler(
    // @ts-expect-error: Vou consertar um dia
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const url = new URL(req.url);
      const search = new URLSearchParams(url.search);
      const postOperation = !!search.get("postOperation");

      const client = ctx.state.client;
      const { data: allUsers } = await client
        .from("profiles")
        .select("id, email, permissions");
      return ctx.render({
        allUsers: allUsers as unknown as Profile[],
        postOperation,
      });
    }
  ),
  POST: createPrivateHandler(
    // @ts-expect-error: Vou resolver depois
    async (req: Request, ctx: HandlerContext<PageData, EjdcardState>) => {
      const body = await req.formData();
      const profileId = body.get("id");
      const permissions = body.get("permissions");

      if (!profileId || !permissions) {
        console.log("Erro ao salvar nova permissão");
        console.log({ profileId, permissions });
        return new Response(null, {
          status: 301,
          headers: { location: "cards/admin" },
        });
      }

      const client = ctx.state.client;
      try {
        await client
          .from("profiles")
          .update({ permissions })
          .eq("id", profileId);

        return new Response(null, {
          status: 301,
          headers: { location: "cards/admin?postOperation=true" },
        });
      } catch (e) {
        console.log("Erro ao salvar permissão no banco");
        console.log(e);
        return new Response(null, {
          status: 301,
          headers: { location: "cards/admin" },
        });
      }
    }
  ),
} as Handlers;

export default function Admin(props: PageProps<PageData>) {
  return (
    <div class="p-4 flex flex-col w-full max-w-[500px]">
      {!!props.data.postOperation && (
        <span class="text-green-500 p-4">Operação realizada com sucesso</span>
      )}
      <span class="font-bold mb-2">Usuários Cadastrados</span>
      <ul class="w-full">
        {props.data.allUsers.map(({ email, permissions, id }) => (
          <form>
            <li class="mb-2 w-full border border-black flex flex-row justify-between items-end p-4">
              <div class="flex flex-col flex-wrap pr-3 flex-1">
                <span class="font-bold text-sm">E-mail</span>
                <input
                  type="text"
                  disabled
                  value={email}
                  class="h-8 px-1 py-3 text-xs bg-gray-100 border border-gray-600"
                />
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-sm">Permissões</span>
                <div className="flex flex-row justify-between">
                  <input
                    type="text"
                    name="permissions"
                    value={permissions}
                    class="border border-black px-1 py-3 text-xs h-8 w-12 mr-4"
                  />
                  <button
                    type="submit"
                    class="bg-blue-400 hover:bg-blue-600 cursor-pointer  text-white font-bold w-2/5 px-2 rounded text-xs"
                  >
                    Ok
                  </button>
                  <input type="hidden" name="id" value={id} />
                </div>
              </div>
            </li>
          </form>
        ))}
      </ul>
    </div>
  );
}
