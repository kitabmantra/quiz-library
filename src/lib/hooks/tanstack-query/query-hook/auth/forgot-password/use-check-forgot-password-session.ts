import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getErrorMessage } from "@/lib/utils/get-error";

interface CheckForgotPasswordSessionResponse {
  success: boolean;
  email?: string;
  check?: boolean;
  error?: string;
}

export const fetchCheckForgotPasswordSession = async (sessionToken: string): Promise<CheckForgotPasswordSessionResponse> => {
  try {
    const res = await axios.get(`/api/get/auth/check-forgot-password-session?sessionToken=${sessionToken}`)
    const data = res.data
    
    if (!data.success || !data.check) {
      return {
        success: false,
        error: data.error || "Session validation failed"
      }
    }
    
    return {
      success: true,
      email: data.email,
      check: data.check
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    console.log("Error in fetching check forgot password session:", errorMessage)
    return {
      success: false,
      error: errorMessage
    }
  }
};

export const useCheckForgotPasswordSession = (sessionToken : string) => {
  
  return useQuery({
    queryKey: ["check-forgot-password-session", sessionToken],
    queryFn: () => fetchCheckForgotPasswordSession(sessionToken),
    refetchOnWindowFocus: false,
    enabled: !!sessionToken.trim()
  });   
};
