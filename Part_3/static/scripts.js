function getPlaceIdFromURL() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
}

const addReviewSection = document.getElementById('add-review');

function checkAuthentication() {
    const token = getCookie('token');

    if (!token) {
        // window.location.href = 'index.html';
        addReviewSection.style.display = 'none';
        return null;
    } else {
        addReviewSection.style.display = 'block';
        console.log(token);
    }
    return token;
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
        displayPlaceDetails(data);
    } catch (error) {
        console.error('Error fetching place details:', error);
        throw error;
    }
}

function displayPlaceDetails(place) {
    console.log(place);
    const sectionClear = document.getElementById('place-details');
    console.log(sectionClear);
    sectionClear.innerHTML = '';

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('container');

    const host = document.createElement('h4');
    host.textContent = `Host: ${place.host}`;
    containerDiv.appendChild(host);

    if (place.title) {
        const title = document.createElement('h2');
        title.textContent = place.title;
        sectionClear.appendChild(title);
    }

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

            const user = document.createElement('p');
            user.textContent = `User: ${review.user}`;
            reviewContainer.appendChild(user);

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

async function submitReview(token, placeId, reviewText) {
    try {
        const response = await fetch(`/api/v1/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'UserAuth': `user ${token}`
            },
            body: JSON.stringify({
                comment: reviewText
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
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
    if (!placeId) {
        console.error('No place ID found');
        return;
    }

    const token = checkAuthentication();
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        console.warn('User not logged in');
        if (addReviewSection) addReviewSection.style.display = 'none'
        return;
    } else {
        if (addReviewSection) addReviewSection.style.display = 'block';
    }

    const placeIdDisplay = document.getElementById('review-place-id');
    if (placeIdDisplay) {
        placeIdDisplay.textContent = `Reviewing Place: ${placeId}`;
    }

    try {
        await fetchPlaceDetails(token, placeId);
    } catch (error) {
        console.error('Could not fetch place details:', error);
    }

    const reviewForm = document.getElementById('review-form');

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = document.getElementById('review-text').value.trim();

            if (reviewText === '') {
                alert('Please enter a review.');
                return;
            }

        try {
            await submitReview(token, placeId, reviewText);
            alert('Review submitted!');
            reviewForm.reset();
        } catch (error) {
            alert('Failed to submit review')
        }
    });
}
});