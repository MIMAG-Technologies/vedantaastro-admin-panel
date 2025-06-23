export type Service = {
  id: number;
  title: string;
  description: string;
  service_type: "PRODUCT" | "ONE_ON_ONE" | "QUERY_BASED" | "HOME_PUJA";
  service_images: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  thumbnail_img: string | null;
  slug: string;
};

export type CreateServiceArgs = {
  title: string;
  description: string;
  service_type: "PRODUCT" | "ONE_ON_ONE" | "QUERY_BASED" | "HOME_PUJA";
};
