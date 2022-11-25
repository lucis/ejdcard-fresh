import { convertCentsToReaisString } from "../currencyUtils.ts";

interface Props {
  valueInCents: number;
}

export default function RealDisplay({ valueInCents }: Props) {
  return <span class="font-semibold text-xl italic">{convertCentsToReaisString(valueInCents)}</span>;
}
