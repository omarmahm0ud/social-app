import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import Post from "../../components/Post/Post";
import PostSkeleton from "../../components/Post/PostSkeleton";
import CommentsSection from "../../components/Comments/CommentsSection";
import { getPost } from "../../services/posts.services";
import { extractObject } from "../../lib/api";
import type { PostCardI } from "../../types/postCard.types";

function isPost(value: unknown): value is PostCardI {
  const candidate = value as Partial<PostCardI> | null | undefined;
  return Boolean(candidate?._id && candidate.user?._id);
}

function PostDetails() {
  const { postId = "" } = useParams<{ postId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const statePost = (location.state as { post?: PostCardI } | null)?.post;
  const initialPost = statePost && statePost._id === postId ? statePost : null;
  const [post, setPost] = useState<PostCardI | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  async function loadPost() {
    try {
      const res = await getPost(postId);
      const fetched = extractObject<unknown>(res.data, "post");
      if (isPost(fetched)) {
        setPost(fetched);
        setError("");
      } else if (!initialPost) {
        setError("This post could not be loaded");
      }
    } catch {
      if (!initialPost) setError("This post could not be loaded");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPost();
  }, [postId]);

  function handleUpdated() {
    setVersion((value) => value + 1);
    loadPost();
  }

  function handleCountChange(delta: number) {
    setPost((current) =>
      current
        ? { ...current, commentsCount: Math.max(0, (current.commentsCount ?? 0) + delta) }
        : current,
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        to="/feed"
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back
      </Link>

      {loading ? (
        <PostSkeleton />
      ) : error || !post ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {error || "This post could not be loaded"}
        </p>
      ) : (
        <Post
          key={`${post._id}-${version}`}
          post={post}
          variant="details"
          onDeleted={() => navigate("/feed")}
          onUpdated={handleUpdated}
        >
          <CommentsSection
            postId={post._id}
            postOwnerId={post.user?._id}
            commentsCount={post.commentsCount ?? 0}
            onCountChange={handleCountChange}
          />
        </Post>
      )}
    </main>
  );
}

export default PostDetails;
