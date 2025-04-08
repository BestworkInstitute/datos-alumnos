import { useEffect, useState } from "react";

export default function Home() {
  const [rut, setRut] = useState("");
  const [resultados, setResultados] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 💡 Estilo responsive para mobile
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      {/* Logo */}
      <div style={{ textAlign: "right" }}>
        <img
          src="https://bestwork.cl/wp-content/uploads/2023/05/Logo.png"
          alt="BestWork Logo"
          style={{ maxWidth: "160px", marginBottom: "1rem" }}
        />
      </div>

      {/* Título */}
      <h1 style={{ color: "#ff9900", fontSize: "1.8rem", marginBottom: "0.5rem" }}>
        Revisa tus datos aquí
      </h1>
      <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "2rem" }}>
        Si no encuentras tu link, ¡contáctanos!
      </p>

      {/* Formulario */}
      <form onSubmit={buscarDatos} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Ingresa tu RUT (Ej: 12345678-9)"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginRight: "1rem",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* Error */}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "2rem auto",
            background: "#fafafa",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            textAlign: "left",
          }}
        >
          <h2 style={{ color: "#007bff", marginBottom: "2rem", textAlign: "center" }}>
            📋 Información del Alumno
          </h2>

          {resultados.map((fila, filaIndex) => (
            <div
              key={filaIndex}
              className="resultado-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                rowGap: "1.5rem",
              }}
            >
              {fila.map((valor, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#555" }}>
                    {headers[i] || `Columna ${i + 1}`}
                  </span>
                  <span style={{ fontSize: "1rem", fontWeight: 500, color: "#111", marginTop: "0.25rem" }}>
                    {valor}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
