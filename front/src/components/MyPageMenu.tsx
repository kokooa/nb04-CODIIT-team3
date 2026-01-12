export interface MenuItem {
  id: string;
  label: string;
  path: string;
}

interface MyPageMenuProps {
  className?: string;
  items: MenuItem[];
  selectedId: string;
  onSelect: (id: string, path: string) => void;
}

export default function MyPageMenu({ className = "", items, selectedId, onSelect }: MyPageMenuProps) {
  return (
    <div className={`border-gray03 flex items-center rounded-xl border bg-white px-5 py-[1.875rem] ${className}`}>
      <ul className="flex w-full flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className={`text-black01 cursor-pointer px-[1.125rem] py-[0.875rem] text-base ${selectedId === item.id ? "bg-gray04 rounded-md font-extrabold" : "font-bold"}`}
            onClick={() => onSelect(item.id, item.path)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
