import { Language } from "@/types/filters";
import axios from "axios";
import { header } from "./header";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const createLanguageFilter = async (
  language: Language
): Promise<boolean> => {
  try {
    await axios.post(`${baseUrl}/filter/language`, language, header());
    return true;
  } catch (error) {
    return false;
  }
};
export const getLanguageFilter = async (): Promise<Language[]> => {
  try {
    const response = await axios.get(`${baseUrl}/filter/language`, header());
    return response.data;
  } catch (error) {
    return [];
  }
};
export const deleteLanguageFilter = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${baseUrl}/filter/language/${id}`, header());
    return true;
  } catch (error) {
    return false;
  }
};
export const updateLanguageFilter = async (
  id: number,
  language: Language
): Promise<boolean> => {
  try {
    await axios.put(`${baseUrl}/filter/language/${id}`, language, header());
    return true;
  } catch (error) {
    return false;
  }
};
