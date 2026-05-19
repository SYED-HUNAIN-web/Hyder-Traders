"use client";

import React from "react";
import Container from "../shared/Container";

const TopBar = () => {
  return (
    <div className="bg-[#1a1a1a] text-white py-2 overflow-hidden text-xs md:text-sm font-medium">
      <div className="relative flex items-center h-6 overflow-hidden">
        <div className="absolute whitespace-nowrap animate-marquee">
          <span className="mx-8">
            WORKING DAYS AND HOURS: MON-SUN : 9:00 AM TO 9:00 PM “FRIDAY OFF” | 24-48 HOURS ORDER PROCESSING TIME AND 2-8 DAYS DELIVERY TIME
          </span>
          <span className="mx-8">
            WORKING DAYS AND HOURS: MON-SUN : 9:00 AM TO 9:00 PM “FRIDAY OFF” | 24-48 HOURS ORDER PROCESSING TIME AND 2-8 DAYS DELIVERY TIME
          </span>
          
        </div>
      </div>
    </div>
  );
};

export default TopBar;
