import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "../App";

describe("App Component", () => {
  it("renders the app with initial count", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ state: { count: 0 } }),
    });

    render(<App />);

    expect(await screen.findByText(/count is 0/i)).toBeInTheDocument();
  });

  it("increments the count when the button is clicked", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ state: { count: 0 } }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ state: { count: 1 } }),
      });

    render(<App />);

    const button = await screen.findByText(/count is 0/i);
    fireEvent.click(button);

    expect(await screen.findByText(/count is 1/i)).toBeInTheDocument();
  });
});
