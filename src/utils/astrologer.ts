import axios from "axios";
import { header } from "./header";
import {
  AstrolgerBasicDetailsArgs,
  Astrologer,
  AstrologerCreateArgs,
  AstrologerRatingArgs,
  AstrologerScheduleArgs,
  AstrologerServiceArgs,
  DetaileAstrologer,
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

export const getAstrologerDetail = async (
  id: number
): Promise<DetaileAstrologer | null> => {
  try {
    const response = await axios.get(`${baseUrl}/astrologer/${id}`, header());
    return response.data.data;
  } catch (error: any) {
    return null;
  }
};

export const deactivateAstrologer = async (
  id: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(`${baseUrl}/astrologer/${id}/deactivate`, header());
    return {
      success: true,
      message: "Astrologer deactivated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to deactivate astrologer",
    };
  }
};

export const reactivateAstrologer = async (
  id: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(`${baseUrl}/astrologer/${id}/reactivate`, header());
    return {
      success: true,
      message: "Astrologer reactivated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to reactivate astrologer",
    };
  }
};

export const updateAstrologerBasicDetails = async (
  id: number,
  basicDetails: AstrolgerBasicDetailsArgs
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(
      `${baseUrl}/astrologer/${id}/basic`,
      basicDetails,
      header()
    );
    return {
      success: true,
      message: "Astrologer basic details updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to update astrologer basic details",
    };
  }
};

export const updateAstrologerSchedule = async (
  id: number,
  schedule: AstrologerScheduleArgs
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(`${baseUrl}/astrologer/${id}/weekly`, schedule, header());
    return {
      success: true,
      message: "Astrologer schedule updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to update astrologer schedule",
    };
  }
};

export const updateAstrologerRating = async (
  id: number,
  rating: AstrologerRatingArgs
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(`${baseUrl}/astrologer/${id}/ratings`, rating, header());
    return {
      success: true,
      message: "Astrologer rating updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to update astrologer rating",
    };
  }
};

export const updateAstrologerService = async (
  id: number,
  service: AstrologerServiceArgs
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(
      `${baseUrl}/astrologer/${id}/services`,
      [service],
      header()
    );
    return {
      success: true,
      message: "Astrologer service updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to update astrologer service",
    };
  }
};

export const onBoardingAstrologer = async (
  id: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await axios.post(
      `${baseUrl}/astrologer/onboard/${id}`,
      header()
    );
    return {
      success: true,
      message:
        response.data.message || "Astrologer onboarding updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to update astrologer onboarding",
    };
  }
};
