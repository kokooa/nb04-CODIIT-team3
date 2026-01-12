import "@/styles/textviewer.css";
import DOMPurify from "dompurify";

interface ProductContentProps {
  content: string;
}

const ProductContent = ({ content }: ProductContentProps) => {
  const cleanHtml = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true }, // 안전한 HTML만 허용
  });

  return (
    <div
      className="view ql-editor"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default ProductContent;
