-- LocalPro Database Schema
-- Cloudflare D1 (SQLite)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'provider', 'admin')),
  avatar TEXT,
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  image TEXT,
  service_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Insert default categories
INSERT INTO categories (id, name, slug, icon, description, sort_order) VALUES
  ('cat_1', 'Stomatologie', 'stomatologie', '🦷', 'Cabinete stomatologice și clinici dentare', 1),
  ('cat_2', 'Service Auto', 'auto', '🚗', 'Service-uri auto, vulcanizări și detailing', 2),
  ('cat_3', 'Frizerii & Saloane', 'frizerie', '💇', 'Frizerii, saloane de înfrumusețare și spa', 3),
  ('cat_4', 'Curățenie', 'curatenie', '🧹', 'Servicii de curățenie pentru locuințe și birouri', 4),
  ('cat_5', 'Instalații', 'instalatii', '🔧', 'Instalatori, servicii sanitare și termice', 5),
  ('cat_6', 'Electricieni', 'electricieni', '⚡', 'Electricieni autorizați și instalații electrice', 6);

-- Services/Businesses table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  images TEXT DEFAULT '[]',
  schedule TEXT DEFAULT '{}',
  service_items TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_services_user ON services(user_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_city ON services(city);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_premium ON services(is_premium);
CREATE INDEX idx_services_rating ON services(rating DESC);
CREATE INDEX idx_services_slug ON services(slug);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  text TEXT,
  images TEXT DEFAULT '[]',
  is_verified INTEGER DEFAULT 0,
  is_approved INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Trigger to update service rating
CREATE TRIGGER IF NOT EXISTS update_service_rating
AFTER INSERT ON reviews
BEGIN
  UPDATE services 
  SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE service_id = NEW.service_id AND is_approved = 1),
    review_count = (SELECT COUNT(*) FROM reviews WHERE service_id = NEW.service_id AND is_approved = 1)
  WHERE id = NEW.service_id;
END;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  service_item_id TEXT,
  service_item_name TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes TEXT,
  provider_notes TEXT,
  cancelled_by TEXT,
  cancelled_reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT NOT NULL,
  position TEXT DEFAULT 'sidebar' CHECK(position IN ('sidebar', 'banner', 'featured', 'category')),
  target_city TEXT,
  target_category TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  budget REAL,
  spent REAL DEFAULT 0,
  cost_per_click REAL,
  is_active INTEGER DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_category) REFERENCES categories(id)
);

CREATE INDEX idx_ads_active ON ads(is_active);
CREATE INDEX idx_ads_position ON ads(position);

-- Subscriptions table (for premium listings)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('basic', 'premium', 'enterprise')),
  price REAL NOT NULL,
  currency TEXT DEFAULT 'RON',
  billing_cycle TEXT DEFAULT 'monthly' CHECK(billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TEXT,
  current_period_end TEXT,
  cancelled_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_service ON subscriptions(service_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Sessions table (for auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata TEXT DEFAULT '{}',
  ip_address TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_date ON activity_log(created_at);
