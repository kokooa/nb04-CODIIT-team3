"use client";

import { useToaster } from "@/proviers/toaster/toaster.hook";
import { Stock } from "@/types/Product";
import { ReactNode, useEffect, useRef, useState } from "react";

type OptionSelectProps = {
  options: Stock[] | undefined;
  onSelect: (value: number) => void;
  children?: ReactNode;
};

const OptionSelect = ({ options, onSelect, children }: OptionSelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toaster = useToaster();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Stock) => {
    if (option.quantity === 0) {
      toaster("warn", "해당 사이즈는 품절입니다.");
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    onSelect(option.size.id);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <div onClick={() => setIsOpen(true)}>{children}</div>
      {isOpen && (
        <div className="border-gray04 text-black01 absolute top-17 right-0 z-50 space-y-2.5 rounded-2xl border bg-white px-5 py-7.5 font-bold">
          {options?.map((option) => (
            <div
              className="hover:bg-gray04 flex h-12 w-45 cursor-pointer items-center justify-center gap-1 rounded-md hover:font-extrabold"
              key={option.id}
              onClick={() => handleSelect(option)}
            >
              <p>{option.size.name}</p>
              <p className="text-sm font-normal">( 재고 : {option.quantity} )</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptionSelect;
