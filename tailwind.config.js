/** @type {import('tailwindcss').Config} */
export default {
  // HIER IST DIE WICHTIGSTE ZEILE:
  // Passe die Pfade an deine Projektstruktur an.
  content: [
    './index.html',              // Deine Haupt-HTML-Datei
    './src/**/*.js',             // Alle .js-Dateien im src-Verzeichnis
    './src/**/*.ts'              // Alle .ts-Dateien im src-Verzeichnis (falls du TypeScript nutzt)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}