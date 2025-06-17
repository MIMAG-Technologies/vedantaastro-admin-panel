export type CreateCenterArgs = {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_number: string;
  email: string;
  google_maps_link: string;
};

export type Center = {
  id: number;
  name: string;
  city: string;
  state: string;
  pincode: string;
  contact_number: string;
  google_maps_link: string;
  is_active: boolean;
};

export type DetaileCenter = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_number: string;
  email: string;
  google_maps_link: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
