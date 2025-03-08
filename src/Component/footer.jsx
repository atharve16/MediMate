import React from "react";
import { MapPin, PhoneCall, ArrowRight } from "lucide-react";
const Footer = () => (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h6 className="text-lg font-semibold">Quick Links</h6>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400">Top Products</a></li>
              <li><a href="#" className="hover:text-blue-400">Managed Website</a></li>
              <li><a href="#" className="hover:text-blue-400">Manage Reputation</a></li>
              <li><a href="#" className="hover:text-blue-400">Power Tools</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h6 className="text-lg font-semibold">Contact Us</h6>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <p>Gupteshwar jabalpur(482001), India</p>
              </div>
              <div className="flex items-center">
                <PhoneCall className="w-5 h-5 mr-2" />
                <p>+91-758XXX4006</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h6 className="text-lg font-semibold">Newsletter</h6>
            <p>Stay updated with our latest news and offers.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your Email"
                className="flex-1 p-2 rounded-l text-black"
              />
              <button className="bg-blue-500 px-4 py-2 rounded-r hover:bg-blue-600 flex items-center">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; 2024 Medimate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
  export default Footer;