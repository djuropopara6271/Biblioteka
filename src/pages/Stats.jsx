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
    } catch {
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

  // KPI
  const kpi = useMemo(() => {
    const totalLoans = loans.length;
    const activeLoans = loans.filter((l) => l.status === "borrowed").length;
    const returnedLoans = loans.filter((l) => l.status === "returned").length;

    const totalBooks = books.length;
    const availableBooks = books.filter((b) => b.available).length;
    const unavailableBooks = totalBooks - availableBooks;

    const totalUsers = users.length;

    return {
      totalLoans,
      activeLoans,
      returnedLoans,
      totalBooks,
      availableBooks,
      unavailableBooks,
      totalUsers,
    };
  }, [loans, books, users]);

  const loansByUser = useMemo(() => {
    const counts = {};
    for (const loan of loans) {
      counts[loan.userId] = (counts[loan.userId] || 0) + 1;
    }

    const rows = Object.entries(counts).map(([userId, count]) => ({
      userId: Number(userId),
      name: userMap[Number(userId)]?.name || `User #${userId}`,
      role: userMap[Number(userId)]?.role || "",
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
      category: bookMap[Number(bookId)]?.category || "",
      count,
    }));

    rows.sort((a, b) => b.count - a.count);
    return rows;
  }, [loans, bookMap]);

  const maxUser = loansByUser[0]?.count || 1;
  const maxBook = loansByBook[0]?.count || 1;

  const activeLoans = useMemo(() => {
    const now = new Date();

    const rows = loans
      .filter((l) => l.status === "borrowed")
      .map((l) => {
        const u = userMap[l.userId];
        const b = bookMap[l.bookId];
        const start = l.date ? new Date(l.date) : null;

        const days =
          start && !isNaN(start.getTime())
            ? Math.max(
                0,
                Math.floor(
                  (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                )
              )
            : null;

        return {
          id: l.id,
          userName: u?.name || `User #${l.userId}`,
          userRole: u?.role || "",
          bookTitle: b?.title || `Book #${l.bookId}`,
          bookAuthor: b?.author || "",
          category: b?.category || "",
          date: l.date || "-",
          days,
        };
      });

    rows.sort((a, b) => (b.days ?? -1) - (a.days ?? -1));
    return rows;
  }, [loans, userMap, bookMap]);

  const Card = ({ title, value, subtitle }) => (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 12,
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.75 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {subtitle ? (
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );

  const BarRow = ({ left, right, percent }) => (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <span>{left}</span>
        <span style={{ whiteSpace: "nowrap" }}>{right}</span>
      </div>
      <div
        style={{
          height: 10,
          background: "#eee",
          borderRadius: 6,
          overflow: "hidden",
          marginTop: 6,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, percent))}%`,
            background: "#333",
          }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <h1>Statistika</h1>

      <button onClick={loadAll} style={{ marginBottom: 12 }}>
        Refresh
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* KPI */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}
      >
        <Card title="Ukupno pozajmica" value={kpi.totalLoans} />
        <Card
          title="Aktivne pozajmice"
          value={kpi.activeLoans}
          subtitle="status: borrowed"
        />
        <Card
          title="Vraćene pozajmice"
          value={kpi.returnedLoans}
          subtitle="status: returned"
        />
        <Card title="Korisnici" value={kpi.totalUsers} />
        <Card title="Ukupno knjiga" value={kpi.totalBooks} />
        <Card
          title="Dostupne knjige"
          value={kpi.availableBooks}
          subtitle={`Nedostupne: ${kpi.unavailableBooks}`}
        />
      </div>

      {/* Loans by user */}
      <h2>Pozajmice po korisniku</h2>
      {loansByUser.length === 0 ? (
        <p>Nema pozajmica.</p>
      ) : (
        <div style={{ maxWidth: 700 }}>
          {loansByUser.slice(0, 10).map((row) => (
            <BarRow
              key={row.userId}
              left={
                <span>
                  <strong>{row.name}</strong>
                  {row.role ? ` (${row.role})` : ""}
                </span>
              }
              right={<strong>{row.count}</strong>}
              percent={(row.count / maxUser) * 100}
            />
          ))}
        </div>
      )}

      {/* Loans by book */}
      <h2>Top knjige po broju pozajmica</h2>
      {loansByBook.length === 0 ? (
        <p>Nema pozajmica.</p>
      ) : (
        <div style={{ maxWidth: 900 }}>
          {loansByBook.slice(0, 10).map((row) => (
            <BarRow
              key={row.bookId}
              left={
                <span>
                  <strong>{row.title}</strong>
                  {row.author ? ` — ${row.author}` : ""}
                  {row.category ? ` • ${row.category}` : ""}
                </span>
              }
              right={<strong>{row.count}</strong>}
              percent={(row.count / maxBook) * 100}
            />
          ))}
        </div>
      )}

      {/* Active loans */}
      <h2>Aktivne pozajmice (borrowed)</h2>
      {activeLoans.length === 0 ? (
        <p>Trenutno nema aktivnih pozajmica.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Korisnik
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Knjiga
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Kategorija
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Datum
                </th>
                <th
                  style={{
                    textAlign: "right",
                    borderBottom: "1px solid #ddd",
                    padding: 8,
                  }}
                >
                  Dana
                </th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.map((row) => (
                <tr key={row.id}>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                    <strong>{row.userName}</strong>
                    {row.userRole ? ` (${row.userRole})` : ""}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                    <strong>{row.bookTitle}</strong>
                    {row.bookAuthor ? ` — ${row.bookAuthor}` : ""}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                    {row.category || "-"}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                    {row.date}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      padding: 8,
                      textAlign: "right",
                    }}
                  >
                    {row.days ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
