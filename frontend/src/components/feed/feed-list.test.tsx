import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Category, Discussion } from "@/types/models";
import { FeedList } from "./feed-list";

const category: Category = {
  id: 1,
  documentId: "cat-epargne",
  createdAt: "2026-01-01T10:00:00.000Z",
  updatedAt: "2026-01-01T10:00:00.000Z",
  publishedAt: "2026-01-01T10:00:00.000Z",
  name: "Épargne & placements",
  slug: "epargne",
  description: null,
  icon: "piggy-bank",
  color: "#34c759",
};

const discussions: Discussion[] = [
  {
    id: 1,
    documentId: "disc-pea",
    createdAt: "2026-01-02T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
    publishedAt: "2026-01-02T10:00:00.000Z",
    title: "Faut-il ouvrir un PEA avant la fin de l'année ?",
    content: "J'hésite entre un PEA et un compte-titres pour commencer.",
    type: "question",
    replyCount: 12,
    author: { documentId: "user-vincent", username: "Vincent" },
    category,
  },
  {
    id: 2,
    documentId: "disc-scpi",
    createdAt: "2026-01-03T10:00:00.000Z",
    updatedAt: "2026-01-03T10:00:00.000Z",
    publishedAt: "2026-01-03T10:00:00.000Z",
    title: "Vos retours sur les SCPI européennes",
    content: "Les rendements annoncés tiennent-ils dans la durée ?",
    type: "discussion",
    replyCount: 0,
    author: { documentId: "user-karim", username: "Karim" },
    category,
  },
];

describe("FeedList", () => {
  it("affiche les titres, les auteurs et les compteurs de réponses en vue détaillée", () => {
    render(<FeedList discussions={discussions} view="comfy" tab="tendances" />);

    expect(
      screen.getByRole("heading", {
        name: "Faut-il ouvrir un PEA avant la fin de l'année ?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Vos retours sur les SCPI européennes" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Vincent")).toBeInTheDocument();
    expect(screen.getByText("Karim")).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("12 rép.")).toBeInTheDocument();
    expect(screen.getByText("0 rép.")).toBeInTheDocument();
  });

  it("affiche les titres, les auteurs et les compteurs de réponses en vue compacte", () => {
    render(<FeedList discussions={discussions} view="compact" tab="tendances" />);

    expect(
      screen.getByText("Faut-il ouvrir un PEA avant la fin de l'année ?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Vos retours sur les SCPI européennes"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Épargne & placements · Vincent"),
    ).toBeInTheDocument();
    expect(screen.getByText("Épargne & placements · Karim")).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
