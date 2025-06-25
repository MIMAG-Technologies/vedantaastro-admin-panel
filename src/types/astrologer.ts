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
