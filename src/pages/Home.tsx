import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { ArrowUp, ArrowDown } from "lucide-react";
import { TopNav } from "../components/topnav";
import { VideoCard } from "../components/VideoCard";
import { FolderCard } from "../components/FolderCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { Breadcrumbs } from "../components/Breadcrumbs";
import SearchBar from "../components/SearchBar";
import { Button } from "../components/ui/button";

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
  const [allVideos, setAllVideos] = useState<FileItem[]>([]);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPath = searchParams.get("path") || "";
  const breadcrumbItems = useBreadcrumbs();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const refreshFiles = async () => {
    try {
      const response = await axios.get("/api/media", {
        params: { path: currentPath },
      });
      setAllVideos(response.data.files || []);
      setAllFolders(response.data.folders || []);

      console.log(response);
    } catch (error) {
      console.error("Error refreshing media:", error);
    }
  };

  useEffect(() => {
    refreshFiles();
  }, [currentPath]);

  const filteredFolders = useMemo(() => {
    if (!searchTerm) return allFolders;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allFolders.filter((folder) =>
      folder.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allFolders, searchTerm]);

  const filteredVideos = useMemo(() => {
    if (!searchTerm) return allVideos;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allVideos.filter((video) =>
      video.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allVideos, searchTerm]);

  const sortedFolders = useMemo(() => {
    const sorted = [...filteredFolders].sort((a, b) => a.localeCompare(b));
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [filteredFolders, sortDirection]);

  const sortedVideos = useMemo(() => {
    const sorted = [...filteredVideos].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === "size") {
        comparison = a.size - b.size;
      } else if (sortKey === "created_at") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        comparison = dateA - dateB;
      }
      return comparison;
    });
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [filteredVideos, sortKey, sortDirection]);

  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
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
    const newPath = currentPath ? `${currentPath}/${folder}` : folder;
    navigate(`/?path=${encodeURIComponent(newPath)}`);
  };

  const openVideo = (videoPath: string) => {
    const videoPaths = sortedVideos.map((v) => v.path);
    const playlistParam = encodeURIComponent(JSON.stringify(videoPaths));
    navigate(
      `/video?path=${encodeURIComponent(videoPath)}&playlist=${playlistParam}`
    );
  };

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <TopNav />
      </div>
      <div className="flex-grow">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center text-sm">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleSortChange("name")}
              size={"sm"}
              title="Sort by Name"
              className={`flex items-center px-3 py-1 rounded-full ${
                sortKey === "name"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-200"
              } hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200`}
            >
              Name {renderSortIcon("name")}
            </Button>
            <Button
              onClick={() => handleSortChange("size")}
              size={"sm"}
              title="Sort by Size of the Files, for folders fallbacks to Name Sort"
              className={`flex items-center px-3 py-1 rounded-full ${
                sortKey === "size"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-200"
              } hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200`}
            >
              Size {renderSortIcon("size")}
            </Button>
            <Button
              onClick={() => handleSortChange("created_at")}
              size={"sm"}
              title="Sort by Size of the Date, for folders fallbacks to Name Sort"
              className={`flex items-center px-3 py-1 rounded-full ${
                sortKey === "created_at"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-200"
              } hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200`}
            >
              Date {renderSortIcon("created_at")}
            </Button>
          </div>
        </div>
      </div>

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
                <VideoCard video={video} refreshFiles={refreshFiles} />
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm &&
        filteredVideos.length === 0 &&
        filteredFolders.length === 0 && (
          <div className="text-gray-500 mt-4">
            No results found for "{searchTerm}" here.
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
