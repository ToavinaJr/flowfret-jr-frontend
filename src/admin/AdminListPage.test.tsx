import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminConnection, AdminListInput } from "@/types/admin";
import AdminListPage, { type AdminColumn, type AdminFilter } from "./AdminListPage";

interface Row {
  id: string;
  name: string;
}

const columns: AdminColumn<Row>[] = [
  { key: "name", labelKey: "admin.columns.user", render: (row) => row.name },
];

const filters: AdminFilter[] = [
  {
    key: "role",
    labelKey: "admin.filters.role",
    options: [{ value: "ADMIN", labelKey: "admin.values.ADMIN" }],
  },
];

type FetchPage = (input: AdminListInput) => Promise<AdminConnection<Row>>;

function renderList(fetchPage: FetchPage, extraProps: Record<string, unknown> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/admin/users"]}>
        <AdminListPage
          section="users"
          queryKey="users"
          fetchPage={fetchPage}
          columns={columns}
          filters={filters}
          {...extraProps}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AdminListPage", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("renders rows returned by fetchPage", async () => {
    const fetchPage = vi.fn<FetchPage>().mockResolvedValue({
      nodes: [{ id: "1", name: "Ada Lovelace" }],
      totalCount: 1,
      pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null },
    });
    renderList(fetchPage);
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledWith(
      expect.objectContaining({ first: 25, direction: "DESC" }),
    );
  });

  it("debounces the free-text search before calling fetchPage", async () => {
    const fetchPage = vi.fn<FetchPage>().mockResolvedValue({
      nodes: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null },
    });
    renderList(fetchPage);
    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByPlaceholderText("Search this section…"), {
      target: { value: "ada" },
    });
    expect(fetchPage).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(400);
    await vi.waitFor(() =>
      expect(fetchPage).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "ada" }),
      ),
    );
  });

  it("applies a select filter immediately and shows a removable chip", async () => {
    const fetchPage = vi.fn<FetchPage>().mockResolvedValue({
      nodes: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null },
    });
    renderList(fetchPage);
    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "ADMIN" },
    });
    await vi.waitFor(() =>
      expect(fetchPage).toHaveBeenLastCalledWith(
        expect.objectContaining({ role: "ADMIN" }),
      ),
    );

    const chip = await screen.findByText("Role: Administrator");
    fireEvent.click(chip);
    await vi.waitFor(() =>
      expect(fetchPage).toHaveBeenLastCalledWith(
        expect.not.objectContaining({ role: "ADMIN" }),
      ),
    );
    expect(screen.queryByText("Role: Administrator")).not.toBeInTheDocument();
  });

  it("passes the selected sort direction to fetchPage", async () => {
    const fetchPage = vi.fn<FetchPage>().mockResolvedValue({
      nodes: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null },
    });
    renderList(fetchPage);
    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Sort"), {
      target: { value: "ASC" },
    });
    await vi.waitFor(() =>
      expect(fetchPage).toHaveBeenLastCalledWith(
        expect.objectContaining({ direction: "ASC" }),
      ),
    );
  });

  it("hides the sort control when showSort is false", async () => {
    const fetchPage = vi.fn<FetchPage>().mockResolvedValue({
      nodes: [],
      totalCount: 0,
      pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null },
    });
    renderList(fetchPage, { showSort: false });
    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));
    expect(screen.queryByLabelText("Sort")).not.toBeInTheDocument();
    expect(fetchPage).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ direction: expect.anything() }),
    );
  });
});
