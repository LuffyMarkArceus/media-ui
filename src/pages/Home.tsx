import { useEffect, useState, useMemo } from "react"; // Import useMemo
import axios from "axios";
import { TopNav } from "../components/topnav";
import { VideoCard } from "../components/VideoCard";
import { FolderCard } from "../components/FolderCard";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import the new components/hooks
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { Breadcrumbs } from "../components/Breadcrumbs";
import SearchBar from "../components/SearchBar"; // Make sure the path is correct

// Import icons for sort direction
import { ArrowUp, ArrowDown } from "lucide-react";

interface FileItem {
  name: string;
  size: number;
  path: string;
  type: string;
  created_at: string;
}

type SortKey = "name" | "size" | "created_at";
type SortDirection = "asc" | "desc";

export default function Home() {
  // Renamed to 'allVideos' and 'allFolders' to hold the unfiltered data
  const [allVideos, setAllVideos] = useState<FileItem[]>([]);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPath = searchParams.get("path") || ""; // Default to empty string for root now.
  // This will align better with breadcrumbs logic for root.

  // Use the custom hook for breadcrumbs
  const breadcrumbItems = useBreadcrumbs();

  const [searchTerm, setSearchTerm] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("name"); // Default sort by name
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc"); // Default ascending

  useEffect(() => {
    axios
      .get("/api/media", {
        params: { path: currentPath },
      })
      .then((res) => {
        setAllVideos(res.data.files || []);
        setAllFolders(res.data.folders || []);
        setSearchTerm(""); // Reset search term when navigating to a new folder
      })
      .catch((error) => {
        console.error("Error fetching media:", error);
        // You might want to display an error message to the user here
      });
  }, [currentPath]);

  // Use useMemo for efficient filtering
  const filteredFolders = useMemo(() => {
    if (!searchTerm) {
      return allFolders; // Return all folders if no search term
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allFolders.filter((folder) =>
      folder.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allFolders, searchTerm]); // Recalculate if allFolders or searchTerm changes

  const filteredVideos = useMemo(() => {
    if (!searchTerm) {
      return allVideos; // Return all videos if no search term
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allVideos.filter((video) =>
      video.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allVideos, searchTerm]); // Recalculate if allVideos or searchTerm changes

  // --- Sorting Logic using useMemo ---
  const sortedFolders = useMemo(() => {
    // Folders are always sorted by name
    const sorted = [...filteredFolders].sort((a, b) => {
      return a.localeCompare(b);
    });
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [filteredFolders, sortDirection]); // Sort folders based on current sort direction (but always by name)

  const sortedVideos = useMemo(() => {
    const sorted = [...filteredVideos].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === "size") {
        comparison = a.size - b.size;
      } else if (sortKey === "created_at") {
        // Parse date strings to compare
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        comparison = dateA - dateB;
      }
      return comparison;
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [filteredVideos, sortKey, sortDirection]);
  // --- End Sorting Logic ---

  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      // If same key, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If new key, set key and default to ascending
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey === key) {
      return sortDirection === "asc" ? (
        <ArrowUp className="w-4 h-4 ml-1 text-gray-500" />
      ) : (
        <ArrowDown className="w-4 h-4 ml-1 text-gray-500" />
      );
    }
    return null;
  };

  const goToFolder = (folder: string) => {
    // Ensure correct path concatenation for Windows-style paths
    const newPath = currentPath === "" ? folder : `${currentPath}\\${folder}`;
    navigate(`/?path=${encodeURIComponent(newPath)}`);
  };

  const openVideo = (videoPath: string) => {
    navigate(`/video?path=${encodeURIComponent(videoPath)}`);
  };

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <TopNav />
      </div>
      <div className="flex-grow">
        {" "}
        {/* Allows breadcrumbs to take available space */}
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <div className="flex flex-wrap items-center justify-between mb-4">
        {" "}
        {/* Adjusted for better layout */}
        {/* Breadcrumbs on one side */}
        {/* SearchBar on the other side */}
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
          {" "}
          {/* Responsive width for search bar */}
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />{" "}
          {/* Pass props here */}
        </div>
        {/* --- NEW: Sort Controls (Compact) --- */}
        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-0 sm:mr-4">
            Sort by:
          </span>
          <div className="flex flex-wrap gap-2">
            {" "}
            {/* Button group */}
            <button
              onClick={() => handleSortChange("name")}
              className={`flex items-center px-3 py-1 rounded-full ${
                sortKey === "name"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-200"
              } hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200`}
            >
              Name {renderSortIcon("name")}
            </button>
            <button
              onClick={() => handleSortChange("size")}
              className={`flex items-center px-3 py-1 rounded-full ${
                sortKey === "size"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-200"
              } hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200`}
            >
              Size {renderSortIcon("size")}
            </button>
            <button
              onClick={() => handleSortChange("created_at")}
              className={`flex items-center px-3 py-1 rounded-full ${
                sortKey === "created_at"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-200"
              } hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200`}
            >
              Date {renderSortIcon("created_at")}
            </button>
          </div>
        </div>
      </div>

      {/* Use sortedFolders and sortedVideos for rendering */}
      {sortedFolders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedFolders.map((folder) => (
              <FolderCard
                key={folder}
                folderName={folder}
                onClick={goToFolder}
              />
            ))}
          </div>
        </div>
      )}

      {sortedVideos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedVideos.map((video) => (
              <div key={video.path} onClick={() => openVideo(video.path)}>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm &&
        filteredVideos.length === 0 &&
        filteredFolders.length === 0 && (
          <div className="text-gray-500 mt-4">
            No results found for "{searchTerm}" in this path.
          </div>
        )}
      {!searchTerm && allVideos.length === 0 && allFolders.length === 0 && (
        <div className="text-gray-500 mt-4">
          No files or folders in this path.
        </div>
      )}
    </div>
  );
}
