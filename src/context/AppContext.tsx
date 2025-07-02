import { createContext, useState, useContext, type ReactNode } from "react";

// Define the shape of the context state
interface AppContextType {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (isOpen: boolean) => void;
}

// Create the context with a default undefined value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentPath, setCurrentPath] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const value = {
    currentPath,
    setCurrentPath,
    isUploadModalOpen,
    setIsUploadModalOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook for easy access to the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
