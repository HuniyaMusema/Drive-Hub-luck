import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface SavedCarsContextType {
  savedCarIds: string[];
  toggleSave: (carId: string) => void;
  isSaved: (carId: string) => boolean;
  savedCarsCount: number;
}

const SavedCarsContext = createContext<SavedCarsContextType | undefined>(undefined);

export function SavedCarsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedCarIds, setSavedCarIds] = useState<string[]>([]);

  // Load saved cars from localStorage when user changes
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`gech_saved_cars_${user.id}`);
      if (saved) {
        try {
          setSavedCarIds(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved cars", e);
          setSavedCarIds([]);
        }
      } else {
        setSavedCarIds([]);
      }
    } else {
      setSavedCarIds([]);
    }
  }, [user]);

  // Save to localStorage whenever savedCarIds changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`gech_saved_cars_${user.id}`, JSON.stringify(savedCarIds));
    }
  }, [savedCarIds, user]);

  const toggleSave = (carId: string) => {
    if (!user) return; // Should be handled by UI (prompt sign in)

    setSavedCarIds((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  const isSaved = (carId: string) => savedCarIds.includes(carId);

  return (
    <SavedCarsContext.Provider
      value={{
        savedCarIds,
        toggleSave,
        isSaved,
        savedCarsCount: savedCarIds.length,
      }}
    >
      {children}
    </SavedCarsContext.Provider>
  );
}

export function useSavedCars() {
  const context = useContext(SavedCarsContext);
  if (context === undefined) {
    throw new Error("useSavedCars must be used within a SavedCarsProvider");
  }
  return context;
}
