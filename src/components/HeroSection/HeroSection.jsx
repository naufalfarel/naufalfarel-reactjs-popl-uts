import React from "react";
import HeroTitle from "./HeroTitle";
import HeroButton from "./HeroButton";
import HeroImage from "./HeroImage";
import BackgroundPattern from "./BackgroundPattern";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-transparent to-transparent pb-12 pt-20 sm:pb-16 sm:pt-32 lg:pb-24 xl:pb-32 xl:pt-40">
      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Title and Text */}
        <HeroTitle />

        {/* Button */}
        <HeroButton />

        {/* Image */}
        <HeroImage />
      </div>
    </section>
  );
};

export default HeroSection;
