import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { KeyRound, User } from "lucide-react";
import { Button } from "@heroui/react";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/api";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(identifier.trim(), password);
      navigate("/feed");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid login credentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout tab="login">
      <h2 className="text-3xl font-extrabold text-slate-900">Log in to Route Posts</h2>
      <p className="mt-2 text-slate-500">Log in and continue your social journey.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <AuthField
          icon={User}
          type="text"
          placeholder="Email or username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />
        <AuthField
          icon={KeyRound}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button
          type="submit"
          variant="primary"
          isDisabled={loading}
          className="h-14 w-full rounded-2xl bg-main text-lg font-bold text-white"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
