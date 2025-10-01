import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion"; // Library animasi modern

const sponsorLogos = [
  "/kemenkes.jpg",
  "/sponsor1.png",
  "/rszainalabidin.png",
  "/rspur.png",
  "/bpjs.png",
  "/rsmeuraxa.png",
];

const InfiniteScrollSponsors = () => {
  const [displayedSponsors, setDisplayedSponsors] = useState(
    sponsorLogos.slice(0, 6)
  );
  const [page, setPage] = useState(1);
  const loader = useRef(null);

  const loadMoreSponsors = () => {
    const nextPage = page + 1;
    const newSponsors = sponsorLogos.slice(0, nextPage * 6);
    setDisplayedSponsors(newSponsors);
    setPage(nextPage);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSponsors();
        }
      },
      {
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [loader, page]);

  return (
    <div className="sponsor-list p-4">
      <h2 className="text-center text-3xl font-bold mb-6 text-red-800">
        Mitra Kami
      </h2>
      <div className="overflow-x-auto flex space-x-6 pb-4">
        {" "}
        {/* Wrapper untuk scroll horizontal */}
        {displayedSponsors.map((sponsor, index) => (
          <motion.div
            key={index}
            className="p-3 min-w-[120px] bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            <img
              className="w-48 h-auto object-contain mx-auto"
              src={sponsor}
              alt={`Sponsor ${index + 1}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteScrollSponsors;