import { SalesData } from "@/types/dashboard";
import { getAxiosInstance } from "./axiosInstance";

export const getDashboard = async (): Promise<SalesData> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/dashboard/`);
  return response.data;
};
