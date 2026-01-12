import Modal from "@/components/Modal";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { Inquiry } from "@/types/inquiry";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Button from "../button/Button";
import Divder from "../divider/Divder";

interface InquiryDeleteModalProps {
  open: boolean;
  inquiry: Inquiry | null;
  onClose: () => void;
}

export default function InquiryDeleteModal({ open, inquiry, onClose }: InquiryDeleteModalProps) {
  const axiosInstance = getAxiosInstance();
  const queryClient = useQueryClient();
  const toaster = useToaster();
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/inquiries/${inquiry!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toaster("info", "문의가 삭제됐습니다.");
      onClose();
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
    >
      <div className="relative w-[599px] text-left">
        <button
          className="absolute top-0 right-0"
          onClick={onClose}
        >
          <Image
            src="/icon/deleteBlack.svg"
            alt="닫기"
            width={24}
            height={24}
          />
        </button>
        <div className="text-3xl font-extrabold">문의 삭제</div>
        <Divder className="mt-5 mb-10" />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-2xl font-bold">문의 제목 : </span>
            <span className="text-lg font-normal">{inquiry?.title}</span>
          </div>
          <span className="text-red01">문의를 삭제하시겠습니까?</span>
        </div>
        <div className="mt-10 flex gap-5">
          <Button
            label="취소"
            size="large"
            variant="secondary"
            color="white"
            className="h-16.25 w-full"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          />
          <Button
            label={deleteMutation.isPending ? "삭제 중..." : "삭제"}
            size="large"
            variant="primary"
            color="black"
            className="h-16.25 w-full"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          />
        </div>
      </div>
    </Modal>
  );
}
