import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#436850] text-white py-6 mt-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Logo and Description */}
          <div>
            <h2 className="text-2xl font-semibold">SphaeroStyle</h2>
            <p className="mt-2 opacity-80">
              Your go-to fashion store for the latest trends in clothing ans shoes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/" className="hover:text-white opacity-80">Home</Link>
              </li>
              <li>
                <Link href="/women/clothing" className="hover:text-white opacity-80">Women</Link>
              </li>
              <li>
                <Link href="/men/clothing" className="hover:text-white opacity-80">Men</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white opacity-80">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white opacity-80">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <p className="mt-2 opacity-80">Email: support@sphaerostyle.com</p>
            <p className="opacity-80">Phone: +855 123 456 789</p>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <p className="mt-2 opacity-80">Stay connected with us on social media:</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:opacity-80">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:opacity-80">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="hover:opacity-80">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:opacity-80">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Short Separator */}
        <div className="flex justify-center mt-6">
          <div className="w-1/4 h-[2px] bg-[#12372A] opacity-50"></div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center opacity-80 text-sm">
          &copy; {new Date().getFullYear()} SplenceStyle. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
