import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../../pages/Register";

describe("Register", () => {
  it("Renderuje register formu", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText(/Registracija/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Kreiraj nalog/i })
    ).toBeInTheDocument();
  });
});
