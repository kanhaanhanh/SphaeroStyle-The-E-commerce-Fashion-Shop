import Image from "next/image";
import Link from "next/link";
import HeroImage from "../assets/article.jpg";

const HeroSection = () => {
  return (
    <section
      className="relative w-full h-[400px] bg-no-repeat bg-top"
      style={{
        backgroundImage: `url(${HeroImage.src})`,
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          Welcome to SphaeroStyle
        </h1>
        <p className="text-lg md:text-2xl mb-6 opacity-80">
          Your go-to fashion store for the latest trends in clothing and shoes.
        </p>
        <Link
          href="/shop"
          className="px-8 py-3 bg-[#436850] text-white text-lg font-semibold rounded-full hover:bg-[#12372A] transition duration-300"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
