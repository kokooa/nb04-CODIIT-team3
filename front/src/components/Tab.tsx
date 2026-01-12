import React from "react";

interface TabItem {
  key: string;
  label: string;
}

interface TabProps {
  tabs: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function Tab({ tabs, value, onChange, className = "" }: TabProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      {tabs.map((tab) => {
        const isSelected = value === tab.key;
        return (
          <button
            key={tab.key}
            tabIndex={isSelected ? 0 : -1}
            className={`cursor-pointer rounded-md border px-3 py-2 text-base ${isSelected ? "bg-black01 border-black01 font-extrabold text-white" : "hover:bg-black01 text-black01 border-black01 bg-white font-bold transition-all duration-300 hover:text-white"} `}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
