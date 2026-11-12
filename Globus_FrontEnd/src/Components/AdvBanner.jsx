import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const AdvBanner = () => {
  const slides = [
    {
      webp: "Images/Banner_FlashSale.webp",
      fallback: "Images/Flash Sale_ Up to 75% Off (1).png",
    },
    {
      webp: "Images/Banner_HomeAppliances.webp",
      fallback: "Images/Home Appliances City Sale.png",
    },
    {
      webp: "Images/Banner_Smartwatch.webp",
      fallback: "Images/11.11 Singles Day Smartwatch Sale.png",
    },
  ];
  const [cur, setCur] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCur((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const prev = () => setCur(cur === 0 ? slides.length - 1 : cur - 1);
  const next = () => setCur(cur === slides.length - 1 ? 0 : cur + 1);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-md aspect-[16/9] lg:aspect-auto lg:h-[320px] xl:h-[400px] 2xl:h-[500px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 h-full w-full"
        style={{ transform: `translateX(-${cur * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 min-w-full">
            <picture>
              <source srcSet={slide.webp} type="image/webp" />
              <img
                src={slide.fallback}
                alt="Advertisement Banner"
                className="w-full h-full object-cover object-center"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding="async"
                width="1280"
                height="720"
              />
            </picture>
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute top-1/2 left-2 sm:left-3 -translate-y-1/2 bg-black/30 text-white p-2 sm:p-3 rounded-full hover:bg-black/50 transition"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-sm sm:text-lg" />
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 bg-black/30 text-white p-2 sm:p-3 rounded-full hover:bg-black/50 transition"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-sm sm:text-lg" />
      </button>

      <div className="absolute bottom-2 sm:bottom-3 w-full flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCur(i)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              cur === i
                ? "bg-white dark:bg-gray-800"
                : "bg-white/50 dark:bg-gray-800/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvBanner;
