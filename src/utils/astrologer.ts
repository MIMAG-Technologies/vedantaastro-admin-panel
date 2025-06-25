import axios from "axios";
import { header } from "./header";
import { AstrologerCreateArgs, ServiceList } from "@/types/astrologer";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const createAstrologer = async (
  astrologer: AstrologerCreateArgs
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.post(`${baseUrl}/astrologer`, astrologer, header());
    return {
      success: true,
      message: "Astrologer created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create astrologer",
    };
  }
};

export const getServiceList = async (): Promise<ServiceList> => {
  try {
    const response = await axios.get(`${baseUrl}/services/list`, header());
    return response.data;
  } catch (error: any) {
    return [];
  }
};
