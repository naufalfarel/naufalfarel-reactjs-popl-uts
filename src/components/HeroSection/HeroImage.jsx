// src/HeroImage.js
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HeroImage.css"; // Opsional untuk custom styles

const HeroImage = () => {
  const images = [
    "kemenkes.jpg",
    "tabby.png",
    "https://plus.unsplash.com/premium_photo-1681967118118-586c2408d0fc?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
  };

  return (
    <div className="relative mx-auto mt-10 max-w-lg">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="w-full h-64">
            {" "}
            {/* Fixed height */}
            <img
              className="w-full h-full object-cover rounded-2xl border border-gray-100 shadow hover:shadow-xl transition-shadow duration-300"
              src={image}
              alt={`Slide ${index}`}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroImage;
