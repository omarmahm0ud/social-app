import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AtSign, Calendar, KeyRound, Mail, User, Users } from "lucide-react";
import { Button } from "@heroui/react";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { registerUser } from "../../services/auth.services";
import { registerSchema, type RegisterValues } from "../../schemas/auth.schema";

function Register() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      password: "",
      rePassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, ...rest }: RegisterValues) =>
      registerUser(username ? { ...rest, username } : rest),
    onSuccess: ({ data }) => {
      const token = data.data?.token ?? data.token;
      if (token) {
        login(token);
        navigate("/feed");
      } else {
        showToast("Account created, please log in", "success");
        navigate("/login");
      }
    },
  });

  const serverError = axios.isAxiosError(registerMutation.error)
    ? registerMutation.error.response?.data?.message
    : "";

  return (
    <AuthLayout tab="register">
      <h2 className="text-3xl font-extrabold text-slate-900">Create a new account</h2>
      <p className="mt-2 text-slate-500">It is quick and easy.</p>

      <form
        noValidate
        onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
        className="mt-6 space-y-4"
      >
        {registerMutation.isError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError || "Could not create your account"}
          </p>
        )}
        <AuthField
          icon={User}
          placeholder="Full name"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthField
          icon={AtSign}
          placeholder="Username (optional)"
          error={errors.username?.message}
          {...register("username")}
        />
        <AuthField
          icon={Mail}
          type="email"
          placeholder="Email address"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <div className="relative">
            <Users
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              {...register("gender")}
              className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-base text-slate-700 outline-none focus:border-main ${
                errors.gender ? "border-red-400" : "border-slate-200"
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          {errors.gender && (
            <p className="mt-1.5 px-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
        <AuthField
          icon={Calendar}
          type="date"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />
        <AuthField
          icon={KeyRound}
          type="password"
          placeholder="Password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthField
          icon={KeyRound}
          type="password"
          placeholder="Confirm password"
          error={errors.rePassword?.message}
          {...register("rePassword")}
        />
        <Button
          type="submit"
          variant="primary"
          isDisabled={registerMutation.isPending}
          className="h-14 w-full rounded-2xl bg-main text-lg font-bold text-white"
        >
          {registerMutation.isPending ? "Creating account..." : "Create New Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;
