# Netflix Clone

A Netflix-like platform built with HTML, CSS, JavaScript, and Bootstrap that allows users to browse movies and TV shows.

## Features

- **Movie Listings**: Browse movies and TV shows in categorized sections (Trending, Popular Movies, Top Rated, TV Shows)
- **Search Functionality**: Search for specific movies or TV shows
- **User Authentication**: Simple client-side login/signup system
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Movie Details**: View details about movies including overview, rating, release date, and genres

## Demo Images

The project uses the following images in the `images` folder:
- `netlifx-logo.png` - Netflix logo
- `device-pile-in.png` - User avatar
- `netflix_bg.jpg` - Featured background image
- `tv.png` - Default poster image
- `mobile.jpg` - Additional image for device display

## API Integration

This project uses [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api) to fetch movie and TV show data. The sample API key included is for demonstration purposes only and has limited usage. You should register for your own API key for production use.

## Setup and Installation

1. Clone the repository
2. Ensure you have the required images in the `images` folder
3. Open `index.html` in your web browser
4. Register a new account to access the content

## Project Structure

```
├── index.html            # Main HTML file
├── css/
│   └── style.css         # Main CSS file
├── js/
│   ├── api.js            # API integration
│   ├── auth.js           # Authentication functionality
│   └── app.js            # Main application logic
└── images/
    ├── netlifx-logo.png  # Netflix logo
    ├── device-pile-in.png# User avatar
    ├── netflix_bg.jpg    # Background image
    ├── tv.png            # TV/poster image
    └── mobile.jpg        # Mobile device image
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Font Awesome
- TMDB API

## Notes

- This is a frontend project for educational purposes
- Authentication is handled client-side with local storage (not secure for production)
- The actual streaming functionality is not implemented
- TMDB API usage is subject to their terms of service

## License

This project is available for personal/educational use.

## Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the API
- [Bootstrap](https://getbootstrap.com/) for the UI framework
- [Font Awesome](https://fontawesome.com/) for the icons 