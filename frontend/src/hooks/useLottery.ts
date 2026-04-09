import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/services/api';

export interface Lottery {
  id: string;
  start_number: number;
  end_number: number;
  prize_text: string | null;
  prize_car_id: string | null;
  ticket_price: number | string;
  status: 'active' | 'closed';
  created_at: string;
  prize_car_name?: string;
}

export interface LotteryStats {
  available: number;
  pending: number;
  confirmed: number;
}

export interface LotteryPayment {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  receipt_url: string;
  method: 'CBE' | 'Telebirr';
  status: 'pending' | 'approved' | 'rejected';
  ticket_number: number;
  rejection_reason?: string;
  created_at: string;
}

export interface ProfileHistory {
  rentals: Array<{
    id: string;
    car: string;
    dates: string;
    status: string;
    price: number;
    image?: string;
  }>;
  lotteries: Array<{
    id: string;
    number: number;
    status: string;
    payment_status?: string | null;
    date: string;
    prize: string;
  }>;
}

export const useCurrentLottery = () => {
  return useQuery<{ lottery: Lottery; number_stats: LotteryStats }>({
    queryKey: ['lottery', 'current'],
    queryFn: () => apiFetch('/lottery/current').catch(() => null), // Gracefully handle no lottery
    retry: false,
  });
};

export const useLotteryNumbers = () => {
  return useQuery<any[]>({
    queryKey: ['lottery', 'numbers'],
    queryFn: () => apiFetch('/admin/lottery/numbers'),
  });
};

export const useTakenNumbers = () => {
  return useQuery<number[]>({
    queryKey: ['lottery', 'taken'],
    queryFn: () => apiFetch('/lottery/taken'),
  });
};

export const useParticipateLottery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (numbers: number[]) =>
      apiFetch('/lottery/participate', {
        method: 'POST',
        body: JSON.stringify({ numbers }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lottery', 'taken'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'history'] });
    },
  });
};

export const useSubmitLotteryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { lotteryNumberId: string; receiptUrl: string; method: string }) =>
      apiFetch('/lottery/submit-payment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['lottery', 'payments'] });
    },
  });
};

export const useLotteryPayments = () => {
  return useQuery<LotteryPayment[]>({
    queryKey: ['lottery', 'payments'],
    queryFn: () => apiFetch('/admin/lottery/payments'),
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verify, reason }: { id: string; verify: boolean; reason?: string }) =>
      apiFetch(`/admin/lottery/payments/${id}/${verify ? 'verify' : 'reject'}`, {
        method: 'POST',
        body: !verify ? JSON.stringify({ rejection_reason: reason || 'Rejected by staff' }) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lottery', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['lottery', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['lottery', 'numbers'] });
      queryClient.invalidateQueries({ queryKey: ['lottery', 'taken'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'history'] });
    },
  });
};

export const useProfileHistory = () => {
  return useQuery<ProfileHistory>({
    queryKey: ['profile', 'history'],
    queryFn: () => apiFetch('/auth/profile-history'),
  });
};

export const useRentCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ carId, startDate, endDate }: { carId: string; startDate: string; endDate: string }) =>
      apiFetch(`/cars/${carId}/rent`, {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'history'] });
    },
  });
};

export const useCreateLottery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { start_number: number; end_number: number; prize_text: string; ticket_price: number }) =>
      apiFetch('/admin/lottery', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lottery', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['lottery', 'numbers'] });
    },
  });
};

export const usePickWinner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch('/admin/lottery/pick-winner', { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lottery', 'current'] });
    },
  });
};
