import Image from "next/image";

interface StarsProps {
  rating: number | undefined;
  size?: "small" | "medium" | "normal" | "large" | "XLarge";
  onChange?: (rating: number) => void;
}

const RATINGS = [1, 2, 3, 4, 5];

const StarSize = {
  small: 16,
  medium: 20,
  normal: 24,
  large: 49,
  XLarge: 60,
};

export default function Stars({ rating = 0, size = "large", onChange }: StarsProps) {
  return (
    <div className="flex items-center gap-[2px]">
      {RATINGS.map((i) => (
        <span
          key={i}
          className={`${onChange ? "cursor-pointer" : ""}`}
          onClick={() => onChange?.(i)}
        >
          <Image
            src={i <= (rating ?? 0) ? "/icon/starYellow.svg" : "/icon/starGray.svg"}
            alt="별"
            width={StarSize[size]}
            height={StarSize[size]}
          />
        </span>
      ))}
    </div>
  );
}
