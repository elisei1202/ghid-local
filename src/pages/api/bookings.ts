import type { APIRoute } from 'astro';

const mockBookings: any[] = [];

export const GET: APIRoute = async ({ url }) => {
  try {
    const serviceId = url.searchParams.get('serviceId');
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');
    const date = url.searchParams.get('date');

    let results = [...mockBookings];

    if (serviceId) results = results.filter(b => b.serviceId === serviceId);
    if (userId) results = results.filter(b => b.userId === userId);
    if (status) results = results.filter(b => b.status === status);
    if (date) results = results.filter(b => b.date === date);

    return new Response(JSON.stringify({
      success: true,
      data: results,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
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

    const required = ['serviceId', 'serviceName', 'userName', 'userEmail', 'userPhone', 'date', 'time'];
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

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.userEmail)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email invalid',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate phone
    if (!/^(\+40|0)[0-9]{9}$/.test(body.userPhone.replace(/\s/g, ''))) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Număr de telefon invalid',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newBooking = {
      id: Date.now().toString(),
      ...body,
      userId: body.userId || 'guest',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    mockBookings.push(newBooking);

    return new Response(JSON.stringify({
      success: true,
      data: newBooking,
      message: 'Rezervare creată cu succes! Vei primi o confirmare în curând.',
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

export const PATCH: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'ID-ul rezervării este obligatoriu',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const index = mockBookings.findIndex(b => b.id === id);

    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rezervarea nu a fost găsită',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    mockBookings[index] = { ...mockBookings[index], ...body };

    return new Response(JSON.stringify({
      success: true,
      data: mockBookings[index],
    }), {
      status: 200,
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
