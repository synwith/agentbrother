<p align="center">
  <img src="asset/logo2026.png" alt="AgentBrother Logo" width="400" height="400">
</p>

**[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md)**

# AgentBrother

Plattformübergreifendes Agent-Management-Framework - Einheitliche Verwaltung von OpenClaw, ZeroClaw und anderen Agent-Frameworks, ermöglicht Benutzern das Erstellen von KI-Digitalmitarbeitern und anderen Agenten mit einem WYSIWYG-Ansatz.

## Projektziel

Das Hauptziel von AgentBrother ist es, Benutzern eine einheitliche, plattformübergreifende Schnittstelle zur Verwaltung und Nutzung verschiedener KI-Agent-Frameworks wie OpenClaw und ZeroClaw bereitzustellen. Mit AgentBrother können Benutzer:

- Mehrere Agent-Frameworks an einem Ort verwalten, ohne zwischen verschiedenen Tools wechseln zu müssen
- KI-Digitalmitarbeiter mit einem WYSIWYG-Ansatz erstellen, konfigurieren und nutzen
- Eine konsistente Benutzererfahrung auf verschiedenen Plattformen (Mac, Windows, Web, Mobilgeräte) erhalten
- Den Erstellungs- und Verwaltungsprozess von Agenten vereinfachen und die Nutzungshürde senken

## Funktionen

### Kernfunktionen
- **Multi-Framework-Unterstützung**: Integriert gängige Agent-Frameworks wie OpenClaw und ZeroClaw
- **Plattformübergreifende Kompatibilität**: Unterstützt Mac, Windows, Web und Mobilgeräte
- **WYSIWYG**: Intuitive Oberfläche zum einfachen Erstellen und Konfigurieren von KI-Digitalmitarbeitern
- **Einheitliche Verwaltung**: Zentralisierte Verwaltung aller Agenten, einschließlich Statusüberwachung und Konfiguration
- **Schwebende Eingabe**: Unterstützt globale Hotkeys zum Aufrufen des schwebenden Eingabefensters für schnelle Agent-Interaktion
- **Datei Drag-and-Drop**: Unterstützt Drag-and-Drop-Upload von txt-, doc-, docx-, pdf-Dateien, automatische Inhaltsanalyse und Integration in Gespräche
- **Automatischer Start**: Erkennt und startet automatisch OpenClaw Gateway nach dem Start der Anwendung

### Technische Funktionen
- **Electron-Desktop-App**: Bietet native Desktop-Erfahrung
- **Web-Schnittstelle**: Unterstützt den Zugriff über Browser
- **TypeScript**: Typsichere Codebasis
- **Modulares Design**: Einfach zu erweitern und neue Agent-Frameworks zu integrieren
- **Echtzeitkommunikation**: Unterstützt Echtzeitinteraktion mit Agenten
- **Lokale Dateianalyse**: Analysiert Dateiinhalte lokal, spart Token-Verbrauch

## Schnellstart

### Anforderungen

- Node.js >= 20.0.0
- npm >= 10.0.0

### Abhängigkeiten installieren

```bash
npm install
```

### Im Entwicklungsmodus ausführen

#### Desktop-App

```bash
npm run dev
```

#### Web-App

```bash
npm run start:web
```

### Anwendung erstellen

```bash
# TypeScript kompilieren
npm run build

# Desktop-App paketieren
npm run dist
```

## Projektstruktur

