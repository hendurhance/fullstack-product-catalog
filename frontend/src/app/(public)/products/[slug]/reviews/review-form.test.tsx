import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReviewForm } from "./review-form";

const mockSubmit = jest.fn();

jest.mock("./actions", () => ({
  submitReviewAction: (...args: unknown[]) => mockSubmit(...args),
}));

describe("ReviewForm", () => {
  beforeEach(() => {
    mockSubmit.mockReset();
  });

  it("renders all fields", () => {
    render(<ReviewForm productId="prod-1" />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Review")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit review/i }),
    ).toBeInTheDocument();
  });

  it("shows error for short review body", async () => {
    const user = userEvent.setup();
    render(<ReviewForm productId="prod-1" />);

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.click(screen.getByLabelText("5 stars"));
    await user.type(screen.getByLabelText("Review"), "Short");
    await user.click(
      screen.getByRole("button", { name: /submit review/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/at least 10/i)).toBeInTheDocument();
    });
  });

  it("submits valid form", async () => {
    mockSubmit.mockResolvedValue({ ok: true, data: { id: "rev-1" } });
    const user = userEvent.setup();
    render(<ReviewForm productId="prod-1" />);

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.click(screen.getByLabelText("5 stars"));
    await user.type(
      screen.getByLabelText("Review"),
      "This product exceeded all my expectations completely.",
    );
    await user.click(
      screen.getByRole("button", { name: /submit review/i }),
    );

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: "prod-1",
          reviewer_name: "Jane Doe",
          email: "jane@example.com",
          rating: 5,
          body: "This product exceeded all my expectations completely.",
        }),
      );
    });
  });
});
