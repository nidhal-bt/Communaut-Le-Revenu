import { cn } from "@/lib/utils";
import type { Reply } from "@/types/models";
import { AuthorByline } from "./author-byline";
import { POST_SHELL } from "./post-shell";
import { Prose } from "./prose";

/**
 * Les bandeaux « Meilleure réponse » et « Vérifiée par la rédaction », ainsi que la
 * rangée d'actions, demandent des champs que `reply` ne porte pas : ils sont absents.
 */
export const ReplyItem = ({ reply }: { reply: Reply }) => (
  <article className={cn(POST_SHELL, "p-[16px_20px]")}>
    <AuthorByline author={reply.author} createdAt={reply.createdAt} size="sm" />

    <Prose text={reply.content} className="mt-2.5 text-[15px]" />
  </article>
);
