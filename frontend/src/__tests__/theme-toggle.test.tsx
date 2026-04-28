import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

function renderToggle() {
  localStorage.removeItem("acme-theme");
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  it("renders with light mode by default", () => {
    renderToggle();
    expect(
      screen.getByLabelText("Switch to dark mode"),
    ).toBeInTheDocument();
  });

  it("toggles to dark mode on click", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByLabelText("Switch to dark mode"));

    expect(
      screen.getByLabelText("Switch to light mode"),
    ).toBeInTheDocument();
    expect(localStorage.getItem("acme-theme")).toBe("dark");
  });

  it("persists theme to localStorage", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByLabelText("Switch to dark mode"));
    await user.click(screen.getByLabelText("Switch to light mode"));

    expect(localStorage.getItem("acme-theme")).toBe("light");
  });
});
