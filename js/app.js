// Main application code

// DOM Elements
const mainContent = document.getElementById('mainContent');
const featuredSection = document.querySelector('.featured-section');
const featuredTitle = document.querySelector('.featured-title');
const featuredDescription = document.querySelector('.featured-description');
const trendingRow = document.getElementById('trendingRow');
const popularMoviesRow = document.getElementById('popularMoviesRow');
const topRatedRow = document.getElementById('topRatedRow');
const tvShowsRow = document.getElementById('tvShowsRow');
const searchInput = document.getElementById('searchInput');
const movieModal = document.getElementById('movieModal');
const loginModal = document.getElementById('loginModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.time('App Initialization');
    
    // Remove any existing avatar-initials elements
    const avatarInitials = document.querySelectorAll('.avatar-initials');
    avatarInitials.forEach(element => element.remove());
    
    // Initialize auth
    initAuth();
    
    try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            // Show login modal
            setTimeout(() => {
                const modal = new bootstrap.Modal(loginModal);
                if (modal) {
                    modal.show();
                } else {
                    console.error('Login modal not found or Bootstrap not loaded');
                    alert('Please sign in to continue');
                }
            }, 100); // Small delay to ensure DOM is ready
        } else {
            // Load content - now loading sequentially to prevent overwhelming the API
            loadContentSequentially();
        }
        
        // Setup header scroll effect
        setupHeaderScroll();
        
        // Setup search functionality
        setupSearch();
        
        // Make sure all modals have proper button handling
        setupModalButtons();
        
        // Setup navigation bar buttons
        setupNavigation();
        
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('There was an error loading the application. Please try refreshing the page.');
    }
    
    console.timeEnd('App Initialization');
});

// Load content sequentially to prevent overwhelming the API
async function loadContentSequentially() {
    console.time('Content Loading');
    
    // First load featured content (most important)
    await loadFeaturedContent();
    
    // Then load the rows one by one
    await loadTrending();
    await loadPopularMovies();
    await loadTopRated();
    await loadTvShows();
    
    console.timeEnd('Content Loading');
}

// Load featured content
async function loadFeaturedContent() {
    // Show loading state
    featuredTitle.textContent = 'Loading featured content...';
    featuredDescription.textContent = 'Please wait while we load the featured content.';
    
    const data = await getPopularMovies();
    
    if (!data || !data.results || data.results.length === 0) {
        console.error('No featured content available');
        featuredTitle.textContent = 'Featured Content Unavailable';
        featuredDescription.textContent = 'Please try refreshing the page.';
        return;
    }
    
    // Get a random movie from the top 5
    const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
    const featuredMovie = data.results[randomIndex];
    
    // Format the movie data
    const formattedMovie = await formatMediaData(featuredMovie, 'movie');
    
    if (!formattedMovie) {
        featuredTitle.textContent = 'Featured Content Error';
        featuredDescription.textContent = 'Unable to load featured content details.';
        return;
    }
    
    // Update the featured section
    featuredTitle.textContent = formattedMovie.title;
    featuredDescription.textContent = formattedMovie.overview;
    
    // Use an image preloader for the backdrop
    const preloadImage = new Image();
    
    // Add loading class to featured section
    featuredSection.classList.add('loading');
    
    preloadImage.onload = () => {
        featuredSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 1)), url('${formattedMovie.backdrop}')`;
        // Remove loading class when image is loaded
        featuredSection.classList.remove('loading');
    };
    
    preloadImage.onerror = () => {
        featuredSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 1)), url('images/netflix_bg.jpg')`;
        // Remove loading class even if there's an error
        featuredSection.classList.remove('loading');
    };
    
    preloadImage.src = formattedMovie.backdrop;
    
    // Add click event to play button
    const playButton = featuredSection.querySelector('.btn-light');
    if (playButton) {
        playButton.addEventListener('click', () => {
            showMovieDetails(formattedMovie.id, formattedMovie.mediaType);
        });
    }
    
    // Add click event to more info button
    const infoButton = featuredSection.querySelector('.btn-secondary');
    if (infoButton) {
        infoButton.addEventListener('click', () => {
            showMovieDetails(formattedMovie.id, formattedMovie.mediaType);
        });
    }
}

