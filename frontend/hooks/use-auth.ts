import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "@/components/ui/toast";

export function useLogin() {
  const { login } = useAuthStore();
  const router    = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await login(email, password);
    },
    onSuccess: () => {
      toast.success("Welcome back!");
      router.push("/");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Invalid email or password");
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  const router    = useRouter();

  return useMutation({
    mutationFn: async (input: {
      fullName: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      await api.post("/api/auth/register", input);
      await login(input.email, input.password);
    },
    onSuccess: () => {
      toast.success("Account created! Welcome to Decor Platform.");
      router.push("/");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Registration failed");
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.post("/api/auth/reset-password/request", { email });
    },
    onSuccess: () => {
      toast.success("Check your email for a reset link");
    },
    onError: () => {
      toast.error("Failed to send reset email");
    },
  });
}

export function useConfirmPasswordReset() {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      await api.post("/api/auth/reset-password/confirm", { token, newPassword });
    },
    onSuccess: () => {
      toast.success("Password reset! Please sign in.");
      router.push("/login");
    },
    onError: () => {
      toast.error("Reset link is invalid or expired");
    },
  });
}