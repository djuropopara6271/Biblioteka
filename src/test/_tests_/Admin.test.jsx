import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import Admin from "../../pages/Admin";

vi.mock("axios");

describe("Admin", () => {
  it("Učita i prikaže listu knjiga", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, title: "Clean Code", author: "Robert" }],
    });

    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Clean Code/i)).toBeInTheDocument();
  });
});
