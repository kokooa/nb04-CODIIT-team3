import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = ({ label, ...props }: InputProps) => {
  return (
    <label className="flex flex-col gap-0.5 text-base font-bold">
      {label}
      <input
        className="border-gray03 placeholder:text-gray02 focus:border-b-black01 flex h-[3.625rem] border-b leading-none font-normal focus:outline-0"
        {...props}
      />
    </label>
  );
};

export default Input;
