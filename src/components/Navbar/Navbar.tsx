import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Home, KeyRound, LogOut, Menu, User } from "lucide-react";
import ChangePasswordModal from "../common/ChangePasswordModal";
import { AVATAR_FALLBACK } from "../../constants";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/profile", label: "Profile", icon: User },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <Link to="/feed" className="flex shrink-0 items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-main text-[10px] font-extrabold tracking-wider text-white sm:size-11">
              ROUTE
            </span>
            <span className="hidden text-xl font-extrabold text-slate-900 sm:inline">
              Route Posts
            </span>
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition sm:px-4 ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-label="Account menu"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3"
            >
              <img
                src={user?.photo || AVATAR_FALLBACK}
                alt={user?.name}
                className="size-9 rounded-full object-cover"
              />
              <span className="hidden max-w-[8rem] truncate text-sm font-semibold text-slate-800 sm:inline">
                {user?.name}
              </span>
              <Menu size={18} className="text-slate-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setChangingPassword(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <KeyRound size={16} />
                  Change password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {changingPassword && (
        <ChangePasswordModal onClose={() => setChangingPassword(false)} />
      )}
    </>
  );
}

export default Navbar;
