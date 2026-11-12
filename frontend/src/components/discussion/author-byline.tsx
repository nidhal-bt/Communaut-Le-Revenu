import { Avatar, type AvatarSize } from "@/components/avatar";
import { formatRelativeTime } from "@/lib/relative-time";
import type { PublicAuthor } from "@/types/models";

/**
 * Les `roleTags`, les points, les badges et le compteur de vues de la maquette ne
 * sont pas repris : aucun n'existe côté backend.
 */
export const AuthorByline = ({
  author,
  createdAt,
  size,
}: {
  author: PublicAuthor | null | undefined;
  createdAt: string;
  size: AvatarSize;
}) => {
  /* Serveur et client ne calculent pas l'écart au même instant ; l'attribut
     garde la valeur exacte, lisible par la machine. */
  const when = (
    <time dateTime={createdAt} suppressHydrationWarning>
      {formatRelativeTime(createdAt)}
    </time>
  );

  if (!author) {
    return <p className="text-[12.5px] text-muted-foreground">{when}</p>;
  }

  return (
    <div className="flex items-center gap-[11px]">
      <Avatar username={author.username} size={size} />

      <div>
        <p className="font-semibold">{author.username}</p>
        <p className="text-[12.5px] text-muted-foreground">{when}</p>
      </div>
    </div>
  );
};
