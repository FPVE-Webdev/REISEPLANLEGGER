# Tripplan Tromsø - AI Trip Planner

AI-basert reiseplanlegger for Tromsø med fokus på lokal kunnskap, sesongbaserte anbefalinger og sanntidsintegrasjoner.

## 🚀 Funksjoner

### MVP (Phase 1)
- ✅ AI-genererte personlige turplaner (1-14 dager)
- ✅ 10 hovedkategorier med POI-system
- ✅ Sesongfiltrering (Sommer, Vinter, Mørketid)
- ✅ Pilar-struktur (Featured Content + Essential Themes)
- ✅ Eksport til PDF og ICS (kalender)
- ✅ Delbare lenker
- 🚧 Checkfront API-integrasjon (aktiviteter)
- 🚧 Restaurant booking-integrasjoner

### Kommende Features
- Real-time nordlysvarsel
- Direktebooking av aktiviteter
- Google Maps-integrasjon
- Mobil-app (React Native)
- Multi-språk support

## 🏗️ Teknisk Arkitektur

### Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma) - planlagt
- **Cache**: Redis/Upstash - planlagt
- **AI**: OpenAI GPT-4 / Anthropic Claude - planlagt

### Kategori-system (10 hovedkategorier)
1. **Museums** (Museer) - 🏛️
2. **Galleries** (Gallerier) - 🎨
3. **Activities** (Aktiviteter) - ⛷️
4. **Shopping** (Shopping) - 🛍️
5. **Interior** (Interiør) - 🪑
6. **Food & Drink** (Mat & Drikke) - 🍽️
7. **Health & Beauty** (Helse & Skjønnhet) - 💆
8. **Accommodation** (Overnatting) - 🏨
9. **Transport** (Transport) - 🚌
10. **What's On** (Hva skjer) - 🎭

### Pilar-struktur

#### Featured Pilars (Anchor points)
- Fjellheisen Cable Car (weight: 10)
- Arctic Cathedral (weight: 9)
- Polar Museum (weight: 8)
- Fjord Cruise (weight: 8)

#### Essential Themes (Tromsø DNA)
- Nature & Wilderness (weight: 10)
- Northern Lights (weight: 10)
- Arctic Wilderness (weight: 9)
- Sami Heritage (weight: 8)
- Culture & Arts (weight: 7)
- Science & Research (weight: 6)

### Sesong-system
- **Summer** (Mai-August): Midnattsol, fjordcruise, fotturer
- **Winter** (Desember-Februar): Nordlys, hundekjøring, ski
- **Polar Night** (November, Januar): Mørketid, nordlys, kulturopplevelser

## 📦 Installasjon

```bash
# Klon repository
git clone https://github.com/yourusername/tripplan-webapp.git
cd tripplan-webapp

# Installer avhengigheter
npm install

# Kopier environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Åpne [http://localhost:3001](http://localhost:3001) i nettleseren.

## 🔧 Environment Variables

Se `.env.example` for fullstendig liste.

### Påkrevde variabler (MVP):
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Valgfrie integrasjoner:
```bash
# Checkfront (aktiviteter)
CHECKFRONT_HOST=your-domain.checkfront.com
CHECKFRONT_API_KEY=your_key
CHECKFRONT_API_SECRET=your_secret

# Google Places (restauranter)
GOOGLE_PLACES_API_KEY=your_key

# AI Curator
OPENAI_API_KEY=your_key
```

## 📁 Prosjektstruktur

```
tripplan-webapp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── trips/          # Trip generation API
│   │   │   └── webhooks/       # Checkfront webhooks
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── tripplan/           # Trip planner components
│   ├── lib/
│   │   ├── constants/          # Categories, seasons, pilars
│   │   ├── integrations/       # Checkfront, restaurants
│   │   ├── services/           # AI curator, export
│   │   └── utils.ts
│   └── types/
│       ├── database.ts         # Database schema types
│       └── trip.ts             # Trip planner types
├── public/
├── .env.example
├── package.json
└── README.md
```

## 🧪 Utvikling

### Kjøre development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🔌 API Endpoints

### POST /api/trips
Generer personlig turplan basert på brukerpreferanser.

**Request:**
```json
{
  "preferences": {
    "days": 3,
    "budget": "medium",
    "interests": ["aurora", "dining", "culture"],
    "transport": "car",
    "difficulty": "moderate",
    "startDate": "2026-02-01",
    "groupSize": 2
  }
}
```

**Response:**
```json
{
  "plan": {
    "summary": "...",
    "days": [...],
    "totalCost": 4500,
    "safetyNotes": [...],
    "packingList": [...],
    "recommendations": [...]
  },
  "preferences": {...},
  "generatedAt": "2026-01-13T10:00:00Z",
  "metadata": {
    "companiesAvailable": 0,
    "guidesAvailable": 0
  }
}
```

### POST /api/webhooks/checkfront
Webhook endpoint for Checkfront events (booking.created, item.updated, etc.)

## 🎯 Roadmap

### Phase 1 - MVP (Nå) ✅
- ✅ Frontend trip planner
- ✅ Backend API struktur
- ✅ Kategori-system
- ✅ Sesong-filtrering
- ✅ Export (PDF, ICS)
- 🚧 Checkfront integrasjon

### Phase 2 - Database & AI
- [ ] PostgreSQL database setup
- [ ] Prisma ORM
- [ ] POI-administrasjon
- [ ] OpenAI/Claude integrasjon
- [ ] Forbedret AI-kurator

### Phase 3 - Bookings
- [ ] Checkfront direktebooking
- [ ] Restaurant booking-integrasjoner
- [ ] Betalingsintegrasjon (Stripe/Vipps)

### Phase 4 - Mobil & Sanntid
- [ ] "I dag"-modus med kart
- [ ] Nordlys-varsler
- [ ] Push-notifikasjoner
- [ ] Offline-støtte

## 🤝 Bidrag

Dette er et privat prosjekt under utvikling. Kontakt eier for samarbeidsforespørsler.

## 📄 Lisens

Proprietary - All rights reserved

## 📞 Kontakt

**Prosjekteier:** Øystein Jørgensen
**Lokasjon:** Tromsø, Norway
**E-post:** [din-epost@example.com]

---

*Generert med Claude Code - AI utviklingspartner*
