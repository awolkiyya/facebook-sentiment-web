import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";

interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const useUpdatePassword = () => {
  const router = useRouter();

  return useMutation<unknown, Error, UpdatePasswordPayload>({
    mutationFn: (payload) => authService.updatePassword(payload),

    onSuccess: async () => {
      try {
        await authService.logout();
      } finally {
        router.push("/auth/login");
      }
    },
  });
};
