import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const AdvBanner = () => {
  const slides = ["Images/FlashSale.png", "Images/Electronics.png", "Images/HomeAppliance.png"];
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
      className="relative w-full max-w-[1200px] h-[600px] overflow-hidden mx-5 rounded-md my-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${cur * 100}%)` }}>
        {slides.map((src, i) => (
          <div key={i} className="w-full flex-shrink-0">
            <img
              src={src}
              alt="Advertisement Banner"
              className="w-full h-[750px] object-cover object-center rounded-md"
            />
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition"
      >
        <FontAwesomeIcon icon={faChevronLeft} size="lg" />
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition"
      >
        <FontAwesomeIcon icon={faChevronRight} size="lg" />
      </button>

      <div className="absolute bottom-3 w-full flex justify-center gap-2 ">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCur(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              cur === i ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvBanner;
