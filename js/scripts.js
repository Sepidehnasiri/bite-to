let foodSpots = [];

document.addEventListener("DOMContentLoaded", () => {
    getWeather();
    loadSpots();
    initAddSpotForm();
});

function getWeather() {
    // مختصات تورنتو
    const latitude = 43.65107;
    const longitude = -79.347015;

    // استفاده از Open-Meteo API (رایگان و بدون نیاز به کلید)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            return response.json();
        })
        .then(data => {
            const temperature = data.current_weather.temperature;
            const weatherCode = data.current_weather.weathercode;

            document.getElementById("temperature").textContent = `${temperature}°C`;
            document.getElementById("weather-description").textContent =
                getWeatherDescription(weatherCode);
        })
        .catch(error => {
            console.error("Weather Error:", error);
            document.getElementById("weather-description").textContent =
                "Unable to load weather data.";
        });
}

async function loadSpots() {
    try {
        const response = await fetch("spots.json");
        if (!response.ok) {
            throw new Error("Failed to load spots data");
        }

        let data = await response.json();
        data.spots = data.spots.map(spot => ({
            ...spot,
            image: normalizeImagePath(spot.image),
            imageFull: normalizeImagePath(spot.imageFull || spot.image)
        }));

        const cachedData = JSON.parse(localStorage.getItem('spotsData')) || null;
        if (cachedData && Array.isArray(cachedData.spots)) {
            const additionalSpots = cachedData.spots.filter(cachedSpot =>
                !data.spots.some(spot => spot.id === cachedSpot.id)
            );
            if (additionalSpots.length) {
                data.spots = [...data.spots, ...additionalSpots];
            }
        }

        localStorage.setItem('spotsData', JSON.stringify(data));

        foodSpots = data.spots;

        const spots = data.spots;
        if (document.getElementById("featured-spot")) {
            renderFeaturedSpot(spots);
        }
        if (document.getElementById("trending-spots")) {
            renderTrendingSpots(spots);
        }
        if (document.getElementById("gallery-grid")) {
            renderGallery();
        }
    } catch (error) {
        console.error("Spots Error:", error);
        document.getElementById("featured-spot").textContent = "Unable to load spot data.";
        document.getElementById("trending-spots").textContent = "Unable to load trending spots.";
    }
}

function normalizeImagePath(path) {
    if (!path) return path;
    return path.trim();
}

function renderFeaturedSpot(spots) {
    const featuredSpot = spots.find(spot => spot.featured) || spots[0];
    if (!featuredSpot) {
        document.getElementById("featured-spot").textContent = "No featured spot available.";
        return;
    }

    document.getElementById("featured-spot").innerHTML = `
        <img src="${featuredSpot.imageFull || featuredSpot.image}" alt="${featuredSpot.imageAlt || featuredSpot.name}" class="spot-image" data-spot-id="${featuredSpot.id}">
        <h3>${featuredSpot.emoji} ${featuredSpot.name}</h3>
        <p>${featuredSpot.description}</p>
        <p><strong>Category:</strong> ${featuredSpot.category}</p>
        <p><strong>Location:</strong> ${featuredSpot.location}</p>
        <p><strong>Rating:</strong> ${featuredSpot.rating} ⭐ (${featuredSpot.reviewCount} reviews)</p>
        <p><strong>Address:</strong> ${featuredSpot.address}</p>
        <p><strong>Price:</strong> ${featuredSpot.priceRange}</p>
        ${featuredSpot.tag ? `<p><em>${featuredSpot.tag}</em></p>` : ''}
    `;

    // Add click listener
    document.querySelector("#featured-spot .spot-image").addEventListener("click", () => showSpotModal(featuredSpot));
}

function renderTrendingSpots(spots) {
    const trending = spots.filter(spot => spot.trending);
    if (trending.length === 0) {
        document.getElementById("trending-spots").textContent = "No trending spots available.";
        return;
    }

    document.getElementById("trending-spots").innerHTML = trending
        .map(spot => `
            <div class="trending-card">
                <img src="${spot.image}" alt="${spot.imageAlt || spot.name}" class="spot-image" data-spot-id="${spot.id}">
                <h3>${spot.emoji} ${spot.name}</h3>
                <p>${spot.category} · ${spot.priceRange} · ${spot.location}</p>
                <p>${spot.description}</p>
                <p><strong>${spot.rating} ⭐</strong> · ${spot.reviewCount} reviews</p>
                ${spot.tag ? `<p><em>${spot.tag}</em></p>` : ''}
            </div>
        `)
        .join("");

    // Add click listeners to all trending spot images
    document.querySelectorAll("#trending-spots .spot-image").forEach(img => {
        img.addEventListener("click", (e) => {
            const spotId = parseInt(e.target.dataset.spotId);
            const spot = trending.find(s => s.id === spotId);
            if (spot) showSpotModal(spot);
        });
    });
}

