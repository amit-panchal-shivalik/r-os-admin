import { apiRequest } from "./apiRequest";

// API function to authenticate user
export const getNewsApi = async (data: any): Promise<any> => {
  console.log("data in news", data);
  return await apiRequest<any>({
    method: "GET",
    // url: `/api/v1/maps/news?place=${"VATVA"}`,
    url: `/api/v1/maps/news?place=${data || "gota"}`,
    // url: `/api/v1/maps/news?place=${data?.place || "gota"}`,
    data: data,
  });
};
