import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { AtSign, Calendar, KeyRound, Mail, User, Users } from "lucide-react";
import { Button } from "@heroui/react";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../lib/api";

const initialForm = {
  name: "",
  username: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  password: "",
  rePassword: "",
};

function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.rePassword) {
      setError("Password and confirmation do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loggedIn = await register({
        ...form,
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      });
      if (loggedIn) {
        navigate("/feed");
      } else {
        showToast("Account created, please log in", "success");
        navigate("/login");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not create your account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout tab="register">
      <h2 className="text-3xl font-extrabold text-slate-900">Create a new account</h2>
      <p className="mt-2 text-slate-500">It is quick and easy.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <AuthField
          icon={User}
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <AuthField
          icon={AtSign}
          name="username"
          placeholder="Username (optional)"
          value={form.username}
          onChange={handleChange}
        />
        <AuthField
          icon={Mail}
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <div className="relative">
          <Users
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base text-slate-700 outline-none focus:border-main"
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <AuthField
          icon={Calendar}
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
          required
        />
        <AuthField
          icon={KeyRound}
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <AuthField
          icon={KeyRound}
          type="password"
          name="rePassword"
          placeholder="Confirm password"
          value={form.rePassword}
          onChange={handleChange}
          required
        />
        <Button
          type="submit"
          variant="primary"
          isDisabled={loading}
          className="h-14 w-full rounded-2xl bg-main text-lg font-bold text-white"
        >
          {loading ? "Creating account..." : "Create New Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;
