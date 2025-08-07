function getPlaceIdFromURL() {
    const query_String = window.location.search;
    const params = new URLSearchParams(query_String);
    const placeId = params.get('place_id');
    console.log(placeId);
}

function checkAuthentication() {
    const token = getCookie('token');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        addReviewSection.style.display = 'none';
    } else {
        addReviewSection.style.display = 'block';
        console.log(token)
        fetchPlaceDetails(token, placeId);
    }
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

async function fetchPlaceDetails(token, placeId) {
    const url = 'http://127.0.0.1:5000/api/v1/places/${placeId}';
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'UserAuth': `user ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching place details:', error);
        throw error;
    }
}

function displayPlaceDetails(place) {
    
}