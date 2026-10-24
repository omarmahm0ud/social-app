import { Bookmark, Globe, Newspaper, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

const links = [
  { id: "feed", label: "Feed", icon: Newspaper, to: "/feed" },
  { id: "my-posts", label: "My Posts", icon: Sparkles, to: "/feed?view=my-posts" },
  { id: "community", label: "Community", icon: Globe, to: "" },
  { id: "saved", label: "Saved", icon: Bookmark, to: "/feed?view=saved" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");
  const activeLink = view === "my-posts" || view === "saved" ? view : "feed";

  return (
    <aside className="rounded-2xl bg-white p-3 shadow-sm">
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.id === activeLink;

          return (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => {
                  if (link.to) navigate(link.to);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-main/10 text-main"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
