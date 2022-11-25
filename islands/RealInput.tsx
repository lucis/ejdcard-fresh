import { useState } from "preact/hooks";

interface Props {
  name: string;
  classes?: string;
}
const MAX_DIGITS = 5;
const convertCentsToString = (cents: number) => {
  //
  return cents.toString();
};
export default function RealInput({ name }: Props) {
  const [cents, setCents] = useState(0);
  const [textValue, setTextValue] = useState(convertCentsToString(cents));

  const onTextValueChange = (newValue: string) => {
    const centsString = newValue.split(",").join("");
    if (Number.isNaN(Number(centsString))) return;

    if (!centsString) {
      return;
    }

    let l = newValue.length;
    if (l <= 2) {
      setTextValue(centsString);
      setCents(Number(centsString));
    }
    if (l > MAX_DIGITS) return;
    l = centsString.length;
    const maskedValue =
      centsString.slice(0, l - 2) + "," + centsString.slice(l - 2);

    setTextValue(maskedValue);
    setCents(Number(centsString));
  };

  return (
    <>
      <input
        type="text"
        autoComplete="off"
        inputMode="decimal"
        pattern="[0-9,]*"
        value={textValue}
        onInput={(e) => {
          onTextValueChange(e.currentTarget?.value);
        }}
      />
      <input type="hidden" name={name} value={cents} />
    </>
  );
}
