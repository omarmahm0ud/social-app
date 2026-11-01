import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { KeyRound, User } from "lucide-react";
import { Button } from "@heroui/react";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/auth.services";
import { loginSchema, type LoginValues } from "../../schemas/auth.schema";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) =>
      loginUser(
        values.identifier.includes("@")
          ? { email: values.identifier, password: values.password }
          : { username: values.identifier, password: values.password },
      ),
    onSuccess: ({ data }) => {
      const token = data.data?.token ?? data.token;
      if (token) {
        login(token);
        navigate("/feed");
      }
    },
  });

  const serverError = axios.isAxiosError(loginMutation.error)
    ? loginMutation.error.response?.data?.message
    : "";

  return (
    <AuthLayout tab="login">
      <h2 className="text-3xl font-extrabold text-slate-900">Log in to Route Posts</h2>
      <p className="mt-2 text-slate-500">Log in and continue your social journey.</p>

      <form
        noValidate
        onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        className="mt-6 space-y-4"
      >
        {loginMutation.isError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError || "Invalid login credentials"}
          </p>
        )}
        <AuthField
          icon={User}
          type="text"
          placeholder="Email or username"
          error={errors.identifier?.message}
          {...register("identifier")}
        />
        <AuthField
          icon={KeyRound}
          type="password"
          placeholder="Password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button
          type="submit"
          variant="primary"
          isDisabled={loginMutation.isPending}
          className="h-14 w-full rounded-2xl bg-main text-lg font-bold text-white"
        >
          {loginMutation.isPending ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