```
agentbrother/
├── docs/                   # Dokumentation
├── electron/               # Electron-Hauptprozess-Code
│   ├── main.js            # Hauptprozesseinstieg
│   ├── preload.js         # Preload-Skript
│   └── renderer/          # Renderer-Prozess-Code
│       ├── index.html     # Hauptoberfläche
│       ├── styles.css     # Stil-Dateien
│       ├── main.js        # Renderer-Hauptlogik
│       ├── framework.js   # Framework-Management-Modul
│       ├── agents.js      # Agent-Management-Modul
│       ├── floatInput.js  # Schwebende Eingabe-Modul
│       └── settings.js    # Einstellungs-Modul
├── src/                    # Kerncode
│   ├── core/              # Kernfunktionalitäten
│   │   ├── bridges/       # Framework-Brücken (OpenClaw, ZeroClaw)
│   │   └── types.ts       # Typdefinitionen
│   ├── web/               # Web-Server
│   └── index.ts           # Haupthaupteinstieg
├── ui/                     # Benutzeroberfläche
│   └── float-input/       # Schwebende Eingabe-Komponente
├── dist/                   # TypeScript-Kompilierungsausgabe
├── package.json           # Projektkonfiguration
├── tsconfig.json          # TypeScript-Konfiguration
└── README.md              # Projektdokumentation
```

## Benutzerhandbuch

### KI-Digitalmitarbeiter erstellen

1. AgentBrother-Anwendung öffnen
2. In der linken Seitenleiste auf "Agenten" klicken
3. Ein Agent-Framework auswählen (OpenClaw oder ZeroClaw)
4. Auf "Neuen Agent erstellen" klicken
5. Agentennamen eingeben, Symbol auswählen, Modellparameter konfigurieren
6. Auf "Speichern" klicken, um die Erstellung abzuschließen

### Mit Agenten interagieren

1. In der linken Seitenleiste auf "Schwebende Eingabe" klicken
2. Agent zum Chatten auswählen
3. Nachricht im Eingabefeld eingeben oder Dateien in den Eingabebereich ziehen
4. Auf Senden-Button klicken oder Enter-Taste drücken
5. Auf Antwort des Agents warten

### Schwebende Eingabe verwenden

1. Globalen Hotkey drücken (Standard `Cmd+Shift+A`)
2. Nachricht im schwebenden Fenster eingeben
3. Enter-Taste drücken, um Nachricht zu senden
4. Antwort des Agents anzeigen

### Datei Drag-and-Drop-Funktion

Unterstützt Drag-and-Drop der folgenden Dateiformate in den Chatbereich:
- **.txt** - Nur-Text-Dateien, direkte Inhaltslese
- **.doc/.docx** - Word-Dokumente, verwendet mammoth.js zur Textextraktion
- **.pdf** - PDF-Dateien, verwendet pdf-parse zur Textextraktion

Dateigrößenbeschränkung: 100KB

### Konfigurationsmanagement

1. In der linken Seitenleiste auf "Konfiguration" klicken
2. Status von OpenClaw und ZeroClaw-Frameworks anzeigen
3. Auf "Gateway starten" klicken, um OpenClaw Gateway manuell zu starten
4. Anwendung erkennt und startet automatisch OpenClaw Gateway beim Start (falls installiert)

## Unterstützte Plattformen

- **Mac**: Über Electron-App (Hauptunterstützte Plattform)
- **Windows**: Über Electron-App
- **Web**: Über Browserzugriff
- **Mobilgeräte**: Über Web-Schnittstelle

## Konfiguration

### Framework-Konfiguration

AgentBrother erkennt automatisch im System installierte OpenClaw- und ZeroClaw-Frameworks:

- **OpenClaw**: Erkennt Pfad `~/Documents/trae_projects/openclaw_test/openclaw.sh`
- **ZeroClaw**: Erkennt Pfad `~/Documents/trae_projects/zeroclaw_test/zeroclaw-main/target/release-fast/zeroclaw`

### Konfiguration der schwebenden Eingabe

Sie können die schwebende Eingabe in den Einstellungen konfigurieren:
- Aktivieren/Deaktivieren-Status
- Globaler Hotkey (Standard `Cmd+Shift+A`)
- Position (oben-links, oben-rechts, unten-links, unten-rechts, Mitte)
- Transparenz
- Immer im Vordergrund

### Umgebungsvariablen

- `ARK_API_KEY` - Volcano-Engine-API-Schlüssel
- `OPENCLAW_CONFIG_PATH` - OpenClaw-Konfigurationsdateipfad (optional)

