# bite-to
A dynamic web app for discovering top-rated restaurants and cafés in Toronto.
# BiteTo

**BiteTo** is a dynamic web application that helps users discover the best restaurants and cafés in Toronto. The platform allows users to explore curated food spots, search and filter results, view ratings, and interact with live widgets for an enhanced experience.

## Project Overview
Finding great places to eat can be overwhelming. BiteTo simplifies this process by providing a user-friendly interface to explore recommended local restaurants and cafés in Toronto.

## Project Pitch
BiteTo is designed to help residents and visitors discover top-rated food spots in Toronto. Users can browse curated listings, search and filter by category or location, and view ratings. The application also includes interactive features such as a trending section and live data widgets to improve the user experience.

## Target Users
- Toronto residents
- Tourists and visitors
- Food enthusiasts
- Café lovers and remote workers

## Features
- Search restaurants and cafés by name or location
- Filter by category (Café, Restaurant, Dessert, Fast Food, etc.)
- Interactive rating system (client-side)
- Trending food spots section
- Live weather widget using a public API
- Fully responsive design for mobile and desktop
- Form with client-side validation
- Dynamic gallery powered by JavaScript

## Technologies Used
- **HTML5** – Semantic structure
- **CSS3** – Responsive design using Flexbox and Grid
- **JavaScript (ES6)** – Interactivity and dynamic content
- **Fetch API** – Integration with external APIs
- **Git & GitHub** – Version control and collaboration
- **Vercel / Netlify / GitHub Pages** – Deployment

## Data Structure
```javascript
const foodSpots = [
  {
    id: 1,
    name: "Cafe Landwer",
    category: "Cafe",
    location: "Toronto",
    rating: 4.5,
    priceRange: "$$",
    image: "images/cafe-landwer.jpg",
    description: "A cozy café known for its delicious brunch."
  }
];
