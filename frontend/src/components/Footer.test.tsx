import { describe, it, expect } from "vitest";
import { render, screen } from "../test/test-utils";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the FORGED branding", () => {
    render(<Footer />);
    expect(screen.getByText("FORGED")).toBeInTheDocument();
  });

  it("displays the prototype badge", () => {
    render(<Footer />);
    expect(screen.getByText("Prototype")).toBeInTheDocument();
  });

  it("shows project description", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Gemini-powered exploration of athletic archetypes/)
    ).toBeInTheDocument();
  });

  it("credits Team USA and Google Cloud", () => {
    render(<Footer />);
    expect(screen.getByText("Team USA")).toBeInTheDocument();
    expect(screen.getByText("Google Cloud")).toBeInTheDocument();
  });

  it("shows Gemini and Imagen branding", () => {
    render(<Footer />);
    expect(screen.getByText("Gemini")).toBeInTheDocument();
    expect(screen.getByText("Imagen")).toBeInTheDocument();
  });

  it("includes disclaimer about prototype nature", () => {
    render(<Footer />);
    expect(
      screen.getByText(/This is a fan experience prototype/)
    ).toBeInTheDocument();
  });

  it("mentions Paralympic parity", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Paralympic and Olympic sports receive equal analytical depth/)
    ).toBeInTheDocument();
  });
});
