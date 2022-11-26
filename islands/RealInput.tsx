import { useState } from "preact/hooks";

interface Props {
  name: string;
  classes?: string;
  id?: string;
}
const MAX_DIGITS = 5;

export default function RealInput({ name, classes, id }: Props) {
  const [cents, setCents] = useState(0);
  const [textValue, setTextValue] = useState("0,00");

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
    if (l > MAX_DIGITS) {
      return;
    }

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
        class={classes}
        maxLength={MAX_DIGITS}
        id={id}
        onFocus={(e) => {
          e.currentTarget?.select();
        }}
        onInput={(e) => {
          onTextValueChange(e.currentTarget?.value);
          e.stopPropagation();
          e.preventDefault();
        }}
      />
      <input type="hidden" name={name} value={cents} />
    </>
  );
}
