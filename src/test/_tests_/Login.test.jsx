import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import Login from "../../pages/Login";

vi.mock("axios");

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// mock AuthContext
const mockLogin = vi.fn();
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe("Login", () => {
  it("Prikazuje error kada nema korisnika", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "x@x.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Lozinka/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    expect(
      await screen.findByText(/Pogrešan email ili lozinka/i)
    ).toBeInTheDocument();
  });

  it("Login uspešan: pozove login() i navigira na /", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 3, name: "Djuro", role: "user" }],
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "djuro@site.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Lozinka/i), {
      target: { value: "djuro123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // čekamo da se završi async
    expect(mockLogin).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
