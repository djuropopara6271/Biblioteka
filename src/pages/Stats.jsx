import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function Stats() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setError("");
    try {
      const [uRes, bRes, lRes] = await Promise.all([
        axios.get("http://localhost:3001/users"),
        axios.get("http://localhost:3001/books"),
        axios.get("http://localhost:3001/loans"),
      ]);

      setUsers(uRes.data);
      setBooks(bRes.data);
      setLoans(lRes.data);
    } catch (e) {
      setError("Greška pri učitavanju statistike (proveri da li server radi).");
    }
  };

  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  const bookMap = useMemo(
    () => Object.fromEntries(books.map((b) => [b.id, b])),
    [books]
  );

  const loansByUser = useMemo(() => {
    const counts = {};
    for (const loan of loans) {
      counts[loan.userId] = (counts[loan.userId] || 0) + 1;
    }

    const rows = Object.entries(counts).map(([userId, count]) => ({
      userId: Number(userId),
      name: userMap[Number(userId)]?.name || `User #${userId}`,
      count,
    }));

    rows.sort((a, b) => b.count - a.count);
    return rows;
  }, [loans, userMap]);

  const loansByBook = useMemo(() => {
    const counts = {};
    for (const loan of loans) {
      counts[loan.bookId] = (counts[loan.bookId] || 0) + 1;
    }

    const rows = Object.entries(counts).map(([bookId, count]) => ({
      bookId: Number(bookId),
      title: bookMap[Number(bookId)]?.title || `Book #${bookId}`,
      author: bookMap[Number(bookId)]?.author || "",
      count,
    }));

    rows.sort((a, b) => b.count - a.count);
    return rows;
  }, [loans, bookMap]);

  const maxUser = loansByUser[0]?.count || 1;
  const maxBook = loansByBook[0]?.count || 1;

  return (
    <div>
      <h1>Statistika</h1>

      <button onClick={loadAll} style={{ marginBottom: 12 }}>
        Refresh
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Pozajmice po korisniku</h2>
      {loansByUser.length === 0 ? (
        <p>Nema pozajmica.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {loansByUser.map((row) => (
            <li key={row.userId} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <strong>{row.name}</strong>
                </span>
                <span>{row.count}</span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "#eee",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(row.count / maxUser) * 100}%`,
                    background: "#333",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Top knjige po broju pozajmica</h2>
      {loansByBook.length === 0 ? (
        <p>Nema pozajmica.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {loansByBook.slice(0, 10).map((row) => (
            <li key={row.bookId} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <strong>{row.title}</strong>{" "}
                  {row.author ? `— ${row.author}` : ""}
                </span>
                <span>{row.count}</span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "#eee",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(row.count / maxBook) * 100}%`,
                    background: "#333",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
