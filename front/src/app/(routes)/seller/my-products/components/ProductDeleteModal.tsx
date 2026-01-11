import Modal from "@/components/Modal";
import Button from "@/components/button/Button";

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

export default function ProductDeleteModal({ isOpen, onClose, onConfirm, productName }: ProductDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="w-[400px]">
        <p className="mb-16 text-lg font-semibold">{productName} 상품을 삭제하시겠습니까?</p>
        <div className="flex justify-end gap-4">
          <Button
            label="취소"
            size="large"
            variant="secondary"
            color="white"
            className="h-16.25 w-full"
            onClick={onClose}
          />
          <Button
            onClick={onConfirm}
            label="삭제"
            size="large"
            variant="primary"
            color="black"
            className="h-16.25 w-full"
          />
        </div>
      </div>
    </Modal>
  );
}
