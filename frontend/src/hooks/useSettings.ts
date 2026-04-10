import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/api";

export interface SystemSettings {
  [key: string]: any;
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading, error } = useQuery<SystemSettings, Error>({
    queryKey: ["settings"],
    queryFn: () => apiFetch("/settings"),
    staleTime: 30000, 
    retry: 1,
  });

  const updateSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      apiFetch(`/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return { settings, isLoading, error, updateSetting };
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => apiFetch("/admin/logs"),
  });
};

export const useBackups = () => {
  return useQuery({
    queryKey: ["backups"],
    queryFn: () => apiFetch("/admin/backups"),
  });
};

export const useCreateBackup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/admin/backups", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    },
  });
};
