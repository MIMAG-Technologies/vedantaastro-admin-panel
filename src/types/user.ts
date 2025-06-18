export type CreateUserArgs = {
  full_name: string;
  email: string;
  phone_number: string;
  gender: "Male" | "Female" | "Other";
  date_of_birth: string;
};

export type User = CreateUserArgs & {
  profile_image: string;
  firebase_uid: string;
};
