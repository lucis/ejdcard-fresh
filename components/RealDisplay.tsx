import { convertCentsToReaisString } from "../currencyUtils.ts";

interface Props {
  valueInCents: number;
}

export default function RealDisplay({ valueInCents }: Props) {
  return <span>{convertCentsToReaisString(valueInCents)}</span>;
}
