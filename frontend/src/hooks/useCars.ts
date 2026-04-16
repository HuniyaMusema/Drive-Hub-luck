import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/services/api';

export interface BackendCar {
  id: string;
  name: string;
  price: number;
  type: "sale" | "rental";
  description: string;
  specs: any;
  location: string;
  image_url?: string;
  images?: string[];
}

export interface Car {
  id: string;
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

  const primaryImage = backendCar.image_url || images[0] || '';

  return {
    id: backendCar.id,
    name: backendCar.name,
    brand: specs.brand || '',
    year: specs.year || new Date().getFullYear(),
    price: Number(backendCar.price),
    priceLabel: backendCar.type === 'rental' ? `${Number(backendCar.price).toLocaleString()} Birr / day` : `${Number(backendCar.price).toLocaleString()} Birr`,
    type: backendCar.type,
    available: true,
    image: primaryImage,
    mileage: specs.mileage || '',
    fuel: specs.fuel || '',
    transmission: specs.transmission || '',
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

export const useCreateCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch('/cars', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiFetch(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/cars/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json(); // { url: '/uploads/...' }
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/cars/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};