function initAddSpotForm() {
    const form = document.getElementById('add-spot-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateForm()) {
            const newSpot = {
                id: Date.now(), // Simple unique ID
                name: document.getElementById('name').value.trim(),
                description: document.getElementById('description').value.trim(),
                category: document.getElementById('category').value,
                location: document.getElementById('location').value.trim(),
                emoji: document.getElementById('emoji').value.trim(),
                tag: document.getElementById('tag').value.trim(),
                cuisine: document.getElementById('cuisine').value.trim(),
                rating: parseFloat(document.getElementById('rating').value),
                reviewCount: parseInt(document.getElementById('reviews').value),
                address: document.getElementById('address').value.trim(),
                priceRange: document.getElementById('priceRange').value,
                featured: document.getElementById('featured').checked,
                trending: document.getElementById('trending').checked,
                image: document.getElementById('image').value.trim() || 'https://via.placeholder.com/400x300/FAF7F2/1F3D3A?text=New+Spot', // Default image
                imageFull: document.getElementById('image').value.trim() || 'https://via.placeholder.com/1200x800/FAF7F2/1F3D3A?text=New+Spot', // Default full image
                imageAlt: `${document.getElementById('name').value.trim()} image`,
                tags: [] // Can be added later
            };

            saveSpot(newSpot);
            alert('Spot added successfully!');
            form.reset();
        }
    });
}

function validateForm() {
    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    // Name
    const name = document.getElementById('name').value.trim();
    if (!name) {
        document.getElementById('name-error').textContent = 'Spot name is required.';
        isValid = false;
    }

    // Description
    const description = document.getElementById('description').value.trim();
    if (!description) {
        document.getElementById('description-error').textContent = 'Description is required.';
        isValid = false;
    }

    // Category
    const category = document.getElementById('category').value;
    if (!category) {
        document.getElementById('category-error').textContent = 'Please select a category.';
        isValid = false;
    }

    // Location
    const location = document.getElementById('location').value.trim();
    if (!location) {
        document.getElementById('location-error').textContent = 'Location is required.';
        isValid = false;
    }

    // Cuisine
    const cuisine = document.getElementById('cuisine').value.trim();
    if (!cuisine) {
        document.getElementById('cuisine-error').textContent = 'Cuisine type is required.';
        isValid = false;
    }

    // Rating
    const rating = parseFloat(document.getElementById('rating').value);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        document.getElementById('rating-error').textContent = 'Rating must be between 1 and 5.';
        isValid = false;
    }

    // Reviews
    const reviews = parseInt(document.getElementById('reviews').value);
    if (isNaN(reviews) || reviews < 0) {
        document.getElementById('reviews-error').textContent = 'Number of reviews must be a positive number.';
        isValid = false;
    }

    // Address
    const address = document.getElementById('address').value.trim();
    if (!address) {
        document.getElementById('address-error').textContent = 'Address is required.';
        isValid = false;
    }

    // Price Range
    const priceRange = document.getElementById('priceRange').value;
    if (!priceRange) {
        document.getElementById('priceRange-error').textContent = 'Please select a price range.';
        isValid = false;
    }

    // Image URL (optional, but if provided, must be valid URL)
    const image = document.getElementById('image').value.trim();
    if (image && !isValidUrl(image)) {
        document.getElementById('image-error').textContent = 'Please enter a valid image URL.';
        isValid = false;
    }

    return isValid;
}

