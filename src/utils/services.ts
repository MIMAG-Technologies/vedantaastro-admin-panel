import axios from "axios";
import { header } from "./header";
import { CreateServiceArgs, Service } from "@/types/services";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const getServiceImgURL = (img: string) => {
  return `${baseUrl}/uploads/services/${img}`;
};

export const createService = async (
  service: CreateServiceArgs
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.post(`${baseUrl}/services`, service, header());
    return {
      success: true,
      message: "Service created successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create service",
    };
  }
};

export const getAllServices = async (
  page: number,
  query: string,
  type: "ONE_ON_ONE" | "QUERY_BASED" | "HOME_PUJA" | "PRODUCT",
  slug: string
): Promise<{
  success: boolean;
  services: Service[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}> => {
  try {
    const response = await axios.get(
      `${baseUrl}/services?page=${page}&q=${query}&type=${type}${
        slug && `&slug=${slug}`
      }`,
      header()
    );
    return {
      success: true,
      services: response.data.data.services,
      pagination: response.data.data.pagination,
    };
  } catch (error: any) {
    return {
      success: false,
      services: [],
      pagination: {
        total: 0,
        page: 0,
        limit: 0,
        pages: 0,
      },
    };
  }
};

export const UpdateService = async (
  id: string,
  service: Partial<CreateServiceArgs>
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(`${baseUrl}/services/${id}`, service, header());
    return {
      success: true,
      message: "Service updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update service",
    };
  }
};

export const deleteService = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.delete(`${baseUrl}/services/${id}`, header());
    return {
      success: true,
      message: "Service deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete service",
    };
  }
};

export const UpdateServiceThumbnail = async (
  id: string,
  img: File | Blob
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const formData = new FormData();
    formData.append("thumbnail", img);

    const response = await axios.post(
      `${baseUrl}/services/${id}/thumbnail`,
      formData,
      {
        headers: {
          ...header().headers,
          "Content-Type": "multipart/form-data",
        },
        maxBodyLength: Infinity,
      }
    );

    return {
      success: true,
      message: response.data?.message || "Thumbnail updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update thumbnail",
    };
  }
};

export const AddServiceImages = async (
  id: string,
  images: File[]
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const formData = new FormData();
    images.forEach((img) => {
      formData.append("images", img);
    });

    const response = await axios.post(
      `${baseUrl}/services/${id}/images`,
      formData,
      {
        headers: {
          ...header().headers,
          "Content-Type": "multipart/form-data",
        },
        maxBodyLength: Infinity,
      }
    );

    return {
      success: true,
      message: response.data?.message || "Images added successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add images",
    };
  }
};

export const deleteServiceImages = async (
  id: string,
  imageNames: string[]
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.delete(`${baseUrl}/services/${id}/images`, {
      data: { imageNames: imageNames },
      headers: header().headers,
    });
    return {
      success: true,
      message: "Images deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete images",
    };
  }
};
