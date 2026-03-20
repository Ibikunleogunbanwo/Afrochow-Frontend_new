import React from "react";
import Link from "next/link";
import {
  SiFacebook,
  SiX,
  SiInstagram,
  SiTiktok,
} from "@icons-pack/react-simple-icons";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      Icon: SiFacebook,
      link: "https://facebook.com/afrochow",
      label: "Facebook",
      hoverClass: "hover:bg-[#1877F2]"
    },
    {
      Icon: SiX,
      link: "https://twitter.com/afrochow",
      label: "X (Twitter)",
      hoverClass: "hover:bg-black"
    },
    {
      Icon: SiInstagram,
      link: "https://instagram.com/afrochow",
      label: "Instagram",
      hoverClass: "hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737]"
    },
    {
      Icon: SiTiktok,
      link: "https://tiktok.com/@afrochow",
      label: "TikTok",
      hoverClass: "hover:bg-black"
    },
  ];

  return (
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <Logo showTagline={true} lightMode={true} />
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Bringing authentic African flavors to your doorstep.
              </p>

              {/* Social Links - Clean with Brand Colors */}
              <div className="flex space-x-3">
                {socialLinks.map(({ Icon, link, label, hoverClass }) => (
                    <Link
                        key={label}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-white transition-all duration-300 ${hoverClass}`}
                        aria-label={label}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/restaurants" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                    Restaurants
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-sm">
                  <Mail className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <Link
                      href="mailto:support@afrochow.ca"
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    support@afrochow.ca
                  </Link>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <Phone className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <Link
                      href="tel:+11234567890"
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    +1 (123) 456-7890
                  </Link>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    583 Carrington Blvd NW, Calgary, AB T3P 2L8
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-400">
                © {currentYear} Afrochow. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">Terms</Link>
                <Link href="/cookies" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;