function saveSpot(newSpot) {
    let data = JSON.parse(localStorage.getItem('spotsData')) || null;
    if (!data) {
        // If no data, load from JSON
        fetch("spots.json").then(r => r.json()).then(d => {
            d.spots.push(newSpot);
            localStorage.setItem('spotsData', JSON.stringify(d));
        });
    } else {
        data.spots.push(newSpot);
        localStorage.setItem('spotsData', JSON.stringify(data));
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showSpotModal(spot) {
    const modal = document.getElementById("spot-modal");
    const modalBody = document.getElementById("modal-body");

    modalBody.innerHTML = `
        <img src="${spot.imageFull || spot.image}" alt="${spot.imageAlt || spot.name}">
        <h2>${spot.emoji} ${spot.name}</h2>
        <p><strong>Description:</strong> ${spot.description}</p>
        <p><strong>Category:</strong> ${spot.category}</p>
        <p><strong>Location:</strong> ${spot.location}</p>
        <p><strong>Rating:</strong> ${spot.rating} ⭐ (${spot.reviewCount} reviews)</p>
        <p><strong>Address:</strong> ${spot.address}</p>
        <p><strong>Price Range:</strong> ${spot.priceRange}</p>
        ${spot.tag ? `<p><strong>Tag:</strong> ${spot.tag}</p>` : ''}
        ${spot.mustTry ? `<p><strong>Must Try:</strong> ${spot.mustTry.join(', ')}</p>` : ''}
        ${spot.hours ? `<p><strong>Hours:</strong> Mon: ${spot.hours.monday}, Tue: ${spot.hours.tuesday}, etc.</p>` : ''}
        ${spot.tags ? `<p><strong>Tags:</strong> ${spot.tags.join(', ')}</p>` : ''}
    `;

    modal.style.display = "block";

    // Close modal when clicking the close button
    document.querySelector(".close").onclick = () => {
        modal.style.display = "none";
    };

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}

// تبدیل کد آب‌وهوا به توضیح متنی
function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Clear Sky ☀️",
        1: "Mainly Clear 🌤️",
        2: "Partly Cloudy ⛅",
        3: "Cloudy ☁️",
        45: "Foggy 🌫️",
        48: "Rime Fog 🌫️",
        51: "Light Drizzle 🌦️",
        53: "Drizzle 🌦️",
        55: "Heavy Drizzle 🌧️",
        61: "Light Rain 🌦️",
        63: "Rain 🌧️",
        65: "Heavy Rain 🌧️",
        71: "Light Snow 🌨️",
        73: "Snow 🌨️",
        75: "Heavy Snow ❄️",
        80: "Rain Showers 🌦️",
        81: "Rain Showers 🌧️",
        82: "Heavy Showers ⛈️",
        95: "Thunderstorm ⛈️"
    };

    return weatherCodes[code] || "Unknown Weather";
}
/* ===============================
   STATE
================================= */
let activeFilter = "All";
let votes = {};

/* ===============================
   FILTER
================================= */
function setFilter(category, button) {
    activeFilter = category;

    document.querySelectorAll(".pill").forEach(pill => {
        pill.classList.remove("active");
    });

    button.classList.add("active");
    renderGallery();
}

/* ===============================
   RENDER GALLERY
================================= */
function renderGallery() {
    const gallery = document.getElementById("gallery-grid");
    const searchInput = document.getElementById("search-input");

    if (!gallery) return;

    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filteredSpots = foodSpots.filter(spot => {
        const matchesCategory =
            activeFilter === "All" || spot.category === activeFilter;

        const matchesSearch =
            spot.name.toLowerCase().includes(searchValue) ||
            spot.category.toLowerCase().includes(searchValue) ||
            spot.location.toLowerCase().includes(searchValue) ||
            spot.description.toLowerCase().includes(searchValue);

        return matchesCategory && matchesSearch;
    });

    gallery.innerHTML = "";

    if (filteredSpots.length === 0) {
        gallery.innerHTML = `
            <div class="no-results">
                <h3>No spots found</h3>
                <p>Try another search or filter.</p>
            </div>
        `;
        return;
    }

    filteredSpots.forEach(spot => {
        const voteState = votes[spot.id];

        const card = document.createElement("div");
        card.className = "gcard";

        card.innerHTML = `
            <div class="gcard-thumb">
                <img src="${spot.image}" alt="${spot.name}">
            </div>
            <div class="gcard-body">
                <h3 class="gcard-name">${spot.name}</h3>
                <p class="gcard-loc">${spot.category} • ${spot.location}</p>
                <p class="gcard-desc">${spot.description}</p>

                <div class="gcard-footer">
                    <div>
                        <span class="stars">${spot.rating} ⭐</span>
                        <span class="rval">· ${spot.reviews} reviews</span>
                    </div>
                    <span class="gcard-tag">${spot.tag}</span>
                </div>

                <div class="rating-btns">
                    <button class="rbtn ${voteState === "up" ? "voted-up" : ""}" onclick="vote(${spot.id}, 'up')">
                        Good Spot
                    </button>
                    <button class="rbtn ${voteState === "down" ? "voted-down" : ""}" onclick="vote(${spot.id}, 'down')">
                        Not for me
                    </button>
                </div>
            </div>
        `;

        gallery.appendChild(card);
    });
}

/* ===============================
   VOTE
================================= */
function vote(id, type) {
    if (votes[id] === type) {
        votes[id] = null;
    } else {
        votes[id] = type;
    }

    renderGallery();
}

/* ===============================
   PAGE INIT
================================= */
document.addEventListener("DOMContentLoaded", () => {
    renderGallery();
});