# Bookify

Bookify je MERN aplikacija za upravljanje knjižnicom: rezervacija i posudba knjiga, sa korisničkim i administratorskim funkcionalnostima.

## Funkcionalnosti
- Registracija i prijava korisnika
- Prikaz dostupnih knjiga
- Rezervacija i posudba knjiga
- Administratorski panel za dodavanje, izmjenu i brisanje knjiga
- Pregled i upravljanje korisničkim profilom (zasad nije implementirano sa dummy podacima)
- Animacije i moderan dizajn uz pomoć Tailwind CSS i Framer Motion

## Pokretanje projekta

1. **Kloniraj repo i uđi u projekt:**
   ```bash
   git clone <repo-url>
   cd Bookify
   ```

2. **Instaliraj sve pakete:**
   ```bash
   npm install
   ```

3. **Pokreni backend server:**
   ```bash
   node fiktivanServer.cjs
   ```
   (Server će slušati na portu 3000)

4. **Pokreni frontend (Vite dev server):**
   U drugom terminalu:
   ```bash
   npm run dev
   ```
   (Aplikacija će biti dostupna na http://localhost:5173)

## Tehnologije
- React (frontend)
- Express & Node.js (backend)
- MongoDB (baza podataka, koristi se preko mongoose)
- Tailwind CSS (stilizacija)
- Framer Motion (animacije)

---
Autor: Jozo
