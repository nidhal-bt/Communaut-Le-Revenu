import { describe, expect, it } from "vitest";
import {
  discussionHref,
  documentIdFromSlug,
  slugifyTitle,
} from "./discussion-slug";

describe("slugifyTitle", () => {
  it("retire les diacritiques et la ponctuation", () => {
    expect(slugifyTitle("Épargne & placements : où investir ?")).toBe(
      "epargne-placements-ou-investir",
    );
  });

  it("supprime l'apostrophe au lieu d'en faire un tiret", () => {
    expect(slugifyTitle("Qu'est-ce qu'un PEA ?")).toBe("quest-ce-quun-pea");
  });

  it("coupe sur une frontière de mot et ne laisse pas de tiret final", () => {
    /* 30 fois « mot » : 119 caractères, dont la coupe à 72 tombe pile sur un
       tiret. C'est le cas que `cap` doit reculer d'un mot. */
    const slug = slugifyTitle(Array(30).fill("mot").join(" "));

    expect(slug.length).toBe(71);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("ne rend rien d'un titre fait de ponctuation", () => {
    expect(slugifyTitle("??? !!! ...")).toBe("");
  });
});

describe("discussionHref", () => {
  it("accole le titre slugifié et le documentId", () => {
    expect(
      discussionHref({
        documentId: "abc123xyz",
        title: "Faut-il ouvrir un PEA avant la fin de l'année ?",
      }),
    ).toBe("/discussions/faut-il-ouvrir-un-pea-avant-la-fin-de-lannee-abc123xyz");
  });

  it("ne porte que l'identifiant quand le titre ne laisse rien à slugifier", () => {
    expect(discussionHref({ documentId: "abc123xyz", title: "??? !!!" })).toBe(
      "/discussions/abc123xyz",
    );
  });
});

describe("documentIdFromSlug", () => {
  it("retrouve l'identifiant écrit par discussionHref", () => {
    const discussion = {
      documentId: "abc123xyz",
      title: "Faut-il ouvrir un PEA avant la fin de l'année ?",
    };
    const slug = discussionHref(discussion).replace("/discussions/", "");

    expect(documentIdFromSlug(slug)).toBe(discussion.documentId);
  });

  it("accepte un documentId nu, sans titre devant", () => {
    expect(documentIdFromSlug("abc123xyz")).toBe("abc123xyz");
  });
});