// Setup all modal buttons
function setupModalButtons() {
    // Setup movie modal buttons
    const movieModalElem = document.getElementById('movieModal');
    if (movieModalElem) {
        const playButton = movieModalElem.querySelector('.modal-footer .btn-light');
        const myListButton = movieModalElem.querySelector('.modal-footer .btn-secondary');
        
        if (playButton) {
            playButton.addEventListener('click', function() {
                alert('Playback would start here in a real Netflix app');
            });
        }
        
        if (myListButton) {
            myListButton.addEventListener('click', function() {
                alert('Added to your list!');
            });
        }
    }
}

// Load trending content
async function loadTrending() {
    const data = await getTrending();
    
    if (!data || !data.results) {
        console.error('No trending content available');
        return;
    }
    
    // Clear loader
    trendingRow.innerHTML = '';
    
    // Add movie cards
    for (const item of data.results.slice(0, 10)) {
        const movie = await formatMediaData(item);
        addMovieCard(trendingRow, movie);
    }
}

// Load popular movies
async function loadPopularMovies() {
    const data = await getPopularMovies();
    
    if (!data || !data.results) {
        console.error('No popular movies available');
        return;
    }
    
    // Clear loader
    popularMoviesRow.innerHTML = '';
    
    // Add movie cards
    for (const movie of data.results.slice(0, 10)) {
        const formattedMovie = await formatMediaData(movie, 'movie');
        addMovieCard(popularMoviesRow, formattedMovie);
    }
}

// Load top rated movies
async function loadTopRated() {
    const data = await getTopRated();
    
    if (!data || !data.results) {
        console.error('No top rated content available');
        return;
    }
    
    // Clear loader
    topRatedRow.innerHTML = '';
    
    // Add movie cards
    for (const movie of data.results.slice(0, 10)) {
        const formattedMovie = await formatMediaData(movie, 'movie');
        addMovieCard(topRatedRow, formattedMovie);
    }
}

// Load TV shows
async function loadTvShows() {
    const data = await getTvShows();
    
    if (!data || !data.results) {
        console.error('No TV shows available');
        return;
    }
    
    // Clear loader
    tvShowsRow.innerHTML = '';
    
    // Add movie cards
    for (const show of data.results.slice(0, 10)) {
        const formattedShow = await formatMediaData(show, 'tv');
        addMovieCard(tvShowsRow, formattedShow);
    }
}

// Add a movie card to a container - optimized for performance
function addMovieCard(container, movie) {
    if (!container || !movie) {
        console.error('Container or movie data missing');
        return;
    }
    
    try {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.id = movie.id;
        movieCard.dataset.type = movie.mediaType;
        
        // Using a more efficient way to create the card
        const img = document.createElement('img');
        img.src = movie.poster;
        img.alt = movie.title;
        img.className = 'movie-poster';
        img.onerror = function() { this.src = 'images/tv.png'; };
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'movie-info';
        
        const title = document.createElement('h5');
        title.className = 'movie-title';
        title.textContent = movie.title || 'Untitled';
        
        const rating = document.createElement('div');
        rating.className = 'movie-rating';
        rating.textContent = `${(movie.rating || 0).toFixed(1)} ⭐`;
        
        infoDiv.appendChild(title);
        infoDiv.appendChild(rating);
        
        movieCard.appendChild(img);
        movieCard.appendChild(infoDiv);
        
        movieCard.addEventListener('click', () => {
            showMovieDetails(movie.id, movie.mediaType);
        });
        
        container.appendChild(movieCard);
    } catch (error) {
        console.error('Error creating movie card:', error);
    }
}

