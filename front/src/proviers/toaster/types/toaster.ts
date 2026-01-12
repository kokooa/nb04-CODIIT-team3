/* eslint-disable @typescript-eslint/no-empty-object-type */
import { PropsWithChildren } from "react";

type ToastColorCode<T> = { info: string; warn: string } & Partial<T>;

export type ToastColor<T = {}> = {
  type?: "css" | "tailwind";
  code?: ToastColorCode<T>;
};
export type ToastType<T = {}> = "info" | "warn" | (keyof T & string) | (string & {});

export interface ToastContinerProps<T = {}> extends PropsWithChildren {
  color?: ToastColor<T>;
}

export interface ToastProps<T = {}> {
  type: ToastType;
  message: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  color?: ToastColor<T>;
}

export interface ToastObject<T = {}> {
  id: number;
  type: ToastType<T>;
  message: string;
}

export interface ToastProvider<T = {}> extends PropsWithChildren {
  color?: ToastColor<T>;
}
