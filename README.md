# LocalPro - Ghid Local de Servicii

Platformă modernă pentru găsirea și rezervarea serviciilor locale în România: stomatologi, mecanici, frizerii, instalatori și multe altele.

## 🚀 Tehnologii

- **Frontend**: Astro 4.x + React (pentru componente interactive)
- **Styling**: CSS custom cu design system
- **Backend**: Cloudflare Workers + D1 (SQLite)
- **Storage**: Cloudflare R2 pentru imagini
- **Auth**: JWT tokens + sessions în KV
- **Deploy**: Cloudflare Pages

## 📁 Structură proiect

```
/
├── src/
│   ├── components/       # Componente Astro și React
│   │   ├── admin/        # Componente pentru dashboard admin
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── CategoryCard.astro
│   │   └── ServiceCard.astro
│   ├── layouts/          # Layout-uri pagini
│   │   ├── Layout.astro
│   │   └── AdminLayout.astro
│   ├── pages/            # Pagini și API routes
│   │   ├── admin/        # Dashboard administrare
│   │   ├── api/          # API endpoints
│   │   ├── categorie/    # Pagini categorii
│   │   ├── cont/         # Autentificare
│   │   ├── rezervare/    # Sistem rezervări
│   │   ├── serviciu/     # Pagini servicii
│   │   └── index.astro   # Homepage
│   ├── styles/           # Stiluri globale
│   └── lib/              # Utilități și DB helpers
├── public/               # Fișiere statice
├── schema.sql            # Schema bază de date D1
├── wrangler.toml         # Configurare Cloudflare
└── package.json
```

## 🛠️ Instalare

```bash
# Clonează repository-ul
git clone https://github.com/your-username/localpro.git
cd localpro

# Instalează dependențele
npm install

# Pornește serverul de development
npm run dev
```

## 🌐 Deploy pe Cloudflare Pages

### 1. Pregătire Cloudflare

```bash
# Autentifică-te în Cloudflare
npx wrangler login

# Creează baza de date D1
npx wrangler d1 create localpro-db

# Creează KV namespace
npx wrangler kv:namespace create KV

# Creează R2 bucket
npx wrangler r2 bucket create localpro-images
```

### 2. Actualizează wrangler.toml

Înlocuiește ID-urile în `wrangler.toml` cu cele generate.

### 3. Inițializează baza de date

```bash
npx wrangler d1 execute localpro-db --file=./schema.sql
```

### 4. Deploy

```bash
# Build proiect
npm run build

# Deploy pe Cloudflare Pages
npx wrangler pages deploy dist
```

## 📱 Funcționalități

### Pentru utilizatori
- 🔍 Căutare servicii după categorie, oraș, rating
- 📅 Rezervări online cu calendar interactiv
- ⭐ Recenzii și rating-uri verificate
- ❤️ Salvare servicii favorite
- 📱 Design responsive (mobile-first)

### Pentru furnizori
- 📊 Dashboard pentru gestionare business
- 📅 Gestionare rezervări și program
- 📈 Statistici și analytics
- ⭐ Listări Premium pentru vizibilitate

### Pentru administratori
- 👥 Gestionare utilizatori
- 🏢 Gestionare servicii și categorii
- 📝 Moderare recenzii
- 📊 Rapoarte și statistici
- 💰 Gestionare reclame și abonamente

## 💰 Monetizare

| Plan | Preț | Funcționalități |
|------|------|-----------------|
| Gratuit | 0 lei/lună | Profil basic, max 5 imagini |
| Premium | 99 lei/lună | Top rezultate, badge verificat, analytics |
| Enterprise | 299 lei/lună | Toate + API access, suport dedicat |

## 🔒 Securitate

- Parole hash-uite cu bcrypt
- JWT tokens pentru autentificare
- CSRF protection
- Rate limiting pe API
- Validare și sanitizare input

## 📧 Contact

- Email: contact@localpro.ro
- Website: https://localpro.ro

## 📄 Licență

MIT License - vezi [LICENSE](LICENSE) pentru detalii.
