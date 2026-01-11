"use client";

import { uploadImageToS3 } from "@/lib/api/products";
import { ProductFormValues } from "@/lib/schemas/productForm.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import "@/styles/textviewer.css";
import { useCallback, useMemo, useRef } from "react";
import { Control, FieldErrors, useController } from "react-hook-form";
import type ReactQuillType from "react-quill-new";
import ReactQuill from "./ReactQuillWrapper";

export function ProductDetailSection({
  control,
  errors,
}: {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}) {
  const { field: detailField } = useController({
    name: "detail",
    control,
  });

  const toaster = useToaster();
  const quillRef = useRef<ReactQuillType | null>(null);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return;

      const file = input.files[0];
      try {
        const response = await uploadImageToS3(file);
        const imageUrl = response.url;

        const editor = quillRef.current?.getEditor();
        if (!editor) {
          toaster("warn", "에디터가 준비되지 않았습니다.");
          return;
        }

        const range = editor.getSelection(true);
        if (range) {
          editor.insertEmbed(range.index, "image", imageUrl);
          editor.setSelection(range.index + 1);
        }
      } catch {
        toaster("warn", "이미지 업로드 실패");
      }
    };
  }, [toaster]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
    }),
    [handleImageUpload]
  );

  return (
    <section>
      <h3 className="text-xl font-extrabold">상품 상세정보</h3>
      <div className="bg-black01 mt-[10px] h-px w-full" />
      <div className="mt-[30px] flex flex-col gap-[30px]">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={detailField.value}
          onChange={detailField.onChange}
          placeholder="상품 상세 설명을 입력하세요."
          style={{ height: "600px" }}
          modules={modules}
        />
      </div>
      {errors.detail?.message && <p className="ml-3 text-sm text-red-500">{errors.detail.message}</p>}
    </section>
  );
}
