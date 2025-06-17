import axios from "axios";
import { header } from "./header";
import { Center, CreateCenterArgs, DetaileCenter } from "@/types/centers";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const createCenter = async (center: CreateCenterArgs): Promise<boolean> => {
  try {
    await axios.post(`${baseUrl}/center`, center, header());
    return true;
  } catch (error) {
    return false;
  }
};

const getCenters = async (): Promise<Center[]> => {
  try {
    const response = await axios.get(`${baseUrl}/center`, header());
    return response.data.centers;
  } catch (error) {
    return [];
  }
};

const getOneCenter = async (
  id: number
): Promise<{
  center: DetaileCenter | null;
  success: boolean;
}> => {
  try {
    const response = await axios.get(`${baseUrl}/center/${id}`, header());
    return response.data;
  } catch (error) {
    return {
      center: null,
      success: false,
    };
  }
};

const updateCenter = async (
  id: number,
  center: CreateCenterArgs
): Promise<boolean> => {
  try {
    await axios.put(`${baseUrl}/center/${id}`, center, header());
    return true;
  } catch (error) {
    return false;
  }
};

const deleteCenter = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${baseUrl}/center/${id}`, header());
    return true;
  } catch (error) {
    return false;
  }
};

export { createCenter, getCenters, getOneCenter, updateCenter, deleteCenter };
