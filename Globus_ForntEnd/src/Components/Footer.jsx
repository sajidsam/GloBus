import React from "react";
import ContactUs from "./ContactUs";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-8">
        <div>
          <h3 className="font-bold mb-4">Get to Know Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:underline">About GloBus</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Press Releases</a></li>
            <li><a href="#" className="hover:underline">Investor Relations</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Connect with Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:underline">Facebook</a></li>
            <li><a href="#" className="hover:underline">Twitter</a></li>
            <li><a href="#" className="hover:underline">Instagram</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Make Money with Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:underline">Sell on GloBus</a></li>
            <li><a href="#" className="hover:underline">Affiliate Program</a></li>
            <li><a href="#" className="hover:underline">Advertise Your Products</a></li>
            <li><a href="#" className="hover:underline">Fulfilment Services</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Let Us Help You</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:underline">Your Account</a></li>
            <li><a href="#" className="hover:underline">Returns Centre</a></li>
            <li><a href="#" className="hover:underline">Purchase Protection</a></li>
            <li><a href="#" className="hover:underline">Help</a></li>
          </ul>
        </div>

        <div className="col-span-2 sm:col-span-2">
          <h3 className="font-bold mb-4">Download Our App</h3>
          <div className="flex space-x-2 mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_(iOS).svg"
              alt="App Store"
              className="h-10 cursor-pointer"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
              className="h-10 cursor-pointer"
            />
          </div>

          <div>
            <h4 className="font-bold mb-3">Pay With</h4>
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Visa */}
              <div className="bg-white p-1.5 rounded flex items-center justify-center w-12 h-8">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                  alt="Visa" 
                  className="h-3 object-contain"
                />
              </div>
              
              {/* Mastercard */}
              <div className="bg-white p-1.5 rounded flex items-center justify-center w-12 h-8">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" 
                  alt="Mastercard" 
                  className="h-3 object-contain"
                />
              </div>
              
              {/* American Express */}
              <div className="bg-white p-1.5 rounded flex items-center justify-center w-12 h-8">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" 
                  alt="American Express" 
                  className="h-3 object-contain"
                />
              </div>
              
              {/* PayPal */}
              <div className="bg-white p-1.5 rounded flex items-center justify-center w-12 h-8">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
                  alt="PayPal" 
                  className="h-3 object-contain"
                />
              </div>
              
              
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 py-6 text-gray-400 text-sm text-center">
        &copy; {new Date().getFullYear()} GloBus. All rights reserved.
        <div className="mt-2">
          <select className="bg-gray-700 text-white text-sm p-1 rounded">
            <option value="us">United States</option>
            <option value="bd">Bangladesh</option>
            <option value="uk">United Kingdom</option>
          </select>
        </div>
      </div>

      <ContactUs></ContactUs>
      
    </footer>
  );
};

export default Footer;