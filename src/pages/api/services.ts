import type { APIRoute } from 'astro';

// Mock data pentru demo - în producție folosești D1
const mockServices = [
  {
    id: '1',
    name: 'Dent Smile Studio',
    category: 'stomatologie',
    city: 'București',
    address: 'Str. Victoriei 123, Sector 1',
    phone: '0721234567',
    email: 'contact@dentsmile.ro',
    description: 'Clinică stomatologică modernă.',
    rating: 4.9,
    reviewCount: 127,
    isPremium: true,
    isVerified: true,
    isActive: true,
  },
  {
    id: '2',
    name: 'Auto Expert Service',
    category: 'auto',
    city: 'Cluj-Napoca',
    address: 'Str. Fabricii 45',
    phone: '0722345678',
    email: 'service@autoexpert.ro',
    description: 'Service auto complet.',
    rating: 4.8,
    reviewCount: 89,
    isPremium: true,
    isVerified: true,
    isActive: true,
  },
];

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const category = url.searchParams.get('category');
    const city = url.searchParams.get('city');
    const search = url.searchParams.get('q');
    const premium = url.searchParams.get('premium') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let results = [...mockServices];

    if (category) {
      results = results.filter(s => s.category === category);
    }

    if (city) {
      results = results.filter(s => s.city.toLowerCase() === city.toLowerCase());
    }

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term)
      );
    }

    if (premium) {
      results = results.filter(s => s.isPremium);
    }

    // Sort: premium first, then by rating
    results.sort((a, b) => {
      if (a.isPremium !== b.isPremium) return b.isPremium ? 1 : -1;
      return b.rating - a.rating;
    });

    const total = results.length;
    results = results.slice(offset, offset + limit);

    return new Response(JSON.stringify({
      success: true,
      data: results,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['name', 'category', 'city', 'address', 'phone', 'email'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({
          success: false,
          error: `Câmpul "${field}" este obligatoriu`,
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Create service
    const newService = {
      id: Date.now().toString(),
      ...body,
      rating: 0,
      reviewCount: 0,
      isPremium: body.isPremium || false,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify({
      success: true,
      data: newService,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid request body',
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
