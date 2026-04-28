import { describe, it, expect } from "vitest";
import { render, screen } from "./test/test-utils";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    // App should render successfully
    expect(document.body).toBeInTheDocument();
  });

  it("includes skip to main content link for accessibility", () => {
    render(<App />);

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("has main content container with id", () => {
    render(<App />);

    const mainContent = document.getElementById("main-content");
    expect(mainContent).toBeInTheDocument();
  });

  it("renders landing page at root route", () => {
    render(<App />);

    // FORGED branding should be visible on landing page
    const forgedElements = screen.getAllByText("FORGED");
    expect(forgedElements.length).toBeGreaterThan(0);
  });
});
