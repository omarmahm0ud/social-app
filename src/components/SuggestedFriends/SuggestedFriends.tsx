import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Search, UserCheck, UserPlus, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { followUser, getSuggestions } from "../../services/users.service";
import type { FriendI } from "../../types/user.types";

export default function SuggestedFriends() {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const { data: friends = [], isPending } = useQuery({
    queryKey: ["suggestions", limit],
    queryFn: async () => {
      const { data } = await getSuggestions(limit);
      return (data.data.suggestions ?? data.data.users ?? []) as FriendI[];
    },
    placeholderData: keepPreviousData,
  });

  const followMutation = useMutation({
    mutationFn: (id: string) => followUser(id),
    onSuccess: (_response, id) => {
      const isFollowing = followedIds.includes(id);
      setFollowedIds(
        isFollowing ? followedIds.filter((item) => item !== id) : [...followedIds, id],
      );
      showToast(isFollowing ? "Unfollowed" : "You are now following", "success");
      refreshUser();
    },
    onError: () => showToast("Could not update follow status", "error"),
  });

  const visibleFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.username?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-main">
          <Users size={18} />
          Suggested Friends
        </h2>
        <span className="text-sm text-gray-400 font-semibold">
          {friends.length}
        </span>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          aria-label="Search friends"
          placeholder="Search friends..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-main/30"
        />
      </div>

      {isPending ? (
        <p className="text-center text-sm text-gray-400">Loading...</p>
      ) : visibleFriends.length === 0 ? (
        <p className="text-center text-sm text-gray-400">No suggestions right now.</p>
      ) : (
        <ul className="space-y-3">
          {visibleFriends.map((friend) => {
            const isFollowing = followedIds.includes(friend._id);

            return (
              <li
                key={friend._id}
                className="rounded-2xl border border-gray-200 p-3 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.photo || `https://i.pravatar.cc/100?u=${friend._id}`}
                    alt={friend.name}
                    className="size-9 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 grow">
                    <p className="truncate text-sm font-bold text-main">
                      {friend.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      @{friend.username}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={followMutation.isPending}
                    onClick={() => followMutation.mutate(friend._id)}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                      isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-main/10 text-main hover:bg-main/20"
                    }`}
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
                <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {friend.followersCount ?? 0} followers
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setLimit(limit + 5)}
        className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-main transition hover:bg-gray-200"
      >
        View more
      </button>
    </aside>
  );
}
