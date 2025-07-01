const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Učitaj varijable okoline iz .env datoteke
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Backend će se pokretati na portu 3001

// Middleware
app.use(cors()); // Omogući CORS za sve domene (za razvoj)
app.use(express.json()); // Parsiraj JSON tijela zahtjeva

// Dohvati API ključ iz varijabli okoline
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Provjeri je li API ključ postavljen
if (!GEMINI_API_KEY) {
  console.error("GREŠKA: GEMINI_API_KEY nije postavljen u .env datoteci!");
  process.exit(1); // Izađi iz aplikacije ako ključ nedostaje
}

// Inicijaliziraj Google Generative AI klijenta
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Funkcija za dohvaćanje činjenica o životinjama
async function getAnimalFacts(animalName) {
  // Odaberi model. 'gemini-1.5-flash-latest' je preporučeno za najnoviju Flash verziju.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // Tvoj prompt
  const prompt = `You are a wildlife documentary artist can you tell me some facts about ${animalName} which kids would find amusing. Give the text in croatian language`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // Generirani tekst iz modela
    return text;
  } catch (error) {
    console.error('Greška pri generiranju sadržaja s Gemini API-jem:', error);
    // Vrati poruku o grešci prilagođenu djeci
    return 'Nažalost, trenutno ne mogu pronaći informacije o toj životinji. Molimo pokušajte ponovno!';
  }
}

// API ruta za dohvaćanje činjenica
app.post('/api/animal-facts', async (req, res) => {
  const { animalName } = req.body; // Dohvati naziv životinje iz tijela zahtjeva

  if (!animalName) {
    return res.status(400).json({ error: "Naziv životinje je obavezan." });
  }

  const facts = await getAnimalFacts(animalName);
  res.json({ facts }); // Vrati činjenice kao JSON odgovor
});

// Pokreni server
app.listen(PORT, () => {
  console.log(`Backend server pokrenut na http://localhost:${PORT}`);
});