// static/place.js

function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}

function getPlaceIdFromURL() {
  const q = new URLSearchParams(window.location.search).get('id');
  if (q) return q;
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
  if (token) headers['UserAuth'] = `user ${token}`;
  const res = await fetch(`/api/v1/places/${encodeURIComponent(placeId)}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ----------------- name formatting helpers ----------------- */

function extractDisplayName(obj) {
  if (!obj) return '';
  const src = obj.user || obj.data || obj;        // unwrap common wrappers
  if (Array.isArray(src)) return extractDisplayName(src[0] || {});
  const full = [src.first_name, src.last_name].filter(Boolean).join(' ').trim();
  return full || src.full_name || src.name || src.username || src.email || String(src.id ?? '');
}

// Always returns a string for host field (object → readable)
function formatHostField(val) {
  if (val == null) return '—';
  if (typeof val === 'string') return val.trim() || '—';
  if (Array.isArray(val)) {
    const names = val.map(v => formatHostField(v)).filter(Boolean);
    return names.join(', ') || '—';
  }
  if (typeof val === 'object') {
    const name = extractDisplayName(val).trim();
    return name || '—';
  }
  return String(val);
}

// If only an owner id is present, fetch user and build a name
async function resolveHostName(place, token) {
  console.log('=== DEBUG: resolveHostName ===');
  console.log('Original place.host:', place.host);
  console.log('Type of place.host:', typeof place.host);
  
  if (typeof place.host === 'string' && place.host.trim()) {
    console.log('Returning string host:', place.host);
    return place.host;
  }
  
  if (place.host && typeof place.host === 'object') {
    const name = extractDisplayName(place.host).trim();
    console.log('Extracted name from object:', name);
    if (name) {
      console.log('Returning extracted name:', name);
      return name;
    }
  }
  
  // FIX: Extract ID from owner object
  let ownerId = place.owner_id || place.ownerId || place.owner || place.user_id;
  console.log('Raw owner field:', ownerId);
  
  // If owner is an object, extract the ID
  if (ownerId && typeof ownerId === 'object') {
    ownerId = ownerId.id || ownerId.user_id || ownerId._id;
    console.log('Extracted owner ID from object:', ownerId);
  }
  
  if (!ownerId) {
    console.log('No owner ID, returning —');
    return '—';
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['UserAuth'] = `user ${token}`;
    console.log('Fetching user with ID:', ownerId);
    
    const res = await fetch(`/api/v1/users/${encodeURIComponent(ownerId)}`, { headers });
    if (!res.ok) {
      console.log('User fetch failed, status:', res.status);
      return String(ownerId);
    }
    
    const userPayload = await res.json();
    console.log('User payload:', userPayload);
    
    const name = extractDisplayName(userPayload).trim();
    console.log('Final resolved name:', name);
    
    return name || String(ownerId);
  } catch (error) {
    console.log('Error fetching user:', error);
    return String(ownerId);
  }
}

/* --------------------------- UI --------------------------- */

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
  host.textContent = `Host: ${formatHostField(place.host)}`;

  const desc = document.createElement('h4');
  desc.textContent = `Description: ${place.description ?? '—'}`;

  const price = document.createElement('h4');
  const priceVal = place.price;
  price.textContent = `Price per night: ${priceVal === 0 || priceVal ? `$${priceVal}` : '—'}`;

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
        <p>User: ${formatHostField(r.user)}</p>
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

/* -------------------------- Boot -------------------------- */

document.addEventListener('DOMContentLoaded', async () => {
  const placeId = getPlaceIdFromURL();
  if (!placeId) return console.error('No place id in URL');

  const token = checkAuthentication();

  const label = document.getElementById('review-place-id');
  if (label) label.textContent = `Reviewing Place: ${placeId}`;

  try {
    const place = await fetchPlaceDetails(token, placeId);
    // Ensure host is a readable string even before render
    place.host = await resolveHostName(place, token);
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
        updated.host = await resolveHostName(updated, token);
        displayPlaceDetails(updated);
        alert('Review submitted!');
      } catch {
        alert('Failed to submit review');
      }
    });
  }
});
