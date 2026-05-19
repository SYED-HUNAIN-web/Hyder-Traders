import React from 'react';
import Link from 'next/link';
import Container from '../shared/Container';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-16 pb-8 border-t-[4px] border-[#ff6600]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-white p-2 rounded max-w-fit">
                <img src="/logo.png" alt="Hyder Traders" className="h-8 object-contain" />
              </div>
            </Link>
            <p className="text-sm mt-2 text-gray-400">
              Your trusted partner for premium solar panels, inverters, and accessories in Pakistan. Powering a greener tomorrow.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a href="https://www.facebook.com/profile.php?id=100070319131089" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors" title="Follow us on Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://www.instagram.com/hyder_trader/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors" title="Follow us on Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://wa.me/923001030542" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-colors" title="Chat on WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.096-.201.045-.38-.025-.526-.08-.15-.673-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345zM20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c-.003 2.083.547 4.113 1.587 5.9L0 24l6.398-1.665c1.71.942 3.645 1.439 5.636 1.442h.005c6.582 0 11.943-5.333 11.946-11.896.002-3.176-1.24-6.16-3.465-8.432zM12.045 21.84h-.004c-1.763 0-3.491-.47-5.006-1.358l-.358-.21-3.722.968.995-3.61-.235-.374a9.92 9.92 0 0 1-1.517-5.352c.002-5.485 4.49-9.954 10.003-9.957 2.67.001 5.18 1.036 7.067 2.915a9.88 9.88 0 0 1 2.923 7.054c-.003 5.486-4.489 9.954-10.002 9.954z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/about" className="hover:text-[#ff6600] transition-colors">About Us</Link></li>
              <li><Link href="/shop" className="hover:text-[#ff6600] transition-colors">Shop All Products</Link></li>
              <li><Link href="/categories" className="hover:text-[#ff6600] transition-colors">Categories</Link></li>
              <li><Link href="/brands" className="hover:text-[#ff6600] transition-colors">Top Brands</Link></li>
              <li><Link href="/blog" className="hover:text-[#ff6600] transition-colors">Solar Blog</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Customer Service</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/contact" className="hover:text-[#ff6600] transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-[#ff6600] transition-colors">Shipping Policy</Link></li>
              <li><Link href="/faq" className="hover:text-[#ff6600] transition-colors">FAQ</Link></li>
              <li><Link href="/warranty" className="hover:text-[#ff6600] transition-colors">Warranty Information</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Contact Us</h4>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#ff6600] shrink-0 mt-1" size={18} />
                <span>Shop No. 9, Maskan Complex, Near Shabbir Biryani Hyderabad.</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#ff6600] shrink-0" size={18} />
                <span>+92 300 1030542</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#ff6600] shrink-0" size={18} />
                <span>hydertraders830@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Hyder Traders. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

        <div className="mt-8 pb-2 text-center text-[10px] text-gray-600 font-bold tracking-widest uppercase">
          PRODUCTION OF SYUNIAX STUDIOS (SYED HUNAIN)
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
