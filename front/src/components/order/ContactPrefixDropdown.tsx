import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ContactPrefixDropdownProps {
  value: string;
  onChange: (value: string) => void;
  prefixList?: string[];
  className?: string;
}

const DEFAULT_PREFIXES = ["010", "011", "016", "017", "018", "019"];

export default function ContactPrefixDropdown({
  value,
  onChange,
  prefixList = DEFAULT_PREFIXES,
  className = "",
}: ContactPrefixDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="border-gray03 flex w-30 items-center justify-between rounded-md border bg-white px-5 py-3 text-base font-normal"
        onClick={() => setDropdownOpen((open) => !open)}
      >
        {value}
        <Image
          src="/icon/AltArrowDown.svg"
          alt="화살표"
          width={18}
          height={18}
          className={`ml-10 transition-transform duration-100 ${dropdownOpen ? "rotate-180" : ""}`}
        />
      </button>
      {dropdownOpen && (
        <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow">
          {prefixList.map((prefix) => (
            <div
              key={prefix}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${value === prefix ? "font-bold text-black" : ""}`}
              onClick={() => {
                onChange(prefix);
                setDropdownOpen(false);
              }}
            >
              {prefix}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
