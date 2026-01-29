import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import Home from "../../pages/Home";

vi.mock("axios");

// mock AuthContext (ulogovan user)
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: 3, name: "Djuro", role: "user" } }),
}));

describe("Home", () => {
  it("Prikazuje knjige sa API", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: "Clean Code", author: "Robert", available: false },
        { id: 2, title: "JavaScript", author: "Milos", available: true },
      ],
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Clean Code/i)).toBeInTheDocument();
    expect(screen.getByText(/JavaScript/i)).toBeInTheDocument();
  });

  it("Dugme Pozajmi je disabled ako knjiga nije dostupna", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, title: "Clean Code", author: "Robert", available: false },
      ],
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await screen.findByText(/Clean Code/i);
    const btn = screen.getByRole("button", { name: /Pozajmi/i });
    expect(btn).toBeDisabled();
  });
});
