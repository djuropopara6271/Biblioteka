import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import Stats from "../../pages/Stats";

vi.mock("axios");

describe("Stats", () => {
  it("Prikazuje statistiku nakon učitavanja", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: [{ id: 1, name: "Admin", role: "admin" }],
      }) // users
      .mockResolvedValueOnce({
        data: [
          { id: 1, title: "Clean Code", author: "Robert", available: false },
        ],
      }) // books
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            userId: 1,
            bookId: 1,
            status: "borrowed",
            date: "2025-12-24",
          },
        ],
      }); // loans

    render(
      <MemoryRouter>
        <Stats />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Statistika/i)).toBeInTheDocument();
    expect(screen.getByText(/Ukupno pozajmica/i)).toBeInTheDocument();
  });
});
