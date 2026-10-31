import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar } from "./UserAvatar";

describe("UserAvatar", () => {
  it("falls back to initials when the image cannot be loaded", () => {
    render(<UserAvatar src="https://cdn.example/avatar.png" name="Alice" alt="Alice avatar" />);

    fireEvent.error(screen.getByRole("img", { name: "Alice avatar" }).querySelector("img")!);

    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("shows initials when no image is available", () => {
    render(<UserAvatar name="Flow Fret" />);

    expect(screen.getByText("FL")).toBeInTheDocument();
  });
});
