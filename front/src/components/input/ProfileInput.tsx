// components/TextInput.tsx
import React from "react";

interface ProfileInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function ProfileInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
}: ProfileInputProps) {
  return (
    <div className="flex h-[72px] w-[500px] flex-col gap-[6px]">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`
          h-[48px] 
          w-full 
          rounded-[6px] 
          border 
          px-[20px] 
          text-sm 
          ${readOnly ? "bg-gray-100 text-gray-400" : "bg-white"}
        `}
      />
    </div>
  );
}
