import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/api';

export interface BackendCar {
  id: number;
  name: string;
  price: number;
  type: "sale" | "rental";
  description: string;
  specs: any;
  location: string;
  images: string[];
}

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

export const mapBackendCar = (backendCar: BackendCar): Car => {
  const specs = typeof backendCar.specs === 'string' ? JSON.parse(backendCar.specs) : (backendCar.specs || {});
  const images = typeof backendCar.images === 'string' ? JSON.parse(backendCar.images) : (backendCar.images || []);

  return {
    id: backendCar.id,
    name: backendCar.name,
    brand: specs.brand || 'Unknown',
    year: specs.year || new Date().getFullYear(),
    price: backendCar.price,
    priceLabel: backendCar.type === 'rental' ? `$${backendCar.price}/day` : `$${backendCar.price.toLocaleString()}`,
    type: backendCar.type,
    available: true,
    image: images[0] || 'https://images.unsplash.com/photo-1549317661-bd32c0e5a809',
    mileage: specs.mileage || '0 mi',
    fuel: specs.fuel || 'Gasoline',
    transmission: specs.transmission || 'Automatic',
    seats: specs.seats || 5,
    description: backendCar.description || '',
  };
};

export const useCars = () => {
  return useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const data = await apiFetch('/cars');
      return data.map(mapBackendCar) as Car[];
    },
  });
};
