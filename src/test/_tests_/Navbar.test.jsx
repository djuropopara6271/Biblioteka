import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "../../components/Navbar";

const mockUseAuth = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Navbar", () => {
  it("Guest vidi Login/Register", () => {
    mockUseAuth.mockReturnValue({ user: null, logout: vi.fn() });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.queryByText(/My loans/i)).not.toBeInTheDocument();
  });

  it("User vidi My loans, ne vidi Register/Login", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 3, name: "Djuro", role: "user" },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/My loans/i)).toBeInTheDocument();
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Stats/i)).not.toBeInTheDocument();
  });

  it("Admin vidi Stats", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "Admin", role: "admin" },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Stats/i)).toBeInTheDocument();
  });
});
