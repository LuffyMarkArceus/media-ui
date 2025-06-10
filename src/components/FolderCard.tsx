// src/components/FolderCard.tsx
import React from "react";
import { Folder } from "lucide-react"; // Import Folder icon if you want a visual

interface FolderCardProps {
  folderName: string;
  onClick: (folder: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folderName,
  onClick,
}) => {
  return (
    <div
      key={folderName} // Key is often handled by the parent when mapping, but can be here too
      onClick={() => onClick(folderName)}
      className="
        cursor-pointer
        p-4
        rounded-lg
        flex items-center space-x-2

        bg-slate-200
        hover:bg-neutral-300
        dark:bg-zinc-800
        dark:hover:bg-zinc-700
        
        transition-colors duration-200
      "
      title={folderName}
    >
      <Folder className="w-7 h-7" fill="orange" color="orange" />{" "}
      {/* Example: Folder icon */}
      <span className="truncate">{folderName}</span>
    </div>
  );
};
