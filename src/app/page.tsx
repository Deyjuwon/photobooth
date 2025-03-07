"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { useInfiniteQuery } from "@tanstack/react-query";

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

const fetchImages = async ({ pageParam = 1, query = "" }) => {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  const url = query
    ? `https://api.unsplash.com/search/photos?query=${query}&page=${pageParam}&per_page=9&client_id=${accessKey}`
    : `https://api.unsplash.com/photos?page=${pageParam}&per_page=9&client_id=${accessKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return query ? data.results : data;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["images", searchQuery],
    queryFn: ({ pageParam }) => fetchImages({ pageParam, query: searchQuery }),
    getNextPageParam: (lastPage, allPages) => (lastPage.length > 0 ? allPages.length + 1 : undefined),
    initialPageParam: 1,
  });

  const handleSearch = () => {
    refetch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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

        <div className="flex items-center border rounded-3xl h-14 lg:w-[60%] px-4 w-full relative mb-5">
          <IoSearchOutline className="text-xl text-gray-500" />
          <input
            type="text"
            className="flex-1 h-full outline-none pl-3 w-full"
            placeholder="Search"
            value={searchQuery}
            onChange={handleInputChange}
          />
         
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data?.pages.map((group, i) =>
          group.map((image: UnsplashImage, index: number) => (
            <div
              key={`${image.id}-${index}`}
              ref={index === group.length - 1 ? lastImageRef : null}
              className="relative w-full h-64 group overflow-hidden rounded-lg"
            >
              <Image
                src={image.urls.small}
                alt={image.alt_description || "Unsplash Image"}
                layout="fill"
                objectFit="cover"
                className="transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-60"
              />
              <div className="absolute inset-0 bg-opacity-30 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end p-3 cursor-pointer">
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
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black bg-opacity-50 px-2 py-1 rounded-md text-white">
                  <FaHeart color="red" />
                  <span className="ml-1 text-sm">{image.likes}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center items-center my-6">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
