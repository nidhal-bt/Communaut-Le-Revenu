import { describe, expect, it } from "vitest";
import { feedHref, resolveFeedPage } from "./feed-url";

describe("resolveFeedPage", () => {
  it("retombe sur la première page pour tout ce qui n'est pas un entier positif", () => {
    for (const value of [undefined, "", "abc", "1.5", "-2", "0", " 3"]) {
      expect(resolveFeedPage(value)).toBe(1);
    }
  });

  it("accepte un entier", () => {
    expect(resolveFeedPage("3")).toBe(3);
  });
});

describe("feedHref", () => {
  const params = (query = "") => new URLSearchParams(query);

  it("n'écrit pas l'onglet par défaut", () => {
    expect(feedHref("/", params(), { tab: "tendances" })).toBe("/");
    expect(feedHref("/", params(), { tab: "recentes" })).toBe("/?tab=recentes");
  });

  it("efface la page quand l'onglet change", () => {
    expect(feedHref("/", params("tab=recentes&page=4"), { tab: "tendances" })).toBe(
      "/",
    );
  });

  it("efface la page quand l'espace change", () => {
    expect(feedHref("/", params("page=3"), { category: "bourse" })).toBe(
      "/?category=bourse",
    );
  });

  it("retire le paramètre d'espace pour « Tous les espaces »", () => {
    expect(feedHref("/", params("category=bourse&page=2"), { category: "" })).toBe(
      "/",
    );
  });

  it("n'écrit pas la première page", () => {
    expect(feedHref("/", params("page=5"), { page: 1 })).toBe("/");
  });

  it("conserve les paramètres qui ne sont pas les siens", () => {
    expect(feedHref("/recherche", params("q=pea"), { page: 2 })).toBe(
      "/recherche?q=pea&page=2",
    );
  });
});
