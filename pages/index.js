import { useEffect, useState } from "react";

export default function Home() {
  const [rut, setRut] = useState("");
  const [resultados, setResultados] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiados, setCopiados] = useState({});

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media (max-width: 768px) {
        .resultado-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const buscarDatos = async (e) => {
    e.preventDefault();
    setError("");
    setResultados([]);
    setHeaders([]);
    setLoading(true);

    try {
      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut }),
      });

      if (!response.ok) {
        throw new Error(await response.json().then((res) => res.error));
      }

      const data = await response.json();
      setHeaders(data.headers);
      setResultados(data.data);
      setCopiados({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copiarTexto = (clave, texto) => {
    navigator.clipboard.writeText(texto);
    setCopiados((prev) => ({ ...prev, [clave]: true }));
    setTimeout(() => {
      setCopiados((prev) => ({ ...prev, [clave]: false }));
    }, 2000);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.logoContainer}>
        <img
          src="https://bestwork.cl/wp-content/uploads/2023/05/Logo.png"
          alt="BestWork Logo"
          style={styles.logo}
        />
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Revisa tus datos aquí</h1>
        <p style={styles.subtitle}>Si no encuentras al alumno, ¡contáctanos!</p>

        <form onSubmit={buscarDatos} style={styles.form}>
          <input
            type="text"
            placeholder="Ingresa tu RUT (Ej: 12345678-9)"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            {loading ? "Buscando..." : "🔍 Buscar"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
      </div>

      {resultados.length > 0 && (
        <div style={styles.resultContainer}>
          <h2 style={styles.resultTitle}>📋 Información del Alumno</h2>
          {resultados.map((fila, filaIndex) => (
            <div
              key={filaIndex}
              className="resultado-grid"
              style={{
                ...styles.resultadoGrid,
                backgroundColor: filaIndex % 2 === 0 ? "#fcfcfc" : "#f4f6f8",
              }}
            >
              {fila.map((valor, i) => {
                const key = `fila${filaIndex}-campo${i}`;
                return (
                  <div key={i} style={styles.campo}>
                    <span style={styles.campoTitulo}>
                      {headers[i] || `Columna ${i + 1}`}
                    </span>
                    <div style={styles.valorWrapper}>
                      <span style={styles.campoValor}>{valor}</span>
                      <button
                        title="Copiar"
                        onClick={() => copiarTexto(key, valor)}
                        style={styles.copiarBtn}
                      >
                        {copiados[key] ? "✅" : "📋"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "1.5rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
  },
  logoContainer: {
    alignSelf: "flex-end",
  },
  logo: {
    maxWidth: "140px",
    marginBottom: "1rem",
  },
  card: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
    width: "100%",
    maxWidth: "560px",
    textAlign: "center",
  },
  title: {
    color: "#ff9900",
    fontSize: "1.6rem",
    fontWeight: "600",
    marginBottom: "0.4rem",
  },
  subtitle: {
    color: "#666",
    fontSize: "0.95rem",
    marginBottom: "1.25rem",
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  input: {
    padding: "0.6rem",
    width: "240px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "0.95rem",
  },
  button: {
    padding: "0.6rem 1.2rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  error: {
    color: "red",
    marginTop: "1rem",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  resultContainer: {
    marginTop: "2.5rem",
    width: "100%",
    maxWidth: "980px",
    background: "#fff",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  resultTitle: {
    color: "#007bff",
    fontSize: "1.3rem",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  resultadoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "1.2rem",
    border: "1px solid #e0e0e0",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
  },
  campoTitulo: {
    fontWeight: "600",
    fontSize: "0.8rem",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: "0.2rem",
    letterSpacing: "0.5px",
  },
  campoValor: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#222",
    wordBreak: "break-word",
  },
  valorWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  copiarBtn: {
    background: "#eaeaea",
    border: "none",
    borderRadius: "4px",
    padding: "0.2rem 0.4rem",
    cursor: "pointer",
    fontSize: "0.8rem",
    lineHeight: "1",
    transition: "background-color 0.2s ease",
  },
};
