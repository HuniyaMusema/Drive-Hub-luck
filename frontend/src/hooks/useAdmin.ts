import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/services/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'lottery_staff';
  status: 'active' | 'suspended';
  suspension_reason: string | null;
  created_at: string;
  mode: string;
}

export interface DashboardStats {
  totalVehicles: number;
  lotteryEntries: number;
  pendingPayments: number;
  registeredUsers: number;
  revenue: number;
}



export const useAdminUsers = () => {
  return useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => apiFetch('/admin/users'),
  });
};

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch('/admin/dashboard-stats'),
  });
};


export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: 'active' | 'suspended'; reason?: string }) =>
      apiFetch(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/users/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};
