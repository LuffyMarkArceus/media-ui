import { useEffect, useState } from "react";
import axios from "axios";
import { TopNav } from "../components/topnav";
import { VideoCard } from "../components/VideoCard";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import the new components/hooks
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { Breadcrumbs } from "../components/Breadcrumbs";

interface FileItem {
  name: string;
  size: number;
  path: string;
  type: string;
}

export default function Home() {
  const [videos, setVideos] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPath = searchParams.get("path") || "\\";

  // Use the custom hook for breadcrumbs
  const breadcrumbItems = useBreadcrumbs();

  useEffect(() => {
    axios
      .get("/api/media", {
        params: { path: currentPath },
      })
      .then((res) => {
        setVideos(res.data.files || []);
        setFolders(res.data.folders || []);
      });
  }, [currentPath]);

  const goToFolder = (folder: string) => {
    const newPath =
      currentPath === "\\" ? `\\${folder}` : `${currentPath}\\${folder}`;
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

      {/* --- NEW: Breadcrumbs Rendering --- */}
      <Breadcrumbs items={breadcrumbItems} />

      {folders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder}
                onClick={() => goToFolder(folder)}
                className="cursor-pointer p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
              >
                📁 {folder}
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Videos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {videos.map((video) => (
              <div key={video.path} onClick={() => openVideo(video.path)}>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length === 0 && folders.length === 0 && (
        <div className="text-gray-500">No files or folders in this path.</div>
      )}
    </div>
  );
}
