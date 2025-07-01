import React from "react";
import hrFlag from "./images/hr.png";
import gbFlag from "./images/gb.png";
import deFlag from "./images/de.png";
import frFlag from "./images/fr.png";
import itFlag from "./images/it.png";

const languages = [
  { code: "hr", label: "Hrvatski", flag: hrFlag },
  { code: "en", label: "English", flag: gbFlag },
  { code: "de", label: "Deutsch", flag: deFlag },
  { code: "fr", label: "Français", flag: frFlag },
  { code: "it", label: "Italiano", flag: itFlag },
];

const langMessages = {
  en: "Sorry for the inconvenience, your language is coming soon.",
  de: "Entschuldigung für die Unannehmlichkeiten, Ihre Sprache kommt bald.",
  fr: "Désolé pour le dérangement, votre langue arrive bientôt.",
  it: "Ci scusiamo per l'inconveniente, la tua lingua sarà presto disponibile.",
};

const LanguageSelector = () => {
  const handleLanguageChange = (lang) => {
    if (lang === "hr") return;

    const text = langMessages[lang] || "Language coming soon.";
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head>
          <title>U izradi</title>
        </head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
          <h1>${text}</h1>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-2">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          disabled={lang.code === "hr"}
          className={`flex items-center gap-2 p-2 rounded border border-gray-300 ${
            lang.code === "hr" ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          <img src={lang.flag} alt={lang.label} className="w-6 h-6" />
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
