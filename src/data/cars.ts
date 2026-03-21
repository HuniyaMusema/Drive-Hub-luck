import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
import car4 from "@/assets/car-4.jpg";
import car5 from "@/assets/car-5.jpg";
import car6 from "@/assets/car-6.jpg";

export interface Car {
  id: number;
  name: string;
  brand: string;
  year: number;
  price: number;
  priceLabel: string;
  type: "sale" | "rental";
  available: boolean;
  image: string;
  mileage: string;
  fuel: string;
  transmission: string;
  seats: number;
  description: string;
}

export const carsData: Car[] = [
  {
    id: 1, name: "Horizon LX 450", brand: "Horizon", year: 2025, price: 42800,
    priceLabel: "$42,800", type: "sale", available: true, image: car1,
    mileage: "12,400 mi", fuel: "Hybrid", transmission: "Automatic", seats: 5,
    description: "A refined luxury SUV blending cutting-edge technology with unmatched comfort. Perfect for families and professionals who demand both performance and elegance.",
  },
  {
    id: 2, name: "Prestige Sedan S", brand: "Prestige", year: 2024, price: 85,
    priceLabel: "$85/day", type: "rental", available: true, image: car2,
    mileage: "8,200 mi", fuel: "Gasoline", transmission: "Automatic", seats: 5,
    description: "A sleek executive sedan with a powerful engine and luxurious interior. Ideal for business trips and special occasions.",
  },
  {
    id: 3, name: "Apex GT Coupe", brand: "Apex", year: 2025, price: 67500,
    priceLabel: "$67,500", type: "sale", available: true, image: car3,
    mileage: "3,100 mi", fuel: "Gasoline", transmission: "Manual", seats: 2,
    description: "Raw driving excitement in a stunning package. Track-ready performance with everyday livability.",
  },
  {
    id: 4, name: "Crest Crossover X", brand: "Crest", year: 2024, price: 38200,
    priceLabel: "$38,200", type: "sale", available: false, image: car4,
    mileage: "19,800 mi", fuel: "Gasoline", transmission: "Automatic", seats: 5,
    description: "Compact crossover with surprising cargo space and nimble handling. Great fuel economy for daily commutes.",
  },
  {
    id: 5, name: "Metro City 200", brand: "Metro", year: 2023, price: 45,
    priceLabel: "$45/day", type: "rental", available: true, image: car5,
    mileage: "31,000 mi", fuel: "Electric", transmission: "Automatic", seats: 5,
    description: "Zippy electric hatchback perfect for city driving. Zero emissions, full fun.",
  },
  {
    id: 6, name: "Rugged Trail Pro", brand: "Rugged", year: 2024, price: 120,
    priceLabel: "$120/day", type: "rental", available: true, image: car6,
    mileage: "14,500 mi", fuel: "Diesel", transmission: "Automatic", seats: 3,
    description: "Heavy-duty pickup built for work and adventure. Towing capacity that means business.",
  },
];

export const brands = [...new Set(carsData.map((c) => c.brand))];
