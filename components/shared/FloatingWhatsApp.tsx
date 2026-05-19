'use client';

import React from 'react';

const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/923001030542"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-[999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#128C7E] transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="absolute -top-12 right-0 bg-white text-gray-900 text-[10px] font-black px-4 py-2 rounded-xl shadow-xl border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
        Need Help? Chat with us
        <div className="absolute -bottom-1 right-5 w-2 h-2 bg-white border-b border-r border-gray-100 rotate-45"></div>
      </div>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="32" 
        height="32" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.096-.201.045-.38-.025-.526-.08-.15-.673-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345zM20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c-.003 2.083.547 4.113 1.587 5.9L0 24l6.398-1.665c1.71.942 3.645 1.439 5.636 1.442h.005c6.582 0 11.943-5.333 11.946-11.896.002-3.176-1.24-6.16-3.465-8.432zM12.045 21.84h-.004c-1.763 0-3.491-.47-5.006-1.358l-.358-.21-3.722.968.995-3.61-.235-.374a9.92 9.92 0 0 1-1.517-5.352c.002-5.485 4.49-9.954 10.003-9.957 2.67.001 5.18 1.036 7.067 2.915a9.88 9.88 0 0 1 2.923 7.054c-.003 5.486-4.489 9.954-10.002 9.954z"></path>
      </svg>
    </a>
  );
};

export default FloatingWhatsApp;
