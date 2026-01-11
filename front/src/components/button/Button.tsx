"use client";

import Image from "next/image";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size: "small" | "medium" | "large";
  variant: "primary" | "secondary" | "selected";
  color?: "black" | "white";
}

export default function Button({
  label = "label",
  size,
  variant,
  color = "black",
  className = "",
  ...props
}: ButtonProps) {
  const sizeClass = size === "small" ? "text-sm" : size === "large" ? "text-xl" : "text-base";

  const colorClass =
    color === "black"
      ? "bg-black01 text-white active:bg-black02"
      : "bg-white text-black01 active:bg-black01 active:text-white";

  let typeClass = "";
  if (variant === "primary") {
    typeClass = "flex justify-center items-center border-none ";
  } else if (variant === "secondary") {
    typeClass = "flex justify-center items-center border border-black01 ";
  } else if (variant === "selected") {
    typeClass = "flex items-center justify-between opacity-50 active:opacity-100 border border-gray03 ";
  }

  return (
    <button
      className={`rounded-xl ${sizeClass} ${typeClass} ${colorClass} ${className}`}
      {...props}
    >
      <div className="text-center">{label}</div>
      {variant === "selected" && (
        <span>
          <Image
            src="/icon_check.svg"
            alt="check"
            width={28}
            height={28}
          />
        </span>
      )}
    </button>
  );
}
