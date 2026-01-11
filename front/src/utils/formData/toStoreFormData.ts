import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";

export function toStoreFormData(data: StoreCreateForm): FormData {
  const formData = new FormData();
  formData.append("name", data.storeName);
  formData.append("address", data.address.basic);
  formData.append("detailAddress", data.address.detail ?? "");
  formData.append("phoneNumber", data.phoneNumber);
  formData.append("content", data.description);
  if (data.image instanceof File) {
    formData.append("image", data.image);
  }
  return formData;
}
