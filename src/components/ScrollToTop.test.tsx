import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Link, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ScrollToTop from "./ScrollToTop";

describe("ScrollToTop", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("remonte en haut lors d'une navigation vers une nouvelle route", async () => {
    const scrollTo = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);

    const { getByRole } = render(
      <MemoryRouter initialEntries={["/"]}>
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={<Link to="/music">Ouvrir la musique</Link>}
          />
          <Route path="/music" element={<p>Musique</p>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(getByRole("link", { name: "Ouvrir la musique" }));

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  });
});
