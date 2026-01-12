import React, { TextareaHTMLAttributes } from "react";

interface TextArea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const TextArea = ({ label, ...props }: TextArea) => {
  return (
    <label className="flex flex-col gap-5 text-xl font-bold">
      {label}
      <textarea
        className="border-gray03 placeholder:text-gray03 h-40 resize-none rounded-md border bg-white p-5 text-base font-normal focus-visible:outline-1"
        {...props}
      />
    </label>
  );
};

export default TextArea;