// Show movie details modal
async function showMovieDetails(id, type) {
    // Show loading state in modal first
    document.getElementById('movieModalLabel').textContent = 'Loading...';
    document.getElementById('modalOverview').textContent = 'Loading details...';
    document.getElementById('modalReleaseDate').textContent = '';
    document.getElementById('modalRating').textContent = '';
    document.getElementById('modalGenres').textContent = '';
    document.getElementById('modalPoster').src = 'images/tv.png';
    
    // Show modal immediately for better UX
    const modal = new bootstrap.Modal(movieModal);
    modal.show();
    
    // Then get the details
    const details = type === 'tv' 
        ? await getTvDetails(id)
        : await getMovieDetails(id);
    
    if (!details) {
        console.error(`No details available for ${type} with ID ${id}`);
        document.getElementById('movieModalLabel').textContent = 'Error Loading Content';
        document.getElementById('modalOverview').textContent = 'Could not load details for this content.';
        return;
    }
    
    // Format data for display
    const formattedData = await formatMediaData(details, type);
    
    if (!formattedData) return;
    
    // Get genre names
    const genreNames = await getGenreNames(formattedData.genreIds);
    
    // Update modal with full details
    document.getElementById('movieModalLabel').textContent = formattedData.title;
    document.getElementById('modalOverview').textContent = formattedData.overview;
    document.getElementById('modalReleaseDate').textContent = formattedData.releaseDate || 'Unknown';
    document.getElementById('modalRating').textContent = `${formattedData.rating.toFixed(1)}/10`;
    document.getElementById('modalGenres').textContent = genreNames.join(', ') || 'Not categorized';
    
    // Use image preloading for poster
    const img = new Image();
    img.onload = function() {
        document.getElementById('modalPoster').src = formattedData.poster;
    };
    img.onerror = function() {
        document.getElementById('modalPoster').src = 'images/tv.png';
    };
    img.src = formattedData.poster;
}

// Setup header scroll effect
function setupHeaderScroll() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Setup search functionality
function setupSearch() {
    if (!searchInput) return;
    
    // Make search icon clickable to show/focus search input
    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', function() {
            searchInput.focus();
            // Add a visible active class to the search container
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.classList.add('active');
            }
        });
    }
    
    // Debounce function to limit API calls
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
    
    // Handle search
    const handleSearch = debounce(async (event) => {
        const query = event.target.value.trim();
        
        if (query.length < 2) {
            // If search is cleared, restore original content
            if (mainContent.querySelector('.search-results')) {
                window.location.reload();
            }
            return;
        }
        
        // Show loading indicator
        mainContent.innerHTML = `
            <div class="text-center mt-5">
                <div class="loader"></div>
                <p>Searching for "${query}"...</p>
            </div>
        `;
        
        const searchResults = await searchMedia(query);
        
        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            mainContent.innerHTML = `
                <div class="text-center mt-5">
                    <h3>No results found for "${query}"</h3>
                    <button id="backToHomeBtn" class="btn btn-outline-light mt-4">
                        <i class="fas fa-arrow-left me-2"></i>Back to Browse
                    </button>
                </div>
            `;
            
            const backBtn = document.getElementById('backToHomeBtn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    window.location.reload();
                });
            }
            return;
        }
        
        // Hide all sections except search results
        mainContent.innerHTML = `
            <section class="search-results category-section">
                <h3 class="category-title">Search Results for "${query}"</h3>
                <div class="movie-row" id="searchResultsRow"></div>
                <button id="backToHomeBtn" class="btn btn-outline-light mt-4">
                    <i class="fas fa-arrow-left me-2"></i>Back to Browse
                </button>
            </section>
        `;
        
        const searchResultsRow = document.getElementById('searchResultsRow');
        
        // Add movie cards
        let validResults = 0;
        for (const item of searchResults.results.filter(item => item.media_type !== 'person')) {
            const formattedItem = await formatMediaData(item);
            if (formattedItem) {
                addMovieCard(searchResultsRow, formattedItem);
                validResults++;
            }
        }
        
        if (validResults === 0) {
            mainContent.innerHTML = `
                <div class="text-center mt-5">
                    <h3>No valid results found for "${query}"</h3>
                    <button id="backToHomeBtn" class="btn btn-outline-light mt-4">
                        <i class="fas fa-arrow-left me-2"></i>Back to Browse
                    </button>
                </div>
            `;
        }
        
        // Add back button functionality
        const backBtn = document.getElementById('backToHomeBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }, 500);
    
    searchInput.addEventListener('input', handleSearch);
    
    // Clear search on escape key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            // If there were search results, reload to original content
            if (mainContent.querySelector('.search-results')) {
                window.location.reload();
            }
            searchInput.blur();
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.classList.remove('active');
            }
        }
    });
}

