import { toast } from "react-hot-toast";
import { setLoading, setUser } from "../../Slice/profileSlice";
import { apiConnector } from "../apiConnector";
import { profileEndpoints } from "../apis";
import { logout } from "./authAPI";

const {
  GET_USER_DETAILS_API,
  GET_USER_ENROLLED_COURSES_API,
  GET_INSTRUCTOR_DATA_API,
} = profileEndpoints;

export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    if (!token) {
      console.error("Token is missing!");
      dispatch(logout(navigate));
      return;
    }

    const toastId = toast.loading("Loading user details...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, {
        Authorization: `Bearer ${token}`,
      });

      const userData = response?.data?.data;

      if (!response?.data?.success || !userData) {
        throw new Error(response?.data?.message || "Failed to fetch user");
      }

      const userImage = userData.image
        ? userData.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`;

      dispatch(setUser({ ...userData, image: userImage }));
    } catch (error) {
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.message;

      console.error("GET_USER_DETAILS ERROR:", error);

      if (status === 401 || status === 403) {
        toast.error("Session expired. Please log in again.");
        dispatch(logout(navigate));
      } else {
        toast.error(errorMessage || "Could not fetch user details.");
      }
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };
}

export async function getUserEnrolledCourses(token) {
  const toastId = toast.loading("Loading enrolled courses...");
  let result = [];

  try {
    const response = await apiConnector(
      "GET",
      GET_USER_ENROLLED_COURSES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }

    result = response.data.data;
  } catch (error) {
    console.error("GET_USER_ENROLLED_COURSES_API ERROR:", error);
    toast.error("Could not get enrolled courses.");
  } finally {
    toast.dismiss(toastId);
  }

  return result;
}

export async function getInstructorData(token) {
  const toastId = toast.loading("Loading instructor data...");
  let result = [];

  try {
    const response = await apiConnector("GET", GET_INSTRUCTOR_DATA_API, null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("GET_INSTRUCTOR_DATA_API response:", response);

    if (!response?.data?.success) {
      throw new Error("Failed to fetch instructor data");
    }

    result = response.data.courses || [];
  } catch (error) {
    console.error("GET_INSTRUCTOR_DATA_API ERROR:", error);
    toast.error("Could not get instructor data.");
  } finally {
    toast.dismiss(toastId);
  }

  return result;
}

