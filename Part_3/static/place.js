// static/place.js

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}

function getPlaceIdFromURL() {
  // query first
  const q = new URLSearchParams(window.location.search).get('id');
  if (q) return q;
  // then /place/<id>
  const m = window.location.pathname.match(/\/place\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function checkAuthentication() {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  if (!token) {
    if (addReviewSection) addReviewSection.style.display = 'none';
    return null;
  }
  if (addReviewSection) addReviewSection.style.display = 'block';
  return token;
}

async function fetchPlaceDetails(token, placeId) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['UserAuth'] = `user ${token}`; // include only if you require auth
  const res = await fetch(`/api/v1/places/${encodeURIComponent(placeId)}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function displayPlaceDetails(place) {
  const root = document.getElementById('place-details');
  root.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = place.title || place.name || 'Place';

  const card = document.createElement('div');
  card.className = 'card';

  const c = document.createElement('div');
  c.className = 'container';

  const host = document.createElement('h4');
  host.textContent = `Host: ${place.host ?? '—'}`;

  const desc = document.createElement('h4');
  desc.textContent = `Description: ${place.description ?? '—'}`;

  const price = document.createElement('h4');
  price.textContent = `Price per night: ${place.price ?? '—'}`;

  const amenities = document.createElement('h4');
  amenities.textContent = `Amenities: ${place.amenities ?? '—'}`;

  c.append(host, desc, price, amenities);
  card.appendChild(c);
  root.append(title, card);

  const header = document.createElement('h4');
  header.textContent = 'Reviews';
  header.style.marginTop = '20px';
  root.appendChild(header);

  if (Array.isArray(place.reviews) && place.reviews.length) {
    place.reviews.slice(0, 3).forEach(r => {
      const rc = document.createElement('div');
      rc.className = 'card';
      const inner = document.createElement('div');
      inner.className = 'container';
      inner.innerHTML = `
        <p>User: ${r.user ?? '—'}</p>
        <p>Comment: ${r.comment ?? ''}</p>
        <p>${r.rating ? `Rating: ${r.rating}` : 'No rating'}</p>
      `;
      rc.appendChild(inner);
      root.appendChild(rc);
    });
  } else {
    const p = document.createElement('p');
    p.textContent = 'No reviews yet';
    root.appendChild(p);
  }
}

async function submitReview(token, placeId, comment) {
  const res = await fetch(`/api/v1/places/${encodeURIComponent(placeId)}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'UserAuth': `user ${token}` },
    body: JSON.stringify({ comment })
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
  const placeId = getPlaceIdFromURL();
  if (!placeId) return console.error('No place id in URL');

  const token = checkAuthentication();

  const label = document.getElementById('review-place-id');
  if (label) label.textContent = `Reviewing Place: ${placeId}`;

  try {
    const place = await fetchPlaceDetails(token, placeId);
    displayPlaceDetails(place);
  } catch (e) {
    console.error('Failed to load place:', e);
    const root = document.getElementById('place-details');
    if (root) root.innerHTML = '<p>Place not found or you are not authorized.</p>';
  }

  const form = document.getElementById('review-form');
  if (form && token) {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const txt = document.getElementById('review-text').value.trim();
      if (!txt) return alert('Please enter a review.');
      try {
        await submitReview(token, placeId, txt);
        form.reset();
        const updated = await fetchPlaceDetails(token, placeId);
        displayPlaceDetails(updated);
        alert('Review submitted!');
      } catch {
        alert('Failed to submit review');
      }
    });
  }
});
