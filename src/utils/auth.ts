import axios from "axios";
import { header } from "./header";

type Admin = {
  id: string;
  name: string;
  email: string;
};

// Safe localStorage access
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("vedantaastro-admin-token");
  }
  return null;
};

const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("vedantaastro-admin-token", token);
  }
};

export const setOTP = async (
  email: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/send`, {
      email,
    });
    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        success: false,
        message: "Admin not found",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong, please try again later",
      };
    }
  }
};

export const verifyOTP = async (
  email: string,
  otp: number
): Promise<{
  success: boolean;
  message: string;
  token?: string;
}> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/verify`,
      {
        email,
        otp,
      }
    );
    setToken(response.data.token);
    return {
      success: true,
      message: "OTP verified successfully",
      token: response.data.token,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        success: false,
        message: "Admin not found",
      };
    } else if (axios.isAxiosError(error) && error.response?.status === 400) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong, please try again later",
      };
    }
  }
};

export const checkAdmin = async (): Promise<{
  success: boolean;
  message: string;
  admin?: Admin;
}> => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        message: "Session expired, please login again",
      };
    }
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
      header()
    );
    return {
      success: true,
      message: "Admin logged in successfully",
      admin: response.data.admin as Admin,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status !== 500) {
      return {
        success: false,
        message: "Session expired, please login again",
      };
    } else {
      return {
        success: false,
        message: "Something went wrong, please try again later",
      };
    }
  }
};
