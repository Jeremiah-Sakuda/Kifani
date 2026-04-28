import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../test/test-utils";
import FormInput from "./FormInput";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("FormInput", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the form with required fields", () => {
    render(<FormInput />);

    expect(screen.getByText("Physical Traits")).toBeInTheDocument();
    expect(screen.getByText(/Height/)).toBeInTheDocument();
    expect(screen.getByText(/Weight/)).toBeInTheDocument();
  });

  it("renders optional fields section", () => {
    render(<FormInput />);

    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByText("Arm Span")).toBeInTheDocument();
    expect(screen.getByText("Age Range")).toBeInTheDocument();
    expect(screen.getByText("Activity Preference")).toBeInTheDocument();
  });

  it("renders all activity options", () => {
    render(<FormInput />);

    expect(screen.getByText("Strength")).toBeInTheDocument();
    expect(screen.getByText("Endurance")).toBeInTheDocument();
    expect(screen.getByText("Precision")).toBeInTheDocument();
    expect(screen.getByText("Speed")).toBeInTheDocument();
    expect(screen.getByText("Flexibility")).toBeInTheDocument();
  });

  it("allows selecting activity preferences", () => {
    render(<FormInput />);

    const strengthButton = screen.getByText("Strength").closest("button");
    expect(strengthButton).toBeInTheDocument();

    fireEvent.click(strengthButton!);
    expect(strengthButton).toHaveClass("bg-gold-core/20");
  });

  it("allows toggling activity preferences off", () => {
    render(<FormInput />);

    const strengthButton = screen.getByText("Strength").closest("button");

    // Select
    fireEvent.click(strengthButton!);
    expect(strengthButton).toHaveClass("bg-gold-core/20");

    // Deselect
    fireEvent.click(strengthButton!);
    expect(strengthButton).not.toHaveClass("bg-gold-core/20");
  });

  it("displays submit button", () => {
    render(<FormInput />);

    expect(screen.getByText("Find My Archetype")).toBeInTheDocument();
  });

  it("shows error when submitting with invalid data", () => {
    render(<FormInput />);

    const submitButton = screen.getByText("Find My Archetype");
    fireEvent.click(submitButton);

    // Form validation should prevent submission or show error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("applies prefill data when provided", () => {
    const prefillData = {
      height_cm: 180,
      weight_kg: 75,
      arm_span_cm: 185,
      activity_preferences: ["strength"],
    };

    render(<FormInput prefillData={prefillData} />);

    // Check prefill note is shown
    expect(
      screen.getByText(/Values pre-filled from analysis/)
    ).toBeInTheDocument();
  });

  it("allows dismissing prefill note", () => {
    const prefillData = {
      height_cm: 180,
      weight_kg: 75,
    };

    render(<FormInput prefillData={prefillData} />);

    // Find and click dismiss button
    const dismissButton = screen
      .getByText(/Values pre-filled from analysis/)
      .closest("div")!
      .querySelector("button");

    fireEvent.click(dismissButton!);

    expect(
      screen.queryByText(/Values pre-filled from analysis/)
    ).not.toBeInTheDocument();
  });

  it("renders age range dropdown with options", () => {
    render(<FormInput />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Check for age range options
    expect(screen.getByText("Select age range")).toBeInTheDocument();
  });
});
