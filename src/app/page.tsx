"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";

interface UnsplashImage {
  id: string;
  urls: { small: string };
  alt_description?: string;
  likes: number;
  user: {
    name: string;
    profile_image: { medium: string };
  };
}

export default function Home() {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  const fetchImages = async (query = "", pageNumber = 1) => {
    if (!hasMore) return;
    setLoading(true);
    try {
      const url = query
        ? `https://api.unsplash.com/search/photos?query=${query}&page=${pageNumber}&per_page=9&client_id=${accessKey}`
        : `https://api.unsplash.com/photos?page=${pageNumber}&per_page=9&client_id=${accessKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (query) {
        setImages((prev) => (pageNumber === 1 ? data.results : [...prev, ...data.results]));
        setHasMore(data.results.length > 0);
      } else {
        setImages((prev) => (pageNumber === 1 ? data : [...prev, ...data]));
        setHasMore(data.length > 0);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages(searchQuery, page);
  }, [page]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setPage(1);
      setImages([]);
      fetchImages(searchQuery, 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const lastImageRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="lg:px-10 px-5">
      <header className="py-6 flex items-center justify-between">
        <p className="text-[30px] font-semibold">
          <span>Photo</span><span>Booth</span>
        </p>
        <FiMenu className="text-2xl cursor-pointer" />
      </header>

      <div className="flex flex-col items-center justify-center my-6 gap-6">
        <h1 className="text-xl lg:text-2xl">Explore Beautiful Images</h1>

        {/* Search Bar */}
        <div className="flex items-center border rounded-3xl h-14 lg:w-[60%] px-4 w-full relative">
          <IoSearchOutline className="text-xl text-gray-500" />
          <input
            type="text"
            className="flex-1 h-full outline-none pl-3 w-full"
            placeholder="Search"
            value={searchQuery}
            onChange={handleInputChange}
          />
          {loading && page === 1 && (
            <div className="absolute right-4">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            ref={index === images.length - 1 ? lastImageRef : null}
            className="relative w-full h-64 group overflow-hidden rounded-lg"
          >
            {/* Image */}
            <Image
              src={image.urls.small}
              alt={image.alt_description || "Unsplash Image"}
              layout="fill"
              objectFit="cover"
              className="transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-60"
            />

            {/* Hover Overlay (Always Visible on Mobile) */}
            <div className="absolute inset-0  bg-opacity-30 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end p-3 cursor-pointer">
              
              {/* Photographer Profile (Bottom Left) */}
              <div className="flex items-center gap-2">
                <Image
                  src={image.user.profile_image.medium}
                  alt={image.user.name}
                  width={30}
                  height={30}
                  className="w-10 h-10 rounded-full border border-white"
                />
                <p className="text-white text-sm">{image.user.name}</p>
              </div>

              {/* Like Icon (Top Right) */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black bg-opacity-50 px-2 py-1 rounded-md text-white">
                <FaHeart color="red" />
                <span className="ml-1 text-sm">{image.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center my-6">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
