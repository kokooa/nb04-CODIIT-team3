"use client";

import Image from "next/image";
import { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checkbox?: boolean;
  isSecret?: boolean;
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BoxInput = ({ label, checkbox = false, isSecret, onCheckboxChange, ...props }: InputProps) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-5">
      {label && (
        <div className="flex justify-between">
          <label
            htmlFor={id}
            className="text-xl font-bold"
          >
            {label}
          </label>
          {checkbox && (
            <label className="font-base text-black01 flex gap-1 text-lg">
              {isSecret ? (
                <Image
                  src={"/icon/checkBox.svg"}
                  alt="체크박스"
                  width={24}
                  height={24}
                />
              ) : (
                <Image
                  src={"/icon/checkbox_blank.svg"}
                  alt="체크박스"
                  width={24}
                  height={24}
                />
              )}
              비밀글
              <input
                className="hidden"
                type="checkbox"
                checked={isSecret}
                onChange={onCheckboxChange}
              />
            </label>
          )}
        </div>
      )}
      <input
        className="border-gray03 placeholder:text-gray02 flex h-15 rounded-md border bg-white p-5 text-base leading-none font-normal"
        id={id}
        {...props}
      />
    </div>
  );
};

export default BoxInput;
