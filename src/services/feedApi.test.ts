import { beforeEach, describe, expect, it, vi } from "vitest";
import { graphqlRequest } from "@/services/graphqlClient";
import { fetchFeedPost } from "./feedApi";

vi.mock("@/services/graphqlClient", () => ({
  graphqlRequest: vi.fn(),
}));

const graphqlRequestMock = vi.mocked(graphqlRequest);

describe("feed API", () => {
  beforeEach(() => graphqlRequestMock.mockReset());

  it("envoie une requête GraphQL complète pour charger une publication", async () => {
    const post = { id: "post-id", content: "Publication" };
    graphqlRequestMock.mockResolvedValue({ post });

    await expect(fetchFeedPost("post-id")).resolves.toEqual(post);

    const options = graphqlRequestMock.mock.calls[0]?.[0];
    expect(options?.variables).toEqual({ id: "post-id" });
    const query = options?.query ?? "";
    expect(query.match(/{/g)?.length).toBe(query.match(/}/g)?.length);
  });
});
