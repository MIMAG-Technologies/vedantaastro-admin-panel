export type AstrologerCreateArgs = {
  astrologer: {
    full_name: string;
    email: string;
    phone_number: string;
    gender: "Male" | "Female" | "Other";
    bio: string;
    experience_years: number;
    languages: string[];
    is_verified: boolean;
    is_active: boolean;
  };
  schedules: {
    day_of_week:
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday";
    start_time: string;
    end_time: string;
    is_working_day: boolean;
  }[];
  services: {
    service_id: number;
    modes: {
      mode: "call" | "chat" | "video" | "offline";
      price: number;
      is_active: boolean;
    }[];
  }[];
};

export type ServiceList = {
  id: number;
  title: string;
}[];

export type Astrologer = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  bio: string;
  experience_years: number;
  date_of_birth: string;
  languages: string[];
  is_verified: boolean;
  is_active: boolean;
  is_google_verified: boolean;
  created_at: string;
  updated_at: string;
  firebase_uid: string | null;
  gender: "Male" | "Female" | "Other";
  astrologer_ratings: {
    astrologer_id: number;
    total_reviews: number;
    average_rating: string;
    updated_at: string;
  };
};

export type DetaileAstrologer = {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  bio: string;
  experience_years: number;
  languages: string[];
  is_verified: boolean;
  is_active: boolean;
  is_google_verified: boolean;
  created_at: string;
  updated_at: string;
  firebase_uid: string | null;
  gender: "Male" | "Female" | "Other";
  date_of_birth: string | null;
  astrologer_ratings: {
    astrologer_id: number;
    total_reviews: number;
    average_rating: string;
    updated_at: string;
  };
  astrologer_schedules: {
    id: number;
    astrologer_id: number;
    day_of_week:
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday";
    start_time: string;
    end_time: string;
    is_working_day: boolean;
  }[];
  astrologer_services: {
    id: number;
    service_id: number;
    service_name: string;
    modes: {
      id: number;
      mode: "call" | "chat" | "video" | "offline";
      price: string;
      is_active: boolean;
    }[];
  }[];
};

export type AstrolgerBasicDetailsArgs = {
  full_name: string;
  bio: string;
  experience_years: number;
  gender: "Male" | "Female" | "Other";
  date_of_birth: string;
  languages: string[];
};

export type AstrologerScheduleArgs = {
  day_of_week:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  start_time: string;
  end_time: string;
  is_working_day: boolean;
}[];

export type AstrologerRatingArgs = {
  total_reviews: number;
  average_rating: number;
};

export type AstrologerServiceArgs = {
  id?: number; // to update existing service record
  service_id: number;
  modes: {
    mode: "call" | "chat" | "video" | "offline";
    price: number;
    is_active: boolean;
  }[];
};