// Setup navigation buttons
function setupNavigation() {
    const homeLink = document.querySelector('.navbar-nav .nav-item:nth-child(1) .nav-link');
    const tvShowsLink = document.querySelector('.navbar-nav .nav-item:nth-child(2) .nav-link');
    const moviesLink = document.querySelector('.navbar-nav .nav-item:nth-child(3) .nav-link');
    const newPopularLink = document.querySelector('.navbar-nav .nav-item:nth-child(4) .nav-link');
    const myListLink = document.querySelector('.navbar-nav .nav-item:nth-child(5) .nav-link');
    
    // Handle Home navigation
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Reset active state
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
            homeLink.classList.add('active');
            
            // Reload the page to show all content
            window.location.reload();
        });
    }
    
    // Handle TV Shows navigation
    if (tvShowsLink) {
        tvShowsLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Reset active state
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
            tvShowsLink.classList.add('active');
            
            // Filter content to show only TV Shows
            filterContentByType('tv');
        });
    }
    
    // Handle Movies navigation
    if (moviesLink) {
        moviesLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Reset active state
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
            moviesLink.classList.add('active');
            
            // Filter content to show only Movies
            filterContentByType('movie');
        });
    }
    
    // Handle New & Popular navigation
    if (newPopularLink) {
        newPopularLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Reset active state
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
            newPopularLink.classList.add('active');
            
            // Show trending content
            showTrendingContent();
        });
    }
    
    // Handle My List navigation
    if (myListLink) {
        myListLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Reset active state
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
            myListLink.classList.add('active');
            
            // Show My List (in this demo, we'll show a message)
            showMyList();
        });
    }
}

// Filter content by media type (tv or movie)
async function filterContentByType(mediaType) {
    // Show loading state
    mainContent.innerHTML = `
        <div class="text-center mt-5">
            <div class="loader"></div>
            <p>Loading ${mediaType === 'tv' ? 'TV Shows' : 'Movies'}...</p>
        </div>
    `;
    
    try {
        // Get the appropriate data based on media type
        const data = mediaType === 'tv' 
            ? await getTvShows() 
            : await getPopularMovies();
        
        if (!data || !data.results || data.results.length === 0) {
            mainContent.innerHTML = `
                <div class="text-center mt-5">
                    <p>No ${mediaType === 'tv' ? 'TV Shows' : 'Movies'} found.</p>
                </div>
            `;
            return;
        }
        
        // Create content container
        mainContent.innerHTML = `
            <section class="featured-section">
                <div class="featured-content">
                    <h1 class="featured-title">Loading featured content...</h1>
                    <p class="featured-description"></p>
                    <div class="featured-buttons">
                        <button class="btn btn-light"><i class="fas fa-play me-2"></i>Play</button>
                        <button class="btn btn-secondary"><i class="fas fa-info-circle me-2"></i>More Info</button>
                    </div>
                </div>
            </section>
            <section class="movie-categories">
                <div class="category-section">
                    <h3 class="category-title">${mediaType === 'tv' ? 'TV Shows' : 'Movies'}</h3>
                    <div class="movie-row" id="filteredContentRow"></div>
                </div>
            </section>
        `;
        
        // Set the featured content
        const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
        const featuredItem = data.results[randomIndex];
        const formattedItem = await formatMediaData(featuredItem, mediaType);
        
        if (formattedItem) {
            const featuredTitle = document.querySelector('.featured-title');
            const featuredDescription = document.querySelector('.featured-description');
            const featuredSection = document.querySelector('.featured-section');
            
            if (featuredTitle) featuredTitle.textContent = formattedItem.title;
            if (featuredDescription) featuredDescription.textContent = formattedItem.overview;
            
            // Use an image preloader for the backdrop
            const preloadImage = new Image();
            preloadImage.onload = () => {
                if (featuredSection) featuredSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 1)), url('${formattedItem.backdrop}')`;
            };
            preloadImage.onerror = () => {
                if (featuredSection) featuredSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 1)), url('images/netflix_bg.jpg')`;
            };
            preloadImage.src = formattedItem.backdrop;
            
            // Add button event listeners
            const playButton = featuredSection.querySelector('.btn-light');
            const infoButton = featuredSection.querySelector('.btn-secondary');
            
            if (playButton) {
                playButton.addEventListener('click', () => {
                    showMovieDetails(formattedItem.id, formattedItem.mediaType);
                });
            }
            
            if (infoButton) {
                infoButton.addEventListener('click', () => {
                    showMovieDetails(formattedItem.id, formattedItem.mediaType);
                });
            }
        }
        
        // Populate the content row
        const filteredContentRow = document.getElementById('filteredContentRow');
        if (filteredContentRow) {
            for (const item of data.results) {
                const formattedItem = await formatMediaData(item, mediaType);
                if (formattedItem) {
                    addMovieCard(filteredContentRow, formattedItem);
                }
            }
        }
    } catch (error) {
        console.error(`Error loading ${mediaType} content:`, error);
        mainContent.innerHTML = `
            <div class="text-center mt-5">
                <p>Error loading content. Please try again.</p>
            </div>
        `;
    }
}

