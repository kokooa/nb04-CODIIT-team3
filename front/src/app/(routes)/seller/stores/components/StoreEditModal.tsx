import { editStore } from "@/lib/api/store";
import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useQueryClient } from "@tanstack/react-query";
import StoreForm from "./StoreForm";

interface StoreEditModalProps {
  onClose: () => void;
  store: {
    id: string;
    name: string;
    address: string;
    detailAddress?: string;
    phone: string;
    content: string;
    imageUrl?: string;
  };
}

export default function StoreEditModal({ onClose, store }: StoreEditModalProps) {
  const toaster = useToaster();

  const queryClient = useQueryClient();

  const handleEdit = async (data: StoreCreateForm) => {
    try {
      await editStore(store.id, data);

      await queryClient.invalidateQueries({ queryKey: ["myStore"] });
      toaster("info", "스토어 정보를 수정했습니다");
      onClose();
    } catch (error) {
      toaster("warn", "스토어 수정 실패: " + error);
    }
  };

  return (
    <StoreForm
      mode="edit"
      onClose={onClose}
      onSubmit={handleEdit}
      defaultValues={{
        storeName: store.name,
        address: {
          basic: store.address,
          detail: store.detailAddress ?? "",
        },
        phoneNumber: store.phone,
        description: store.content,
      }}
      imagePreviewUrl={store.imageUrl}
    />
  );
}
