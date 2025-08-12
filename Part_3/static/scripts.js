// static/scripts.js

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

async function fetchPlaces() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getCookie('token');
  // If your API requires auth even for GET, include it; otherwise omit
  if (token) headers['UserAuth'] = `user ${token}`;

  const res = await fetch('/api/v1/places', { headers });
  if (!res.ok) throw new Error(`Failed to load places: ${res.status}`);
  return res.json();
}

function renderPlaces(places) {
  const list = document.getElementById('places-list');
  list.innerHTML = '';

  if (!places || places.length === 0) {
    list.innerHTML = '<p>No places yet.</p>';
    return;
  }

  places.forEach(place => {
    const id = place.id || place.place_id; // handle both
    const title = place.title || place.name || 'Untitled Place';
    const price = place.price ?? '—';

    const card = document.createElement('div');
    card.className = 'place-card';

    const h3 = document.createElement('h3');
    h3.textContent = title;

    const p = document.createElement('p');
    p.textContent = `Price per night: $${price}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'details-button';
    btn.textContent = 'View Details';
    btn.addEventListener('click', () => {
      // Path style URL
      window.location.href = `/place/${encodeURIComponent(id)}`;
    });

    card.append(h3, p, btn);
    list.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const places = await fetchPlaces();
    renderPlaces(places);
  } catch (err) {
    console.error(err);
    const list = document.getElementById('places-list');
    list.innerHTML = '<p>Failed to load places.</p>';
  }
});
