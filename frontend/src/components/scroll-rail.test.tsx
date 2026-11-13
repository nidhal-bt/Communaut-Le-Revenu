import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrollRail } from "./scroll-rail";

const measures: Array<() => void> = [];

class ObserverStub {
  constructor(private readonly callback: () => void) {
    measures.push(() => this.callback());
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ObserverStub as unknown as typeof ResizeObserver;

/** jsdom ne met rien en page : les trois mesures du rail sont posées à la main. */
const layOut = (
  viewport: HTMLElement,
  widths: { content: number; visible: number; scrollLeft: number },
) => {
  Object.defineProperty(viewport, "scrollWidth", {
    value: widths.content,
    configurable: true,
  });
  Object.defineProperty(viewport, "clientWidth", {
    value: widths.visible,
    configurable: true,
  });
  Object.defineProperty(viewport, "scrollLeft", {
    value: widths.scrollLeft,
    configurable: true,
    writable: true,
  });

  act(() => measures.forEach((measure) => measure()));
};

const renderRail = () => {
  const { container } = render(
    <ScrollRail label="Rail de test">
      <a href="/un">Un</a>
      <a href="/deux">Deux</a>
    </ScrollRail>,
  );

  const viewport = container.querySelector("nav > div") as HTMLElement;
  viewport.scrollBy = vi.fn();

  return { container, viewport };
};

const arrows = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("button"));

afterEach(() => {
  measures.length = 0;
});

describe("ScrollRail", () => {
  it("ne montre aucune flèche tant que le contenu tient dans le rail", () => {
    const { container, viewport } = renderRail();

    layOut(viewport, { content: 300, visible: 300, scrollLeft: 0 });

    expect(arrows(container)).toHaveLength(0);
  });

  it("montre les deux flèches dès que le contenu dépasse, celle du départ désactivée", () => {
    const { container, viewport } = renderRail();

    layOut(viewport, { content: 900, visible: 300, scrollLeft: 0 });

    const [previous, next] = arrows(container);
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
  });

  it("désactive la flèche de fin une fois le bout atteint, sans en démonter aucune", () => {
    const { container, viewport } = renderRail();

    layOut(viewport, { content: 900, visible: 300, scrollLeft: 600 });

    const [previous, next] = arrows(container);
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();
  });

  it("fait glisser de 80 % de la largeur visible au clic", () => {
    const { container, viewport } = renderRail();

    layOut(viewport, { content: 900, visible: 300, scrollLeft: 0 });
    act(() => arrows(container)[1].click());

    expect(viewport.scrollBy).toHaveBeenCalledWith({
      left: 240,
      behavior: "smooth",
    });
  });

  it("traduit la molette verticale en défilement horizontal", () => {
    const { viewport } = renderRail();
    layOut(viewport, { content: 900, visible: 300, scrollLeft: 0 });

    const wheel = new WheelEvent("wheel", { deltaY: 120, cancelable: true });
    viewport.dispatchEvent(wheel);

    expect(wheel.defaultPrevented).toBe(true);
    expect(viewport.scrollLeft).toBe(120);
  });

  it("rend la molette à la page une fois le rail au bout", () => {
    const { viewport } = renderRail();
    layOut(viewport, { content: 900, visible: 300, scrollLeft: 600 });

    const wheel = new WheelEvent("wheel", { deltaY: 120, cancelable: true });
    viewport.dispatchEvent(wheel);

    expect(wheel.defaultPrevented).toBe(false);
    expect(viewport.scrollLeft).toBe(600);
  });
});
