"use client";

import styles from "@/styles/scrollbar.module.css";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // ESC close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // 외부 스크롤 잠금
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/50"
      // 모달 외부 클릭 시 닫힘
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`max-h-[90vh] overflow-y-auto rounded-[12px] bg-white p-10 ${styles["scrollbar-hidden"]}`}
        // 내부 클릭 시 닫힘 방지
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
