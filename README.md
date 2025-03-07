Unsplash Image Search App Documentation

##Overview

This is a Next.js application that fetches and displays images from the Unsplash API. It supports:

Infinite scrolling to load more images.

Search functionality, triggered only when the Enter key is pressed.

Random images on the initial page load.

User and image details, including likes and photographer information.

##Technologies Used

Next.js (React framework for server-side rendering and static site generation)

TypeScript (for type safety)

React Query (for fetching and caching data efficiently)

Unsplash API (for fetching images)

Tailwind CSS (for styling)

React Icons (for UI icons)

##Features

1. Initial Page Load

Fetches and displays a set of random images from Unsplash.

No user input is required to see the first set of images.

2. Search Functionality

Users can type in the search bar without triggering an API call.

When the user presses Enter, the app searches for the entered query and updates the image list.

If the search bar is empty and Enter is pressed, the app resets to random images.

3. Infinite Scrolling

When the user scrolls down, new images are loaded automatically.

Uses Intersection Observer to detect when the last image is in view and fetch the next page.

4. Image Cards

Each image shows:

A hover effect that darkens the image.

The photographer's profile picture and name.

The number of likes.

API Integration

Fetching Images from Unsplash

The app makes API calls to Unsplash using the fetchImages function:

const fetchImages = async ({ pageParam = 1, query = "" }) => {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  const url = query
    ? `https://api.unsplash.com/search/photos?query=${query}&page=${pageParam}&per_page=9&client_id=${accessKey}`
    : `https://api.unsplash.com/photos?page=${pageParam}&per_page=9&client_id=${accessKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return query ? data.results : data;
};

##Handling API Data

First Load: Fetches random images.

On Search: Fetches images based on the search term.

Pagination: Uses useInfiniteQuery to handle loading more images.

##Key Components

1. Search Bar

The user types a search query.

Pressing Enter updates the displayed images.

const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    setSearchTerm(searchQuery.trim());
    refetch();
  }
};

2. Infinite Scrolling

Uses Intersection Observer to detect when the last image is visible and load more images.

const lastImageRef = useCallback(
  (node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  },
  [isFetchingNextPage, hasNextPage]
);

##How to Run the Project

1. Clone the Repository

git clone https://github.com/your-repo-name.git
cd your-repo-name

2. Install Dependencies

npm install
# or
yarn install

3. Set Up Environment Variables

Create a .env.local file in the root directory and add:

NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_api_key

4. Run the Development Server

npm run dev
# or
yarn dev

Visit https://photobooth-navy.vercel.app/ to see the app in action.
