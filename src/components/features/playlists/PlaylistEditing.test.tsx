import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Playlist } from "@/types/playlist";
import { PlaylistList } from "./PlaylistList";
import { PlaylistTracks } from "./PlaylistTracks";

const toast = vi.hoisted(() => ({ info: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
vi.mock("@/contexts/usePlayback", () => ({
  usePlayback: () => ({ setShuffle: vi.fn(), setQueue: vi.fn(), play: vi.fn() }),
}));

const playlist: Playlist = {
  id: "p1",
  userId: "u1",
  name: "Vazon mandona",
  description: null,
  coverUrl: null,
  visibility: "PRIVATE",
  version: 1,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
};

describe("PlaylistList", () => {
  const props = {
    playlists: [playlist],
    selectedId: "p1",
    onSelect: vi.fn(),
    onCreate: vi.fn(),
    onDelete: vi.fn(),
    onRename: vi.fn(),
    sortMode: "updated" as const,
    onSortModeChange: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("places the sort label above its select", () => {
    render(<PlaylistList {...props} />);

    const select = screen.getByLabelText("Sort");
    const label = select.closest("label")!;
    expect(label).toHaveClass("flex-col");
    expect(label.firstChild?.textContent).toBe("Sort");
  });

  it("shows a toast when a rename is submitted without changes", () => {
    render(<PlaylistList {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Rename Vazon mandona" }));
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));

    expect(toast.info).toHaveBeenCalledWith("No changes to save");
    expect(props.onRename).not.toHaveBeenCalled();
  });

  it("gives every icon button a tooltip", () => {
    render(<PlaylistList {...props} />);

    screen.getAllByRole("button").forEach((button) => {
      if (!button.textContent?.trim()) expect(button).toHaveAttribute("title");
    });
  });
});

describe("PlaylistTracks", () => {
  const props = {
    playlist,
    items: [],
    onRemove: vi.fn(),
    onRemoveMany: vi.fn(),
    onReorder: vi.fn(),
    onDuplicate: vi.fn(),
    onUpdateDescription: vi.fn().mockResolvedValue(undefined),
    onUpdateVisibility: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("offers a labelled 'add a description' action instead of a lone pen", () => {
    render(<PlaylistTracks {...props} />);

    expect(screen.getByRole("button", { name: "Add a description" })).toBeInTheDocument();
  });

  it("toasts when the description is saved without changes", () => {
    render(<PlaylistTracks {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a description" }));
    fireEvent.click(screen.getByRole("button", { name: "Save description" }));

    expect(toast.info).toHaveBeenCalledWith("No changes to save");
    expect(props.onUpdateDescription).not.toHaveBeenCalled();
  });

  it("saves an edited description", async () => {
    render(<PlaylistTracks {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Add a description" }));
    fireEvent.change(screen.getByLabelText("Playlist description"), { target: { value: "Malagasy classics" } });
    fireEvent.click(screen.getByRole("button", { name: "Save description" }));

    await waitFor(() => expect(props.onUpdateDescription).toHaveBeenCalledWith("Malagasy classics"));
  });
});
