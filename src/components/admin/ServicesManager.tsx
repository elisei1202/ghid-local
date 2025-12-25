import { useState, useEffect, useCallback } from 'react';

interface Service {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  services: { id: string; name: string; price: string; duration: string }[];
  schedule: Record<string, string>;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const CATEGORIES = [
  { value: 'stomatologie', label: 'Stomatologie', icon: '🦷' },
  { value: 'auto', label: 'Service Auto', icon: '🚗' },
  { value: 'frizerie', label: 'Frizerii & Saloane', icon: '💇' },
  { value: 'curatenie', label: 'Curățenie', icon: '🧹' },
  { value: 'instalatii', label: 'Instalații', icon: '🔧' },
  { value: 'electricieni', label: 'Electricieni', icon: '⚡' },
];

const CITIES = ['București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Craiova', 'Galați'];

const DEFAULT_SCHEDULE: Record<string, string> = {
  'Luni': '09:00 - 18:00',
  'Marți': '09:00 - 18:00',
  'Miercuri': '09:00 - 18:00',
  'Joi': '09:00 - 18:00',
  'Vineri': '09:00 - 18:00',
  'Sâmbătă': '10:00 - 14:00',
  'Duminică': 'Închis',
};

const INITIAL_SERVICES: Service[] = [
  {
    id: '1', name: 'Dent Smile Studio', category: 'stomatologie', city: 'București',
    address: 'Str. Victoriei 123, Sector 1', phone: '0721234567', email: 'contact@dentsmile.ro',
    website: 'https://dentsmile.ro', description: 'Clinică stomatologică modernă.',
    rating: 4.9, reviewCount: 127, isPremium: true, isVerified: true, isActive: true,
    createdAt: '2024-01-15', schedule: DEFAULT_SCHEDULE,
    services: [{ id: '1', name: 'Consultație', price: '100 lei', duration: '30 min' }],
  },
  {
    id: '2', name: 'Auto Expert Service', category: 'auto', city: 'Cluj-Napoca',
    address: 'Str. Fabricii 45', phone: '0722345678', email: 'service@autoexpert.ro',
    website: '', description: 'Service auto complet.', rating: 4.8, reviewCount: 89,
    isPremium: true, isVerified: true, isActive: true, createdAt: '2024-02-20',
    schedule: DEFAULT_SCHEDULE, services: [],
  },
  {
    id: '3', name: 'Elegant Hair Studio', category: 'frizerie', city: 'Timișoara',
    address: 'Bd. Revoluției 78', phone: '0723456789', email: 'hello@eleganthair.ro',
    website: '', description: 'Salon premium.', rating: 4.7, reviewCount: 203,
    isPremium: false, isVerified: true, isActive: true, createdAt: '2024-03-10',
    schedule: DEFAULT_SCHEDULE, services: [],
  },
];

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [filtered, setFiltered] = useState<Service[]>(INITIAL_SERVICES);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | 'view' | null>(null);
  const [selected, setSelected] = useState<Service | null>(null);
  const [tab, setTab] = useState<'info' | 'services' | 'schedule'>('info');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [form, setForm] = useState({
    name: '', category: '', city: '', address: '', phone: '', email: '',
    website: '', description: '', isPremium: false, isVerified: false, isActive: true,
    services: [] as Service['services'], schedule: { ...DEFAULT_SCHEDULE },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    let result = services;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s));
    }
    if (catFilter) result = result.filter(x => x.category === catFilter);
    if (cityFilter) result = result.filter(x => x.city === cityFilter);
    setFiltered(result);
    setPage(1);
  }, [services, search, catFilter, cityFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toast = useCallback((msg: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, message: msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Obligatoriu';
    if (!form.category) e.category = 'Obligatoriu';
    if (!form.city) e.city = 'Obligatoriu';
    if (!form.address.trim()) e.address = 'Obligatoriu';
    if (!form.phone.trim()) e.phone = 'Obligatoriu';
    if (!form.email.trim()) e.email = 'Obligatoriu';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setSelected(null);
    setForm({
      name: '', category: '', city: '', address: '', phone: '', email: '',
      website: '', description: '', isPremium: false, isVerified: false, isActive: true,
      services: [], schedule: { ...DEFAULT_SCHEDULE },
    });
    setErrors({});
    setTab('info');
    setModal('add');
  };

  const openEdit = (s: Service) => {
    setSelected(s);
    setForm({
      name: s.name, category: s.category, city: s.city, address: s.address,
      phone: s.phone, email: s.email, website: s.website || '', description: s.description,
      isPremium: s.isPremium, isVerified: s.isVerified, isActive: s.isActive,
      services: [...s.services], schedule: { ...s.schedule },
    });
    setErrors({});
    setTab('info');
    setModal('edit');
  };

  const openView = (s: Service) => { setSelected(s); setModal('view'); };
  const openDelete = (s: Service) => { setSelected(s); setModal('delete'); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast('Corectează erorile', 'error'); setTab('info'); return; }
    
    if (modal === 'edit' && selected) {
      setServices(p => p.map(x => x.id === selected.id ? { ...x, ...form } : x));
      toast(`"${form.name}" actualizat!`);
    } else {
      const newS: Service = {
        id: Date.now().toString(), ...form, rating: 0, reviewCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setServices(p => [newS, ...p]);
      toast(`"${form.name}" adăugat!`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (selected) {
      setServices(p => p.filter(x => x.id !== selected.id));
      toast(`"${selected.name}" șters!`, 'warning');
      setModal(null);
    }
  };

  const toggle = (id: string, field: 'isPremium' | 'isVerified' | 'isActive') => {
    setServices(p => p.map(x => x.id === id ? { ...x, [field]: !x[field] } : x));
  };

  const addServiceItem = () => {
    setForm(p => ({ ...p, services: [...p.services, { id: Date.now().toString(), name: '', price: '', duration: '' }] }));
  };

  const updateServiceItem = (id: string, field: string, value: string) => {
    setForm(p => ({ ...p, services: p.services.map(x => x.id === id ? { ...x, [field]: value } : x) }));
  };

  const removeServiceItem = (id: string) => {
    setForm(p => ({ ...p, services: p.services.filter(x => x.id !== id) }));
  };

  const exportCSV = () => {
    const rows = [['Nume', 'Categorie', 'Oraș', 'Email', 'Telefon', 'Rating', 'Premium', 'Activ']];
    filtered.forEach(s => rows.push([s.name, s.category, s.city, s.email, s.phone, s.rating.toString(), s.isPremium ? 'Da' : 'Nu', s.isActive ? 'Da' : 'Nu']));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `servicii_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast('CSV exportat!');
  };

  return (
    <div>
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">Gestionare Servicii</h1>
          <p className="text-muted">{filtered.length} din {services.length} servicii</p>
        </div>
        <div className="admin-header__actions">
          <button className="btn btn--ghost" onClick={exportCSV}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <button className="btn btn--primary" onClick={openAdd}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adaugă
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Caută..." className="form-input" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.75rem' }} />
        </div>
        <select className="form-input form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: '180px' }}>
          <option value="">Toate categoriile</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>
        <select className="form-input form-select" value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={{ width: '180px' }}>
          <option value="">Toate orașele</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Serviciu</th>
              <th>Categorie</th>
              <th>Oraș</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Premium</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><p className="text-muted">Nu s-au găsit servicii</p></td></tr>
            ) : paginated.map(s => (
              <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.5 }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{s.name}</strong>
                    {s.isVerified && <svg width="16" height="16" viewBox="0 0 24 24" fill="#00d4aa"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                  </div>
                  <span className="text-muted text-sm">{s.email}</span>
                </td>
                <td><span className="tag">{CATEGORIES.find(c => c.value === s.category)?.icon} {CATEGORIES.find(c => c.value === s.category)?.label}</span></td>
                <td>{s.city}</td>
                <td style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {s.rating.toFixed(1)} <span className="text-muted">({s.reviewCount})</span>
                </td>
                <td><button className={`badge ${s.isActive ? 'badge--success' : 'badge--danger'}`} onClick={() => toggle(s.id, 'isActive')} style={{ cursor: 'pointer' }}>{s.isActive ? 'Activ' : 'Inactiv'}</button></td>
                <td><button className={`badge ${s.isPremium ? 'badge--warning' : ''}`} onClick={() => toggle(s.id, 'isPremium')} style={{ cursor: 'pointer', background: s.isPremium ? undefined : 'var(--bg-secondary)', color: s.isPremium ? undefined : 'var(--text-muted)' }}>{s.isPremium ? '⭐ Premium' : 'Standard'}</button></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openView(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }} title="Vezi">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button onClick={() => openEdit(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }} title="Editează">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => openDelete(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }} title="Șterge">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination__btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`pagination__btn ${page === i + 1 ? 'pagination__btn--active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="pagination__btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay modal-overlay--active" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal__header">
              <h2 className="modal__title">{modal === 'edit' ? 'Editare serviciu' : 'Serviciu nou'}</h2>
              <button className="modal__close" onClick={() => setModal(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 1.5rem' }}>
              {(['info', 'services', 'schedule'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '1rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
                  color: tab === t ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: tab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  fontWeight: 500, marginBottom: '-1px'
                }}>
                  {t === 'info' ? 'Informații' : t === 'services' ? `Servicii (${form.services.length})` : 'Program'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body" style={{ minHeight: '350px' }}>
                {tab === 'info' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label form-label--required">Nume</label>
                      <input type="text" className={`form-input ${errors.name ? 'form-input--error' : ''}`} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label form-label--required">Categorie</label>
                      <select className={`form-input form-select ${errors.category ? 'form-input--error' : ''}`} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                        <option value="">Selectează</option>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                      </select>
                      {errors.category && <span className="form-error">{errors.category}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label form-label--required">Oraș</label>
                      <select className={`form-input form-select ${errors.city ? 'form-input--error' : ''}`} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                        <option value="">Selectează</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label form-label--required">Adresă</label>
                      <input type="text" className={`form-input ${errors.address ? 'form-input--error' : ''}`} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label form-label--required">Telefon</label>
                      <input type="tel" className={`form-input ${errors.phone ? 'form-input--error' : ''}`} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label form-label--required">Email</label>
                      <input type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Website</label>
                      <input type="url" className="form-input" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Descriere</label>
                      <textarea className="form-input form-textarea" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <label className="form-checkbox"><input type="checkbox" checked={form.isPremium} onChange={e => setForm(p => ({ ...p, isPremium: e.target.checked }))} /><span>⭐ Premium</span></label>
                      <label className="form-checkbox"><input type="checkbox" checked={form.isVerified} onChange={e => setForm(p => ({ ...p, isVerified: e.target.checked }))} /><span>✓ Verificat</span></label>
                      <label className="form-checkbox"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} /><span>Activ</span></label>
                    </div>
                  </div>
                )}

                {tab === 'services' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3>Servicii și prețuri</h3>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={addServiceItem}>+ Adaugă</button>
                    </div>
                    {form.services.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p className="text-muted">Niciun serviciu adăugat</p>
                        <button type="button" className="btn btn--primary btn--sm mt-2" onClick={addServiceItem}>Adaugă primul serviciu</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {form.services.map((item, i) => (
                          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 120px 100px 40px', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{i + 1}</span>
                            <input type="text" className="form-input" placeholder="Nume serviciu" value={item.name} onChange={e => updateServiceItem(item.id, 'name', e.target.value)} />
                            <input type="text" className="form-input" placeholder="Preț" value={item.price} onChange={e => updateServiceItem(item.id, 'price', e.target.value)} />
                            <input type="text" className="form-input" placeholder="Durată" value={item.duration} onChange={e => updateServiceItem(item.id, 'duration', e.target.value)} />
                            <button type="button" className="btn btn--icon btn--ghost" onClick={() => removeServiceItem(item.id)}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'schedule' && (
                  <div>
                    <h3 style={{ marginBottom: '1rem' }}>Program de lucru</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {Object.entries(form.schedule).map(([day, hours]) => (
                        <div key={day} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                          <label style={{ fontWeight: 500 }}>{day}</label>
                          <input type="text" className="form-input" value={hours} onChange={e => setForm(p => ({ ...p, schedule: { ...p.schedule, [day]: e.target.value } }))} placeholder="ex: 09:00 - 18:00" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModal(null)}>Anulează</button>
                <button type="submit" className="btn btn--primary">{modal === 'edit' ? 'Salvează' : 'Adaugă'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay modal-overlay--active" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal__header">
              <h2 className="modal__title">{selected.name}</h2>
              <button className="modal__close" onClick={() => setModal(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal__body">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selected.isPremium && <span className="badge badge--warning">⭐ Premium</span>}
                {selected.isVerified && <span className="badge badge--primary">✓ Verificat</span>}
                <span className={`badge ${selected.isActive ? 'badge--success' : 'badge--danger'}`}>{selected.isActive ? 'Activ' : 'Inactiv'}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div><span className="text-muted text-sm">Categorie</span><br/>{CATEGORIES.find(c => c.value === selected.category)?.label}</div>
                <div><span className="text-muted text-sm">Oraș</span><br/>{selected.city}</div>
                <div><span className="text-muted text-sm">Adresă</span><br/>{selected.address}</div>
                <div><span className="text-muted text-sm">Telefon</span><br/>{selected.phone}</div>
                <div><span className="text-muted text-sm">Email</span><br/>{selected.email}</div>
                <div><span className="text-muted text-sm">Rating</span><br/>⭐ {selected.rating.toFixed(1)} ({selected.reviewCount} recenzii)</div>
              </div>
              
              {selected.description && <div style={{ marginBottom: '1.5rem' }}><span className="text-muted text-sm">Descriere</span><p style={{ marginTop: '0.5rem' }}>{selected.description}</p></div>}
              
              {selected.services.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="text-muted text-sm">Servicii</span>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selected.services.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                        <span>{s.name}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setModal(null)}>Închide</button>
              <button className="btn btn--primary" onClick={() => { setModal(null); openEdit(selected); }}>Editează</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="modal-overlay modal-overlay--active" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal__header">
              <h2 className="modal__title">Confirmare ștergere</h2>
              <button className="modal__close" onClick={() => setModal(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal__body" style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p>Ești sigur că vrei să ștergi <strong>"{selected.name}"</strong>?</p>
              <p className="text-muted text-sm mt-2">Această acțiune nu poate fi anulată.</p>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setModal(null)}>Anulează</button>
              <button className="btn btn--danger" onClick={handleDelete}>Șterge</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      {toasts.length > 0 && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {toasts.map(t => (
            <div key={t.id} className={`toast toast--${t.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'var(--bg-card)', border: `1px solid ${t.type === 'success' ? 'var(--accent-success)' : t.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-tertiary)'}`, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', minWidth: 280, animation: 'slideIn 0.3s ease' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.type === 'success' ? 'var(--accent-success)' : t.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-tertiary)'} strokeWidth="2">
                {t.type === 'success' ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
              </svg>
              <span style={{ flex: 1 }}>{t.message}</span>
              <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
