import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { createClient } from "supabase";
import RealInput from "../../islands/RealInput.tsx";

export type Card = {
  name: string;
  phone: string;
  card_number: string;
  balance: number;
};

type CreatedCardResponse = {
  card: Card;
  errorMessage?: string;
};

export const handler = {
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

    const { data, error } = await client.from("cards").insert(card).select();

    if (error) {
      const isDuplicateError = error?.message?.includes("duplicate key value");

      const userErrorMessage = isDuplicateError
        ? `Cartão ${card.card_number} já cadastrado.`
        : `Ocorreu um erro ao salvar o cartão`;

      return _ctx.render({ errorMessage: userErrorMessage, card });
    }

    const createdCard = data[0] as Card;

    return _ctx.render({ card: createdCard });
  },
} as Handlers;

export default function NewCard(props: PageProps<CreatedCardResponse>) {
  const hasError = !!props?.data?.errorMessage;
  const hasSuccess = !!props?.data?.card && !hasError;

  return (
    <div class="h-screen w-full p-4 bg-[#BAE6FD]">
      {hasSuccess && (
        <div>
          <span class="text-center p-4">
            {`Cartão ${props?.data?.card.card_number} cadastrado com sucesso.`}
          </span>
          {JSON.stringify(props.data.card)}
        </div>
      )}
      {hasError && (
        <div>
          <span class="text-red-600">{props.data?.errorMessage}</span>
        </div>
      )}

      <div class="border border-black p-4 rounded-xl max-w-xl mx-auto">
        <div class="flex flex-row justify-center">
          <h1 class="text-2xl font-bold p-4">Criar cartão</h1>
        </div>
        <div class="flex flex-row justify-center mt-4">
          <form class="flex flex-col" method="POST">
            <div>
              <label for="name" class="block text-lg font-medium text-gray-700">
                Nome Completo <span class="text-red-600">*</span>
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
              <div class="w-2/5 mr-3">
                <label
                  for="card_number"
                  class="block text-lg font-medium text-gray-700 mb-2"
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
                  class="block text-lg font-medium text-gray-700 mb-2"
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
            <div class="w-2/5 mt-2">
              <label
                for="balance"
                class="block text-lg font-medium text-gray-700 mb-2"
              >
                Crédito Inicial
              </label>
              <div class="mt-1">
                <RealInput
                  name="balance"
                  id="balance"
                  classes="shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div class="flex flex-row mt-10 ">
              <button
                type="submit"
                class="inline-flex items-center font-semibold px-6 py-3 border border-transparent text-sm rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none "
              >
                Cadastrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
