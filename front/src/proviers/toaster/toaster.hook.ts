import { createContext, useContext } from "react";
import { type ToastType } from "./types/toaster";

export const ToasterContext = createContext<
  { toaster: (type: ToastType, message: string, time?: number) => void } | undefined
>(undefined);

/**
 * @param type warn, info
 * @param message 원하는 메세지
 * @param time optional 이며 default는 2000
 */
export function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error("ToastContext 안에서만 사용할 수 있습니다.");
  }
  const { toaster } = context;
  return toaster;
}
