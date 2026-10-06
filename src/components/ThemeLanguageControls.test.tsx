import { render } from "@testing-library/react";
import i18n from "@/i18n";
import ThemeLanguageControls from "./ThemeLanguageControls";

describe("ThemeLanguageControls", () => {
  it("does not change the active language when the mobile menu control mounts", async () => {
    window.localStorage.setItem("fretflow-language", "fr");
    await i18n.changeLanguage("fr");

    render(<ThemeLanguageControls compact showTheme={false} />);

    expect(i18n.resolvedLanguage).toBe("fr");
    expect(window.localStorage.getItem("fretflow-language")).toBe("fr");
  });
});
