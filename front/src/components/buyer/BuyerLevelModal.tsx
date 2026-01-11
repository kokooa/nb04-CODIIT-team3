import { Level } from "@/data/level";
import { UserGrade } from "@/types/User";
import Image from "next/image";

interface BuyerLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: UserGrade | null;
}

export default function BuyerLevelModal({ isOpen, onClose, grade }: BuyerLevelModalProps) {
  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="border-gray02 bg-gray05 absolute top-116 left-250 flex h-[285px] w-[285px] flex-col items-center gap-7.5 rounded-2xl border px-10 py-7.5"
        onClick={handleModalClick}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          aria-label="닫기"
          type="button"
        >
          <Image
            src="/icon/icon_delete.svg"
            alt="닫기"
            width={24}
            height={24}
          />
        </button>
        <span className="text-black01 text-lg font-extrabold">내 등급 {grade?.name || '-'}</span>
        <div className="flex h-full w-full flex-col gap-5">
          {Level.map((item) => (
            <div
              key={item.id}
              className={`flex justify-between ${item.title === grade?.name ? "text-primary" : ""}`}
            >
              <span className="text-sm/4 font-bold">{item.title}</span>
              <span className="text-sm/4 font-normal">{item.condition}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
