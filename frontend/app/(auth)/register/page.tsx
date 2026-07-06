"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router            = useRouter();
  const { login }         = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm]   = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email)           e.email    = "Email is required";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        fullName: form.fullName,
        email:    form.email,
        phone:    form.phone || undefined,
        password: form.password,
      });
      // Auto-login after registration
      await login(form.email, form.password);
      toast.success("Account created! Welcome to Decor Platform.");
      router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <p className="font-display text-3xl text-stone-900">Decor Platform</p>
          </Link>
          <p className="text-stone-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={(e) => field("fullName", e.target.value)}
              error={errors.fullName}
              icon={<User size={14} />}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => field("email", e.target.value)}
              error={errors.email}
              icon={<Mail size={14} />}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+254 700 000 000"
              value={form.phone}
              onChange={(e) => field("phone", e.target.value)}
              icon={<Phone size={14} />}
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => field("password", e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400 border-stone-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => field("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock size={14} />}
            />

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-xs text-stone-400 text-center mt-4">
            By creating an account you agree to our{" "}
            <span className="text-gold-600">Terms of Service</span>.
          </p>

          <div className="mt-5 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link href="/login" className="text-gold-600 hover:text-gold-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}