## Erweiterung

### Neue Agent-Frameworks hinzufügen

Um ein neues Agent-Framework hinzuzufügen, müssen Sie:

1. Eine neue Brückenklasse im Verzeichnis `src/core/bridges/` erstellen, die von `FrameworkBridge` erbt
2. Alle abstrakten Methoden implementieren (detect, connect, disconnect, getAgents, sendMessage, etc.)
3. Neue Brückenklasse in `src/index.ts` registrieren
4. Framework-spezifische Konfigurations-UI in `electron/renderer/agents.js` hinzufügen

### Unterstützte Agent-Typen

AgentBrother unterstützt mehrere Agent-Typen:
- **chat** - Chat-Typ-Agent
- **code** - Code-Typ-Agent
- **image** - Bild-Typ-Agent
- **video** - Video-Typ-Agent
- **audio** - Audio-Typ-Agent
- **custom** - Benutzerdefinierter Typ-Agent

## Entwicklerhandbuch

### Tech-Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Desktop**: Electron 33+
- **Backend**: Node.js, Express
- **Typen**: TypeScript 5+
- **Build**: electron-builder

### Dateianalyse-Abhängigkeiten

- **mammoth** (^1.11.0) - .docx-Dateien analysieren
- **pdf-parse** (^2.4.5) - .pdf-Dateien analysieren

### Entwicklungshinweise

1. **TypeScript-Kompilierung**: Nach dem Ändern von Dateien im Verzeichnis `src/` führen Sie `npm run build` zum Kompilieren aus
2. **Electron-Hauptprozess**: Nach dem Ändern von `electron/main.js` starten Sie die Anwendung neu
3. **Renderer-Prozess**: Nach dem Ändern von Dateien in `electron/renderer/` aktualisieren Sie die Seite
4. **Dateianalyse**: Die Dateianalyse-Funktionalität hängt von der Node.js-Umgebung ab, nur in Electron verfügbar

## Häufig gestellte Fragen

### F: "Electron API nicht bereit" beim Start
A: Dies ist ein normales Initialisierungssequenzproblem, die Anwendung wird nach 1 Sekunde automatisch erneut versuchen. Wenn es weiterhin auftritt, überprüfen Sie, ob Electron korrekt geladen ist.

### F: OpenClaw Gateway kann nicht automatisch gestartet werden
A: Bitte überprüfen Sie:
1. Ob OpenClaw im Standardpfad installiert ist
2. Ob das Skript `openclaw.sh` Ausführungsberechtigungen hat
3. Ob Port 18789 belegt ist

### F: Drag-and-Drop-Funktion für Dateien nicht verfügbar
A: Die Drag-and-Drop-Funktion für Dateien ist nur in der Electron-Desktop-App verfügbar, nicht in der Web-Version.

### F: Typfehler bei der Kompilierung
A: Stellen Sie sicher, dass Sie Node.js 20+ verwenden und führen Sie `npm install` aus, um alle Abhängigkeiten zu installieren.

## Beitragen

Beiträge sind willkommen! Fühlen Sie sich frei, Code beizutragen, Probleme zu melden oder Verbesserungen vorzuschlagen!

### Probleme melden

Bitte beschreiben Sie:
- Das Phänomen des Problems
- Schritte zur Reproduktion
- Erwartetes Verhalten
- Tatsächliches Verhalten
- Umgebungsinformationen (Betriebssystem, Node.js-Version, etc.)

### PRs einreichen

1. Dieses Repository forken
2. Einen Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. In den Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## Lizenz

MIT License

## Änderungsprotokoll

### v1.0.0
- Erstveröffentlichung
- Unterstützung für OpenClaw und ZeroClaw-Frameworks
- Implementierung der schwebenden Eingabe-Funktionalität
- Unterstützung für Drag-and-Drop-Dateianalyse (txt, doc, docx, pdf)
- Automatischer Start von OpenClaw Gateway
- Plattformübergreifende Unterstützung (Mac, Windows, Web)
