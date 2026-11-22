import { fireEvent, render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { broker, resetToolkit } from "../../../test/toolkit.ts";
import Quiz from "./Quiz.svelte";

vi.mock("#lib", async () => (await import("../../../test/toolkit.ts")).libModule);
// the toolkit's entry point pulls in the avatar and detection stacks
vi.mock("@sermas/toolkit", () => ({ UI_INTERACTION_TOPIC: "ui/interaction" }));

describe("Quiz content", () => {
  beforeEach(resetToolkit);

  const quiz = () => ({
    question: "How many modules?",
    answers: [
      { answerId: "four", answer: "Four", correct: false, reason: "More." },
      { answerId: "eight", answer: "Eight", correct: true, reason: "Yes." },
    ],
  });

  it("publishes the answer once, then keeps only the chosen answer, disabled", async () => {
    render(Quiz, {
      content: quiz() as any,
      metadata: { repositoryId: "r" },
      usedKey: "req-q:1",
    });

    await fireEvent.click(screen.getByRole("button", { name: "Eight" }));

    expect(broker.publish).toHaveBeenCalledWith("ui/interaction/avatar", {
      appId: "example-app",
      sessionId: "ex-session",
      moduleId: "avatar",
      interaction: {
        context: { answerId: "eight", repositoryId: "r" },
        element: "quiz",
        value: "Eight",
      },
    });
    expect(screen.getByText("How many modules?")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Four" })).toBeNull();
    const chosen = screen.getByRole("button", { name: "Eight" });
    expect((chosen as HTMLButtonElement).disabled).toBe(true);

    await fireEvent.click(chosen);
    expect(broker.publish).toHaveBeenCalledOnce();
  });
});
