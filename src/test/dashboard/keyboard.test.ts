import { describe, expect, it, vi } from "vitest";
import { handleArrowKeys } from "@/lib/keyboard";

function setup(html: string) {
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.replaceChildren(root);
  return root;
}
const key = (target: HTMLElement, k: string) => {
  const e = { key: k, target, altKey: false, ctrlKey: false, metaKey: false, preventDefault: vi.fn() };
  return e as unknown as KeyboardEvent;
};

describe("arrow-key navigation", () => {
  it("moves down and up between menu links and stops at the ends", () => {
    const root = setup('<a href="#a">A</a><a href="#b">B</a><a href="#c">C</a>');
    const [a, b, c] = Array.from(root.querySelectorAll("a"));
    a!.focus();
    handleArrowKeys(key(a!, "ArrowDown"), root);
    expect(document.activeElement).toBe(b);
    handleArrowKeys(key(b!, "End"), root);
    expect(document.activeElement).toBe(c);
    handleArrowKeys(key(c!, "ArrowDown"), root);
    expect(document.activeElement).toBe(c);
    handleArrowKeys(key(c!, "Home"), root);
    expect(document.activeElement).toBe(a);
  });

  it("skips links inside a collapsed (inert) submenu", () => {
    const root = setup('<a href="#a">A</a><div inert><a href="#hidden">Hidden</a></div><a href="#c">C</a>');
    const a = root.querySelector<HTMLElement>('a[href="#a"]')!;
    a.focus();
    handleArrowKeys(key(a, "ArrowDown"), root);
    expect(document.activeElement).toBe(root.querySelector('a[href="#c"]'));
  });

  it("wraps around tabs and selects the newly focused tab", () => {
    const root = setup('<button role="tab">All</button><button role="tab">Unread</button>');
    const [all, unread] = Array.from(root.querySelectorAll("button"));
    const clicked = vi.fn();
    unread!.addEventListener("click", clicked);
    all!.focus();
    handleArrowKeys(key(all!, "ArrowLeft"), root, { selector: '[role="tab"]', orientation: "horizontal", loop: true, activate: true });
    expect(document.activeElement).toBe(unread);
    expect(clicked).toHaveBeenCalledOnce();
  });

  it("leaves Home and End to the text cursor inside a search field", () => {
    const root = setup('<input aria-label="Search" /><a href="#r">Result</a>');
    const input = root.querySelector("input")!;
    input.focus();
    expect(handleArrowKeys(key(input, "End"), root, { selector: "input, a[href]" })).toBe(false);
    expect(document.activeElement).toBe(input);
    handleArrowKeys(key(input, "ArrowDown"), root, { selector: "input, a[href]" });
    expect(document.activeElement).toBe(root.querySelector("a"));
  });
});
