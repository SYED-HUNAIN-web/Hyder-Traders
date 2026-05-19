export interface Product {
  id: string;
  title: string;
  slug?: string;
  category: string;
  brand: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  comparePrice?: number;
  stockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock';
  stock?: number;
  images: string[];
  cloudinaryPublicIds?: string[];
  highlights: string[];
  features: string[];
  specs: { name: string; value: string }[];
  featured?: boolean;
  bestseller?: boolean;
  rating: number;
  reviewsCount: number;
  createdAt?: any;
  updatedAt?: any;
  shippingCharge?: number;
}

export const dummyProducts: Product[] = [
  {
    id: '1',
    title: 'Inverex Nitrox 6KW Hybrid Solar Inverter',
    price: 385000,
    originalPrice: 410000,
    stockStatus: 'In Stock',
    images: ['/inverter.png'],
    category: 'Solar Inverters',
    brand: 'Inverex',
    shortDescription: 'Latest 6KW Hybrid model with smart monitoring and lithium compatibility.',
    description: 'The Inverex Nitrox 6KW Hybrid Solar Inverter is a premium solution for residential and commercial solar systems. It supports dual MPPT and provides seamless transition between grid and battery power.',
    highlights: [
      'Hybrid Technology',
      'Pure Sine Wave',
      'Lithium Compatible',
      'Smart Monitoring'
    ],
    features: [
      'Pure sine wave output',
      'Built-in MPPT solar charge controller',
      'Parallel operation up to 6 units',
      'Compatible with Lead-acid and Lithium batteries',
    ],
    specs: [
      { name: 'Capacity', value: '6kW' },
      { name: 'Efficiency', value: '97.6%' },
      { name: 'Voltage', value: '48VDC' },
      { name: 'Warranty', value: '5 Years' },
    ],
    rating: 4.9,
    reviewsCount: 45,
    shippingCharge: 1500,
  },
  {
    id: '2',
    title: 'Jinko Tiger Neo N-Type Mono Solar Panel 585W',
    price: 42000,
    stockStatus: 'In Stock',
    images: ['/panel.png'],
    category: 'Solar Panels',
    brand: 'Jinko',
    shortDescription: 'High efficiency Mono-facial N-Type solar panel for maximum power generation.',
    description: 'N-Type technology ensures better performance in high temperatures and low light conditions. The 585W output is perfect for space-constrained roofs.',
    highlights: [
      'N-Type Technology',
      'High Efficiency',
      'Durability',
      '25 Years Warranty'
    ],
    features: [
      'Multi-busbar technology',
      'Better light trapping',
      'Excellent anti-PID performance',
      'Certified to withstand wind and snow loads',
    ],
    specs: [
      { name: 'Power', value: '585W' },
      { name: 'Type', value: 'Monocrystalline' },
      { name: 'Efficiency', value: '22.65%' },
      { name: 'Warranty', value: '25 Years' },
    ],
    rating: 4.8,
    reviewsCount: 120,
    shippingCharge: 1000,
  },
  {
    id: '3',
    title: 'Sunwooda Lithium Battery 48V 100Ah LFP',
    price: 315000,
    originalPrice: 340000,
    stockStatus: 'Low Stock',
    images: ['/battery.jpg'],
    category: 'Lithium Batteries',
    brand: 'Sunwooda',
    shortDescription: 'Deep cycle lithium iron phosphate battery with long cycle life.',
    description: 'Sunwooda 100Ah Lithium battery provides stable power backup for solar systems with over 6000 cycles at 80% DOD.',
    highlights: [
      'LiFePO4 Chemistry',
      '100Ah Capacity',
      'Intelligent BMS',
      'Compact Design'
    ],
    features: [
      'Safe LFP technology',
      'High energy density',
      'Modular design for easy expansion',
      'LCD display for status monitoring',
    ],
    specs: [
      { name: 'Voltage', value: '48V' },
      { name: 'Capacity', value: '100Ah' },
      { name: 'Cycles', value: '6000+' },
      { name: 'Warranty', value: '10 Years' },
    ],
    rating: 4.7,
    reviewsCount: 32,
    shippingCharge: 2000,
  },
  {
    id: '4',
    title: 'Mora AC Circuit Breaker 2P 63A',
    price: 2400,
    stockStatus: 'In Stock',
    images: ['/breaker.webp'],
    category: 'AC/DC Breakers',
    brand: 'Mora',
    shortDescription: 'Reliable AC circuit breaker for home solar distribution box.',
    description: 'Essential safety component for every solar installation to prevent overloads and short circuits.',
    highlights: [
      'Overload Protection',
      'Flame Retardant',
      'Easy Installation',
      'Certified Safety'
    ],
    features: [
      'Standard DIN rail mounting',
      'Clear status indicator',
      'High breaking capacity',
    ],
    specs: [
      { name: 'Current', value: '63A' },
      { name: 'Poles', value: '2P' },
      { name: 'Voltage', value: '400V AC' },
    ],
    rating: 4.6,
    reviewsCount: 88,
    shippingCharge: 150,
  },
  {
    id: '5',
    title: 'Solar Cable Roll 6mm 100 Meters',
    price: 18500,
    stockStatus: 'In Stock',
    images: ['/wire.jpeg'],
    category: 'Solar Wires & Cables',
    brand: 'Coretech',
    shortDescription: 'Tinned copper 6mm solar cable with double insulation for PV systems.',
    description: 'High quality DC solar cable designed to withstand extreme outdoor conditions and UV radiation.',
    highlights: [
      'UV Resistant',
      'Tinned Copper',
      'Double Insulated',
      'Low Resistance'
    ],
    features: [
      'Standard compliance',
      'Heat resistant',
      'Flame retardant',
    ],
    specs: [
      { name: 'Size', value: '6mm' },
      { name: 'Length', value: '100m' },
      { name: 'Material', value: 'Tinned Copper' },
    ],
    rating: 4.5,
    reviewsCount: 56,
    shippingCharge: 400,
  },
  {
    id: '6',
    title: 'MC4 Connectors Pair (Male/Female)',
    price: 450,
    stockStatus: 'In Stock',
    images: ['/accessories.png'],
    category: 'Accessories',
    brand: 'Sunflx',
    shortDescription: 'High quality waterproof MC4 connectors for solar panel connections.',
    description: 'Standard MC4 connectors designed for easy and secure connection of solar panels.',
    highlights: [
      'Waterproof IP67',
      'Easy Installation',
      'Durable Design',
      'Universal Compatibility'
    ],
    features: [
      'Snap-in locking',
      'Corrosion resistant',
      'High current capacity',
    ],
    specs: [
      { name: 'Type', value: 'MC4' },
      { name: 'Rating', value: '30A' },
      { name: 'Protection', value: 'IP67' },
    ],
    rating: 4.4,
    reviewsCount: 150,
    shippingCharge: 0,
  }
];
