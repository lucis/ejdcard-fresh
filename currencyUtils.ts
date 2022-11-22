export const convertCentsToReaisString = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100
  );

export const convertReaisStringToCents = (reais: string) => {
  const cents = reais.replace(",", "").trim();
  return parseInt(cents, 10);
};
