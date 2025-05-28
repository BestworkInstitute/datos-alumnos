// pages/api/sheets.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Solo POST está permitido." });
  }

  const { rut } = req.body;

  if (!rut || typeof rut !== "string") {
    return res.status(400).json({ error: "RUT inválido o no proporcionado." });
  }

  try {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = process.env.GOOGLE_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:AZ",

    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "La hoja está vacía." });
    }

    const headers = rows[1];         // toma la fila 2 como encabezados
    const dataRows = rows.slice(2);  // toma desde la fila 3 en adelante como datos


    const matchingRows = dataRows.filter((row) => row[0] === rut); // Columna A = índice 0

    if (matchingRows.length === 0) {
      return res.status(404).json({ error: `No se encontraron datos para el RUT: ${rut}` });
    }

    return res.status(200).json({ data: matchingRows, headers });
  } catch (error) {
    console.error("Error al consultar Google Sheets:", error.message);
    return res.status(500).json({ error: "Error interno al consultar Google Sheets." });
  }
}
