import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function MyLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/loans?userId=${user.id}&status=borrowed`
      );
      setLoans(res.data);
    } catch {
      setError("Greška pri učitavanju pozajmica");
    }
  };

  const returnBook = async (loan) => {
    setError("");

    try {
      await axios.patch(`http://localhost:3001/loans/${loan.id}`, {
        status: "returned",
        returnDate: new Date().toISOString().slice(0, 10),
      });

      await axios.patch(`http://localhost:3001/books/${loan.bookId}`, {
        available: true,
      });

      fetchLoans();
    } catch {
      setError("Greška pri vraćanju knjige");
    }
  };

  return (
    <div>
      <h1>Moje pozajmice</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loans.length === 0 && <p>Nema aktivnih pozajmica.</p>}

      <ul>
        {loans.map((loan) => (
          <li key={loan.id}>
            Knjiga ID: {loan.bookId} | Datum: {loan.date}
            <button style={{ marginLeft: 10 }} onClick={() => returnBook(loan)}>
              Vrati knjigu
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
