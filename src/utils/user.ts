import axios from "axios";
import { header } from "./header";
import { CreateUserArgs, User } from "@/types/user";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const CreateUser = async (
  user: CreateUserArgs
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await axios.post(
      `${baseUrl}/user/admin/create`,
      user,
      header()
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "User creation failed",
    };
  }
};
const GetAllUsers = async (
  page: number,
  limit: number,
  query: string,
  firebase_uid?: string
): Promise<{
  success: boolean;
  users: User[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await axios.get(
      `${baseUrl}/user/admin/get?page=${page}&limit=${limit}&${
        firebase_uid ? `firebase_uid=${firebase_uid}` : ""
      }&query=${query}`,
      header()
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      users: [],
      total: 0,
      page: 0,
      limit: 0,
    };
  }
};

const UpdateUser = async (
  firebase_uid: string,
  user: Partial<User>
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await axios.put(`${baseUrl}/user/${firebase_uid}`, user, header());
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "User creation failed",
    };
  }
};

export { CreateUser, GetAllUsers, UpdateUser };
