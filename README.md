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
git clone https://github.com/elisei1202/ghid-local.git
cd ghid-local

# Instalează dependențele
npm install

# Pornește serverul de development
npm run dev
```

## 🌐 Deploy pe Cloudflare Pages

### Opțiunea 1: Deploy automat prin GitHub (Recomandat)

1. **Conectează repository-ul la Cloudflare Pages:**
   - Mergi la [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Selectează **Pages** → **Create a project**
   - Alege **Connect to Git**
   - Autorizează Cloudflare să acceseze GitHub
   - Selectează repository-ul `elisei1202/ghid-local`

2. **Configurează build settings:**
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (sau lasă gol)

3. **Configurează variabilele de mediu:**
   - Adaugă variabilele necesare în secțiunea **Environment variables**
   - `NODE_VERSION`: `20` (sau versiunea dorită)

4. **Configurează D1 Database, KV și R2:**
   - În secțiunea **Settings** → **Functions**, configurează:
     - **D1 Database bindings**: Adaugă `localpro-db` (creează-o mai întâi)
     - **KV Namespace bindings**: Adaugă namespace-ul pentru sesiuni
     - **R2 Bucket bindings**: Adaugă bucket-ul pentru imagini

5. **Deploy automat:**
   - Cloudflare Pages va face deploy automat la fiecare push pe branch-ul `main`
   - Preview deployments vor fi create pentru fiecare Pull Request

### Opțiunea 2: Deploy manual

#### 1. Pregătire Cloudflare

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

#### 2. Actualizează wrangler.toml

Înlocuiește ID-urile în `wrangler.toml` cu cele generate:
- `database_id` pentru D1
- `id` pentru KV namespace
- Actualizează `bucket_name` pentru R2 dacă este necesar

#### 3. Inițializează baza de date

```bash
npx wrangler d1 execute localpro-db --file=./schema.sql
```

#### 4. Deploy

```bash
# Build proiect
npm run build

# Deploy pe Cloudflare Pages
npx wrangler pages deploy dist
```

### Configurare D1 Database pentru Production

După ce ai creat D1 database, inițializează schema:

```bash
# Pentru production
npx wrangler d1 execute localpro-db --file=./schema.sql --remote

# Pentru local development
npx wrangler d1 execute localpro-db --file=./schema.sql --local
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
