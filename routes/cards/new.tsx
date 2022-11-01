import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { createClient } from "supabase";

type CreatedCardResponse = {
  cardId: number;
};

export const handler = {
  GET: (_req: Request, _ctx: HandlerContext) => {
    return _ctx.render({});
  },
  POST: async (req: Request, _ctx: HandlerContext<CreatedCardResponse>) => {
    const client = createClient(
      "https://nytnqaopjcnvsebekgsy.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dG5xYW9wamNudnNlYmVrZ3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjYzODI4OTksImV4cCI6MTk4MTk1ODg5OX0.eHQPZYkozJyUiW6Gu0xLIMNgcuDxl3aCBIAZzN3XB0k"
    );
    const body = await req.formData();
    const bodyAsJson = Object.fromEntries(body.entries()) as {
      name: string;
      balance: string;
      card_number: string;
      phone: string;
    };

    if (bodyAsJson.name?.length < 5) {
      return Response.json(
        { error: "You should fill the name value " },
        {
          status: 400,
        }
      );
    }

    const card = {
      ...bodyAsJson,
      // "R$ 5,00" => "5,00" => "500"
      balance: parseInt(
        bodyAsJson.balance?.replace("R$ ", "").replace(",", "")
      ),
    };

    const { data, error } = await client.from("cards").insert(card);

    if (error) {
      return Response.json(
        { error: error.message },
        {
          status: 400,
        }
      );
    }

    console.log(data);
    return _ctx.render({ cardId: data[0].id });
  },
} as Handlers;

export default function NewCard(props: PageProps<CreatedCardResponse>) {
  return (
    <div>
      {props.data.cardId && (
        <span class="text-center p-4">{`Cartão ${props.data.cardId} cadastrado com sucesso.`}</span>
      )}
      <div class="flex flex-row justify-center">
        <h1 class="text-2xl font-bold p-4">Criar cartão</h1>
      </div>
      <div class="flex flex-row justify-center mt-4">
        <form class="w-1/2 flex flex-col" method="POST">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nome Completo*
            </label>
            <div class="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                class="shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="ex: Maria das Graças"
                required
              />
            </div>
          </div>
          <div className="flex flex-row mt-4">
            <div class="w-2/5">
              <label
                for="card_number"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Número
              </label>
              <div class="mt-1">
                <input
                  type="number"
                  name="card_number"
                  id="card_number"
                  class="shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="ex: 169"
                />
              </div>
            </div>
            <div class="flex-1">
              <label
                for="phone"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Celular
              </label>
              <div class="mt-1">
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value="(83) 9"
                  class="shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <div class="w-2/5">
            <label
              for="balance"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Crédito Inicial
            </label>
            <div class="mt-1">
              <input
                type="text"
                name="balance"
                id="balance"
                value="R$ "
                class="shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="ex: 169"
              />
            </div>
          </div>
          <div class="flex flex-row justify-center mt-4">
            <button
              type="submit"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
