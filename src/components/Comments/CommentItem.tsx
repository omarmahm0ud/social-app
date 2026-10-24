import type { ReactNode } from "react";
import { AVATAR_FALLBACK } from "../../constants";
import { formatDateTime } from "../../lib/date";
import type { CommentI } from "../../types/comment.types";

interface CommentItemProps {
  comment: CommentI;
  menu?: ReactNode;
  body?: ReactNode;
}

export default function CommentItem({ comment, menu, body }: CommentItemProps) {
  const creator = comment.commentCreator;

  return (
    <div className="flex items-start gap-2.5">
      <img
        src={creator?.photo || AVATAR_FALLBACK}
        alt={creator?.name}
        className="mt-0.5 size-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-4 py-2.5">
          <p className="text-sm font-bold text-gray-900">{creator?.name}</p>
          <p className="text-xs text-gray-500">
            {creator?.username ? `@${creator.username} · ` : ""}
            {formatDateTime(comment.createdAt)}
          </p>
          {body ??
            (comment.content && (
              <p className="mt-1 break-words text-sm leading-5 text-gray-800">
                {comment.content}
              </p>
            ))}
          {comment.image && (
            <img
              src={comment.image}
              alt="Comment attachment"
              className="mt-2 max-h-40 rounded-lg object-cover"
            />
          )}
        </div>
      </div>
      {menu}
    </div>
  );
}
