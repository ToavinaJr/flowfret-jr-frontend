import { activeMentionAt, mentionSegments } from "./mentions";

const alice = { id: "1", username: "alice" };

describe("mentions", () => {
  it("links only users confirmed by the API", () => {
    expect(mentionSegments("Salut @alice et @inconnu", [alice])).toEqual([
      { text: "Salut " },
      { text: "@alice", user: alice },
      { text: " et @inconnu" },
    ]);
  });

  it("does not detect an email as an active mention", () => {
    expect(activeMentionAt("mail@example", 12)).toBeNull();
    expect(activeMentionAt("Salut @ali", 10)).toEqual({ start: 6, query: "ali" });
  });
});
