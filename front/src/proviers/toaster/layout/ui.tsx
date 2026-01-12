import Image from "next/image";
import checkImage from "../assets/check.svg";
import outImage from "../assets/out.svg";
import styles from "../styles/toaster.module.css";
import { ToastContinerProps, ToastProps } from "../types/toaster";
import utils from "../utils/indext";

// import CompatibleImage from "./CompatibleImage";

const { cn, useIsMounted } = utils;
const ICONS = {
  info: checkImage,
  warn: outImage,
} as const;

export default function ToasterContainer({ children, color }: ToastContinerProps) {
  let styleName = styles.ToastContainer;
  if (color) {
    switch (color.type) {
      case "tailwind":
        styleName = cn(
          "flex flex-col-reverse items-center justify-center gap-6",
          "pointer-events-none fixed top-16 left-1/2 z-[1000] -translate-x-1/2 transition-[height] duration-500 ease-in-out"
        );
        break;
    }
  }
  return <div className={styleName}>{children}</div>;
}

export function Toast({ type, message, onClick, color }: ToastProps) {
  const isMounted = useIsMounted(100);

  let icon: string = "";
  let colorCode: string = "";
  let styleName: string = styles.Toast;
  if (type === "info" || type === "warn") icon = ICONS[type as "info" | "warn"];
  if (color) {
    if (color.code) {
      colorCode = Object.entries(color.code).find((v) => v[0] === type)![1];
    }
    switch (color.type) {
      case "tailwind":
        if (!color.code) colorCode = type === "info" ? "bg-blue-500" : "bg-red-500";
        styleName = cn(
          "flex items-center justify-center gap-2",
          "transition-[top,opacity] duration-100 ease-in-out",
          "relative -top-2 rounded-md pt-[10px] pr-4 pb-[10px] pl-[12px] text-white opacity-0",
          isMounted && "top-0 opacity-100",
          colorCode,
          type === "warn" && `${styles.WarnAnimation}`
        );
        break;
    }
  }
  return (
    <div
      className={styleName}
      style={color?.type === "css" ? { color: colorCode } : {}}
      onClick={onClick}
    >
      {icon && (
        <Image
          className={cn("h-6 w-6")}
          src={icon}
          alt={type}
          width={16}
          height={16}
        />
      )}
      {message}
    </div>
  );
}
