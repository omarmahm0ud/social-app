import { useEffect, useState } from "react";
import { ChevronDown, Search, UserCheck, UserPlus, Users } from "lucide-react";
import { AVATAR_FALLBACK } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getSuggestions, toggleFollow } from "../../services/users.services";
import { extractAnyList, getErrorMessage } from "../../lib/api";
import type { SuggestedUserI } from "../../types/user.types";

const PAGE_SIZE = 5;

export default function SuggestedFriends() {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [people, setPeople] = useState<SuggestedUserI[]>([]);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  async function loadPeople(nextPage = 1) {
    if (nextPage > 1) setLoadingMore(true);
    try {
      const res = await getSuggestions(nextPage, PAGE_SIZE);
      const list = extractAnyList<SuggestedUserI>(res.data, [
        "suggestions",
        "users",
      ]).filter((item) => item?._id);
      setPeople((current) => (nextPage === 1 ? list : [...current, ...list]));
      setHasMore(list.length === PAGE_SIZE);
      setPage(nextPage);
      setFailed(false);
    } catch {
      if (nextPage === 1) setFailed(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadPeople(1);
  }, []);

  function isFollowing(person: SuggestedUserI) {
    return following[person._id] ?? Boolean(person.isFollowing);
  }

  async function handleToggleFollow(person: SuggestedUserI) {
    const id = person._id;
    if (pending[id]) return;
    const next = !isFollowing(person);
    setPending((current) => ({ ...current, [id]: true }));
    setFollowing((current) => ({ ...current, [id]: next }));
    try {
      await toggleFollow(id);
      showToast(
        next ? `You are now following ${person.name}` : `You unfollowed ${person.name}`,
        "success",
      );
      refreshUser().catch(() => undefined);
    } catch (err) {
      setFollowing((current) => ({ ...current, [id]: !next }));
      showToast(getErrorMessage(err, "Could not update follow status"), "error");
    } finally {
      setPending((current) => ({ ...current, [id]: false }));
    }
  }

  const text = query.trim().toLowerCase();
  const visiblePeople = people.filter((person) => {
    if (!text) return true;
    return (
      person.name?.toLowerCase().includes(text) ||
      person.username?.toLowerCase().includes(text)
    );
  });

  return (
    <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-main">
          <Users size={18} />
          Suggested Friends
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-400">{people.length}</span>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 lg:hidden"
          >
            {open ? "Hide" : "Show"}
            <ChevronDown
              size={16}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className={`space-y-4 ${open ? "block" : "hidden"} lg:block`}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            aria-label="Search friends"
            placeholder="Search friends..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-main/30"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : failed ? (
          <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
            <p>Could not load suggestions.</p>
            <button
              type="button"
              onClick={() => loadPeople(1)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : visiblePeople.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-3 text-center text-sm text-slate-500">
            No suggestions right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {visiblePeople.map((person) => {
              const followed = isFollowing(person);
              return (
                <li
                  key={person._id}
                  className="space-y-3 rounded-2xl border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={person.photo || AVATAR_FALLBACK}
                      alt={person.name}
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 grow">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {person.name}
                      </p>
                      {person.username && (
                        <p className="truncate text-xs text-gray-500">
                          @{person.username}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={pending[person._id]}
                      onClick={() => handleToggleFollow(person)}
                      className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                        followed
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      {followed ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      {followed ? "Following" : "Follow"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {typeof person.followersCount === "number" && (
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {person.followersCount} followers
                      </span>
                    )}
                    {typeof person.mutualFollowersCount === "number" && (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                        {person.mutualFollowersCount} mutual
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {hasMore && !loading && !failed && (
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => loadPeople(page + 1)}
            className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-main transition hover:bg-gray-200 disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "View more"}
          </button>
        )}
      </div>
    </aside>
  );
}
