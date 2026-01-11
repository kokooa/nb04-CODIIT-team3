"use client";

import React from "react";

interface ProfileButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function ProfileButton({ label, onClick, disabled = false }: ProfileButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        h-[50px] 
        w-[500px] 
        rounded-[12px] 
        px-[8px] 
        py-[8px]
        text-white
        font-semibold
        ${disabled ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:bg-gray-800"}
      `}
    >
      {label}
    </button>
  );
}
