// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'provider' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  serviceCount: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  userId: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  isVerified: boolean;
  isActive: boolean;
  images: string[];
  schedule: Record<string, string>;
  services: ServiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  duration: string;
  description?: string;
}

export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceItemId?: string;
  serviceItemName?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: 'sidebar' | 'banner' | 'featured';
  city?: string;
  category?: string;
  impressions: number;
  clicks: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

// Database helpers (for Cloudflare D1)
export async function getServices(db: D1Database, options?: {
  category?: string;
  city?: string;
  search?: string;
  limit?: number;
  offset?: number;
  premium?: boolean;
}): Promise<Service[]> {
  let query = 'SELECT * FROM services WHERE isActive = 1';
  const params: any[] = [];

  if (options?.category) {
    query += ' AND categoryId = ?';
    params.push(options.category);
  }

  if (options?.city) {
    query += ' AND city = ?';
    params.push(options.city);
  }

  if (options?.search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${options.search}%`, `%${options.search}%`);
  }

  if (options?.premium) {
    query += ' AND isPremium = 1';
  }

  query += ' ORDER BY isPremium DESC, rating DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  if (options?.offset) {
    query += ' OFFSET ?';
    params.push(options.offset);
  }

  const result = await db.prepare(query).bind(...params).all();
  return result.results as Service[];
}

export async function getServiceById(db: D1Database, id: string): Promise<Service | null> {
  const result = await db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
  return result as Service | null;
}

export async function createService(db: D1Database, service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO services (id, userId, name, slug, categoryId, description, address, city, phone, email, website, rating, reviewCount, isPremium, isVerified, isActive, images, schedule, services, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, service.userId, service.name, service.slug, service.categoryId,
    service.description, service.address, service.city, service.phone,
    service.email, service.website || null, 0, 0, service.isPremium ? 1 : 0,
    service.isVerified ? 1 : 0, service.isActive ? 1 : 0,
    JSON.stringify(service.images), JSON.stringify(service.schedule),
    JSON.stringify(service.services), now, now
  ).run();

  return { ...service, id, rating: 0, reviewCount: 0, createdAt: now, updatedAt: now };
}

export async function updateService(db: D1Database, id: string, updates: Partial<Service>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'createdAt') {
      fields.push(`${key} = ?`);
      if (typeof value === 'object') {
        values.push(JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    }
  });

  fields.push('updatedAt = ?');
  values.push(new Date().toISOString());
  values.push(id);

  await db.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
}

export async function deleteService(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
}

// Bookings
export async function createBooking(db: D1Database, booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO bookings (id, serviceId, serviceName, userId, userName, userEmail, userPhone, serviceItemId, serviceItemName, date, time, status, notes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, booking.serviceId, booking.serviceName, booking.userId, booking.userName,
    booking.userEmail, booking.userPhone, booking.serviceItemId || null,
    booking.serviceItemName || null, booking.date, booking.time, booking.status,
    booking.notes || null, now
  ).run();

  return { ...booking, id, createdAt: now };
}

export async function getBookings(db: D1Database, options?: {
  serviceId?: string;
  userId?: string;
  status?: string;
  date?: string;
}): Promise<Booking[]> {
  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params: any[] = [];

  if (options?.serviceId) {
    query += ' AND serviceId = ?';
    params.push(options.serviceId);
  }

  if (options?.userId) {
    query += ' AND userId = ?';
    params.push(options.userId);
  }

  if (options?.status) {
    query += ' AND status = ?';
    params.push(options.status);
  }

  if (options?.date) {
    query += ' AND date = ?';
    params.push(options.date);
  }

  query += ' ORDER BY date DESC, time DESC';

  const result = await db.prepare(query).bind(...params).all();
  return result.results as Booking[];
}

// Reviews
export async function createReview(db: D1Database, review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO reviews (id, serviceId, userId, userName, rating, text, images, isVerified, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, review.serviceId, review.userId, review.userName, review.rating,
    review.text, JSON.stringify(review.images || []), review.isVerified ? 1 : 0, now
  ).run();

  // Update service rating
  await db.prepare(`
    UPDATE services 
    SET rating = (SELECT AVG(rating) FROM reviews WHERE serviceId = ?),
        reviewCount = (SELECT COUNT(*) FROM reviews WHERE serviceId = ?)
    WHERE id = ?
  `).bind(review.serviceId, review.serviceId, review.serviceId).run();

  return { ...review, id, createdAt: now };
}

export async function getReviews(db: D1Database, serviceId: string): Promise<Review[]> {
  const result = await db.prepare('SELECT * FROM reviews WHERE serviceId = ? ORDER BY createdAt DESC')
    .bind(serviceId).all();
  return result.results as Review[];
}

// Categories
export async function getCategories(db: D1Database): Promise<Category[]> {
  const result = await db.prepare('SELECT * FROM categories WHERE isActive = 1 ORDER BY name').all();
  return result.results as Category[];
}

// Slug generator
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Validation helpers
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^(\+40|0)[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

// Response helpers
export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
