import type { ReactNode } from "react";
import { Link, Navigate } from "react-router";
import AuthIntro from "../Authintro/Authintro";
import { useAuth } from "../../context/AuthContext";

interface AuthLayoutProps {
  tab: "login" | "register";
  children: ReactNode;
}

const tabClass = (active: boolean) =>
  `rounded-xl px-4 py-2.5 text-center text-sm font-bold transition ${
    active ? "bg-white text-blue-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
  }`;

export default function AuthLayout({ tab, children }: AuthLayoutProps) {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/feed" replace />;

  return (
    <main className="min-h-screen bg-sec px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.25fr_1fr]">
        <AuthIntro />
        <section className="w-full max-w-xl justify-self-center rounded-3xl bg-white p-6 shadow-sm sm:p-8 lg:justify-self-end">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
            <Link to="/login" className={tabClass(tab === "login")}>
              Login
            </Link>
            <Link to="/register" className={tabClass(tab === "register")}>
              Register
            </Link>
          </div>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
