import { useEffect, useState, useMemo } from "react"; // Import useMemo
import axios from "axios";
import { TopNav } from "../components/topnav";
import { VideoCard } from "../components/VideoCard";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import the new components/hooks
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { Breadcrumbs } from "../components/Breadcrumbs";
import SearchBar from "../components/SearchBar"; // Make sure the path is correct

import { FolderIcon } from "lucide-react";

interface FileItem {
  name: string;
  size: number;
  path: string;
  type: string;
}

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

      <div className="flex flex-wrap items-center justify-between mb-4">
        {" "}
        {/* Adjusted for better layout */}
        {/* Breadcrumbs on one side */}
        <div className="flex-grow">
          {" "}
          {/* Allows breadcrumbs to take available space */}
          <Breadcrumbs items={breadcrumbItems} />
        </div>
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
      </div>

      {/* Conditionally render folders only if there are filtered folders */}
      {filteredFolders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFolders.map((folder) => (
              <div
                key={folder}
                onClick={() => goToFolder(folder)}
                className="cursor-pointer p-4 bg-neutral-200 rounded-lg hover:bg-neutral-400 dark:bg-zinc-800 dark:hover:bg-zinc-500 transition"
              >
                📁 {folder}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditionally render videos only if there are filtered videos */}
      {filteredVideos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Videos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.path} onClick={() => openVideo(video.path)}>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display no results message if both filtered lists are empty AND there's a search term */}
      {searchTerm &&
        filteredVideos.length === 0 &&
        filteredFolders.length === 0 && (
          <div className="text-gray-500 mt-4">
            No results found for "{searchTerm}" in this path.
          </div>
        )}
      {/* Display initial empty message if no search term and nothing fetched */}
      {!searchTerm && allVideos.length === 0 && allFolders.length === 0 && (
        <div className="text-gray-500 mt-4">
          No files or folders in this path.
        </div>
      )}
    </div>
  );
}
