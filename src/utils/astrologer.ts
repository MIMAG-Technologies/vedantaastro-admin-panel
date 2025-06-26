import axios from "axios";
import { header } from "./header";
import {
  Astrologer,
  AstrologerCreateArgs,
  ServiceList,
} from "@/types/astrologer";
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

export const getAstrologerList = async (
  page: number,
  limit: number = 10,
  q: string = "",
  is_active: "true" | "false" | "all" = "all"
): Promise<{
  astrolgers: Astrologer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}> => {
  try {
    const response = await axios.get(`${baseUrl}/astrologer`, {
      params: {
        page,
        limit,
        q,
        is_active,
      },
      ...header(),
    });
    return {
      astrolgers: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error: any) {
    return {
      astrolgers: [],
      pagination: { total: 0, page: 0, limit: 0, pages: 0 },
    };
  }
};
