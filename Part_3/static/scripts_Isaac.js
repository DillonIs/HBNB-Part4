function getPlaceIdFromURL() {
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
    if (pathSegments.length >= 2 && pathSegments[0] === 'place') {
        return pathSegments[1];
    }
}

function checkAuthentication() {
    const token = getCookie('token');
    return token;
}


function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

async function fetchPlaceDetails(token, placeId, isReviewPage = false) {
    console.log('Fetching place with id:', placeId);
    const url = `/api/v1/places/${placeId}`;
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
        if (isReviewPage) {
            Reviewing(data);
        } else {
            displayPlaceDetails(data);
        }

    } catch (error) {
        console.error('Error fetching place details:', error);
        throw error;
    }
}

function Reviewing(place) {
    console.log("PLACE OBJECT:", place);

    const placeIdDisplay = document.getElementById('review-place-id');
    if (placeIdDisplay && place.title) {
        placeIdDisplay.textContent = `Reviewing Place: ${place.title}`;
    }

    const sectionClear = document.getElementById('place-details');
    console.log(sectionClear);
    if (sectionClear) {
        sectionClear.innerHTML = '';
    }
}

function displayPlaceDetails(place) {
    const sectionClear = document.getElementById('place-details');

    if (place.title) {
            const title = document.createElement('h2');
            title.textContent = place.title;
            sectionClear.appendChild(title);
    }

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('container');

    const host = document.createElement('h4');
    host.textContent = `Host: ${place.host}`;
    containerDiv.appendChild(host);

    const description = document.createElement('h4');
    description.textContent = `Description: ${place.description}`;
    containerDiv.appendChild(description);

    const price = document.createElement('h4');
    price.textContent = `Price per night: ${place.price}`;
    containerDiv.appendChild(price);

    const amenities = document.createElement('h4');
    amenities.textContent = `Amenities: ${place.amenities}`;
    containerDiv.appendChild(amenities);
    cardDiv.appendChild(containerDiv);
    sectionClear.appendChild(cardDiv);

    const reviewsHeader = document.createElement('h4');
    reviewsHeader.textContent = 'Reviews';
    reviewsHeader.style.marginTop = '20px';
    sectionClear.appendChild(reviewsHeader);

    if (Array.isArray(place.reviews) && place.reviews.length > 0) {
        const previewReviews = place.reviews.slice(0, 3);
        previewReviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.classList.add('card');

            const reviewContainer = document.createElement('div');
            reviewContainer.classList.add('container');

    const h3 = document.createElement('h3');
    h3.textContent = title;

            const comment = document.createElement('p');
            comment.textContent = `Comment: ${review.comment}`;
            reviewContainer.appendChild(comment);

            const rating = document.createElement('p');
            rating.textContent = review.rating ? `Rating: ${review.rating}` : 'No rating';
            reviewContainer.appendChild(rating);

            reviewCard.appendChild(reviewContainer);
            sectionClear.appendChild(reviewCard);
        });
    } else {
        const noReviews = document.createElement('p');
        noReviews.textContent = 'No reviews yet';
        sectionClear.appendChild(noReviews);
    }
    console.log('Reviews:', place.reviews);
}

async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`/api/v1/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'UserAuth': `user ${token}`
            },
            body: JSON.stringify({
                comment: reviewText,
                rating: parseInt(rating),
                place_id: placeId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`API error response:`, errorData);
            throw new Error(errorData.message || 'Failed to submit review');
        }

        const data = await response.json();
        console.log('Review submitted successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to submit review:', error.message);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const placeId = getPlaceIdFromURL();
    console.log('Extracted placeId:', placeId);
    if (!placeId) {
        console.error('No place ID found');
        return;
    }

    const token = checkAuthentication();
    const isReviewPage = window.location.pathname.includes('/review');
    const submitBtn = document.getElementById('submit-button');

    const reviewForm = document.getElementById('review-form');
    if (!token && reviewForm) {
        document.getElementById('review').disabled = true;
        document.getElementById('rating').disabled = true;
        if (submitBtn) submitBtn.disabled = true;
    }

    try {
        const isReviewPage = window.location.pathname.includes('/review');
        await fetchPlaceDetails(token, placeId, isReviewPage);
    } catch (error) {
        console.error('Could not fetch place details:', error);
    }

    if (token) {
        const addReviewSection = document.getElementById('add-review');
        const reviewForm = document.getElementById('review-form');
        if (addReviewSection) addReviewSection.style.display = 'block';
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const token = getCookie('token');
                if (!token) {
                    alert('You must be signed in to submit a review.');
                    window.location.href = '/login.html';
                    return;
                }

                const reviewText = document.getElementById('review').value.trim();
                const rating = document.getElementById('rating').value;

                if (reviewText === '') {
                    alert('Please enter a review.');
                return;
            }

        try {
            await submitReview(token, placeId, reviewText, rating);
            alert('Review submitted!');
            reviewForm.reset();
            await fetchPlaceDetails(token, placeId, isReviewPage);
        } catch (error) {
            alert('Failed to submit review')
        }
    });
}
    }
});