// Show trending content
async function showTrendingContent() {
    // Show loading state
    mainContent.innerHTML = `
        <div class="text-center mt-5">
            <div class="loader"></div>
            <p>Loading trending content...</p>
        </div>
    `;
    
    try {
        const data = await getTrending();
        
        if (!data || !data.results || data.results.length === 0) {
            mainContent.innerHTML = `
                <div class="text-center mt-5">
                    <p>No trending content found.</p>
                </div>
            `;
            return;
        }
        
        // Create content container
        mainContent.innerHTML = `
            <section class="featured-section">
                <div class="featured-content">
                    <h1 class="featured-title">Loading featured content...</h1>
                    <p class="featured-description"></p>
                    <div class="featured-buttons">
                        <button class="btn btn-light"><i class="fas fa-play me-2"></i>Play</button>
                        <button class="btn btn-secondary"><i class="fas fa-info-circle me-2"></i>More Info</button>
                    </div>
                </div>
            </section>
            <section class="movie-categories">
                <div class="category-section">
                    <h3 class="category-title">Trending Now</h3>
                    <div class="movie-row" id="trendingContentRow"></div>
                </div>
            </section>
        `;
        
        // Set the featured content
        const randomIndex = Math.floor(Math.random() * Math.min(5, data.results.length));
        const featuredItem = data.results[randomIndex];
        const formattedItem = await formatMediaData(featuredItem);
        
        if (formattedItem) {
            const featuredTitle = document.querySelector('.featured-title');
            const featuredDescription = document.querySelector('.featured-description');
            const featuredSection = document.querySelector('.featured-section');
            
            if (featuredTitle) featuredTitle.textContent = formattedItem.title;
            if (featuredDescription) featuredDescription.textContent = formattedItem.overview;
            
            // Use an image preloader for the backdrop
            const preloadImage = new Image();
            preloadImage.onload = () => {
                if (featuredSection) featuredSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 1)), url('${formattedItem.backdrop}')`;
            };
            preloadImage.onerror = () => {
                if (featuredSection) featuredSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(20, 20, 20, 1)), url('images/netflix_bg.jpg')`;
            };
            preloadImage.src = formattedItem.backdrop;
            
            // Add button event listeners
            const playButton = featuredSection.querySelector('.btn-light');
            const infoButton = featuredSection.querySelector('.btn-secondary');
            
            if (playButton) {
                playButton.addEventListener('click', () => {
                    showMovieDetails(formattedItem.id, formattedItem.mediaType);
                });
            }
            
            if (infoButton) {
                infoButton.addEventListener('click', () => {
                    showMovieDetails(formattedItem.id, formattedItem.mediaType);
                });
            }
        }
        
        // Populate the content row
        const trendingContentRow = document.getElementById('trendingContentRow');
        if (trendingContentRow) {
            for (const item of data.results) {
                const formattedItem = await formatMediaData(item);
                if (formattedItem) {
                    addMovieCard(trendingContentRow, formattedItem);
                }
            }
        }
    } catch (error) {
        console.error('Error loading trending content:', error);
        mainContent.innerHTML = `
            <div class="text-center mt-5">
                <p>Error loading content. Please try again.</p>
            </div>
        `;
    }
}

// Show My List
function showMyList() {
    mainContent.innerHTML = `
        <div class="text-center my-5 p-5">
            <h2>My List</h2>
            <p class="mt-4">You haven't added any titles to your list yet.</p>
            <button id="browseContent" class="btn btn-outline-light mt-3">Browse Content</button>
        </div>
    `;
    
    const browseBtn = document.getElementById('browseContent');
    if (browseBtn) {
        browseBtn.addEventListener('click', function() {
            window.location.reload();
        });
    }
} 