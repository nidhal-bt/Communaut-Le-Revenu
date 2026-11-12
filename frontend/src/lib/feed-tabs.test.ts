import { describe, expect, it } from "vitest";
import { queryForFeedTab } from "./feed-tabs";

describe("queryForFeedTab", () => {
  it("trie « Récentes » par date de publication décroissante", () => {
    expect(queryForFeedTab("recentes")).toEqual({ sort: ["createdAt:desc"] });
  });

  it("départage « Tendances » par date à nombre de réponses égal", () => {
    expect(queryForFeedTab("tendances").sort).toEqual([
      "replyCount:desc",
      "createdAt:desc",
    ]);
  });

  it("compte « Sans réponse » les lignes à zéro comme celles à null", () => {
    expect(queryForFeedTab("sans-reponse").filters).toEqual({
      $or: [{ replyCount: { $eq: 0 } }, { replyCount: { $null: true } }],
    });
  });

  it("ajoute l'espace au filtre de l'onglet au lieu de le remplacer", () => {
    const { filters } = queryForFeedTab("sans-reponse", undefined, "bourse");

    expect(filters).toEqual({
      $or: [{ replyCount: { $eq: 0 } }, { replyCount: { $null: true } }],
      category: { slug: { $eq: "bourse" } },
    });
  });

  it("filtre « Pour vous » sur les discussions où le membre a répondu", () => {
    expect(queryForFeedTab("pour-vous", 7).filters).toEqual({
      replies: { author: { id: { $eq: 7 } } },
    });
  });

  it("ne filtre pas « Pour vous » sans identifiant de membre", () => {
    expect(queryForFeedTab("pour-vous").filters).toBeUndefined();
  });
});
