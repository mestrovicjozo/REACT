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


async function getAnimalFacts(animalName) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // Novi prompt za model - sada s fokusom na max 250 znakova i cijele rečenice
  const prompt = `Ti si umjetnik dokumentarac divljih životinja. Reci mi vrlo kratke i zabavne činjenice o životinji "${animalName}" koje bi djeca smatrala zanimljivim. Odgovor napiši na hrvatskom jeziku. Odgovor neka bude samo jedan paragraf, bez listi, točaka ili bilo kakvih posebnih znakova poput zvjezdica, zagrada, crtica. Budi precizan i neka rečenice budu kratke i jasne. Maksimalno 250 znakova, a rečenica mora biti završena do kraja.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text(); // Generirani tekst iz modela

    // 1. Uklanjanje neželjenih znakova
    // Zadržavamo slova (uključujući hrvatska), brojeve, uobičajene interpunkcijske znakove i razmake.
    // Uklonjene su zagrade i zvjezdice iz dozvoljenih.
    text = text.replace(/[^a-zA-Z0-9šđčćžŠĐČĆŽ.,!?'"\s]/g, '');

    // 2. Ograničavanje duljine na 250 znakova uz završavanje rečenice
    const MAX_LENGTH = 250;
    if (text.length > MAX_LENGTH) {
      // Skrati tekst na maksimalnu duljinu
      let truncatedText = text.substring(0, MAX_LENGTH);

      // Pronađi zadnji završetak rečenice (točka, uskličnik, upitnik)
      let lastSentenceEnd = Math.max(
        truncatedText.lastIndexOf('.'),
        truncatedText.lastIndexOf('!'),
        truncatedText.lastIndexOf('?')
      );

      // Ako je pronađen završetak rečenice unutar skraćenog dijela
      if (lastSentenceEnd !== -1) {
        // Uzmi tekst do kraja te rečenice (uključujući interpunkciju i razmake poslije)
        // +1 je za sami znak interpunkcije
        // Trim() uklanja eventualne razmake na kraju ako je rečenica prekinuta odmah nakon točke
        text = text.substring(0, lastSentenceEnd + 1).trim();
      } else {
        // Ako nema završetka rečenice unutar prvih 250 znakova,
        // jednostavno odreži na 250 i dodaj "..." da naznačiš da je prekinuto.
        // Ovo bi se trebalo rijetko događati s obzirom na prompt.
        text = truncatedText.trim() + "..."; // Dodaj "..." da naznačiš prekid ako nema točke
      }
    }

    return text;
  } catch (error) {
    console.error('Greška pri generiranju sadržaja s Gemini API-jem:', error);
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