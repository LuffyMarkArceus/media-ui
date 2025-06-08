import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { BreadcrumbItem } from "../hooks/useBreadcrumbs"; // Import the interface

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 text-sm text-gray-400 flex items-center flex-wrap">
      {items.map((crumb, index) => (
        <span key={crumb.path} className="flex items-center">
          <a
            href={`/?path=${encodeURIComponent(crumb.path)}`}
            onClick={(e) => {
              e.preventDefault(); // Prevent full page reload
              navigate(`/?path=${encodeURIComponent(crumb.path)}`);
            }}
            className={`hover:underline ${
              index === items.length - 1
                ? "text-white cursor-default"
                : "text-gray-400"
            }`}
          >
            {crumb.name}
          </a>
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
          )}
        </span>
      ))}
    </div>
  );
};
