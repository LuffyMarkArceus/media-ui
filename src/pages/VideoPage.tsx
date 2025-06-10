import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { VideoPlayer } from "../components/VideoPlayer";
import { TopNav } from "../components/topnav";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useVideoPageBreadcrumbs } from "../hooks/useVideoPageBreadCrumbs";
import { Button } from "../components/ui/button"; // Assuming you have a Button component
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DownloadIcon,
} from "lucide-react";

export default function VideoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Hook for navigation

  const path = decodeURIComponent(searchParams.get("path") ?? "");
  const playlistParam = searchParams.get("playlist");

  // --- NEW: LOGIC TO HANDLE PLAYLIST ---

  // Memoize the playlist parsing
  const playlist: string[] = useMemo(() => {
    if (!playlistParam) return [];
    try {
      // Parse the playlist from the URL parameter
      return JSON.parse(decodeURIComponent(playlistParam));
    } catch (e) {
      console.error("Failed to parse playlist:", e);
      return [];
    }
  }, [playlistParam]);

  // Find the index of the current video in the playlist
  const currentIndex = useMemo(
    () => playlist.findIndex((p) => p === path),
    [playlist, path]
  );

  // Determine the paths for the previous and next videos
  const firstVideoPath = playlist.length > 0 ? playlist[0] : null;
  const previousVideoPath =
    currentIndex > 0 ? playlist[currentIndex - 1] : null;
  const nextVideoPath =
    currentIndex !== -1 && currentIndex < playlist.length - 1
      ? playlist[currentIndex + 1]
      : null;
  const lastVideoPath =
    playlist.length > 0 ? playlist[playlist.length - 1] : null;

  // Function to navigate to a different video in the playlist
  const navigateToVideo = (newPath: string | null) => {
    if (newPath) {
      // Navigate to the new video, preserving the playlist in the URL
      navigate(
        `/video?path=${encodeURIComponent(
          newPath
        )}&playlist=${encodeURIComponent(JSON.stringify(playlist))}`
      );
    }
  };

  // This function will be called by the VideoPlayer when the video ends
  const handleVideoEnded = () => {
    if (nextVideoPath) {
      navigateToVideo(nextVideoPath);
    }
  };

  // --- END: PLAYLIST LOGIC ---

  const breadcrumbItems = useVideoPageBreadcrumbs(path);

  if (!path) {
    return <div className="p-4 text-red-500">Invalid video path.</div>;
  }

  const fileName = decodeURIComponent(path.split("/").pop() || path);

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div>
        <TopNav />
      </div>
      <br />
      <Breadcrumbs items={breadcrumbItems} />
      <br />
      <h3 className="text-center font-bold mt-4 text-base mb-4 text-gray-700 dark:text-gray-300 truncate">
        {fileName}
      </h3>

      <VideoPlayer
        src={`/api/media_stream?path=${encodeURIComponent(path)}`}
        subtitlePath={path}
        onEnded={handleVideoEnded} // Pass the end handler to the player
      />

      {/* --- NEW: NAVIGATION BUTTONS --- */}
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(firstVideoPath)}
            disabled={!firstVideoPath || currentIndex === 0} // Disable if no previous video
            className="flex items-center gap-2"
            title={firstVideoPath ?? ""}
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(previousVideoPath)}
            disabled={!previousVideoPath} // Disable if no previous video
            className="flex items-center gap-2"
            title={previousVideoPath ?? ""}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"default"}
            className="flex items-center gap-2"
            title={fileName}
          >
            <a
              href={`/api/media_stream?path=${encodeURIComponent(path)}`}
              download={fileName}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="w-5 h-5" />
              Download
            </a>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(nextVideoPath)}
            disabled={!nextVideoPath} // Disable if no next video
            className="flex items-center gap-2"
            title={nextVideoPath ?? ""}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(lastVideoPath)}
            disabled={!lastVideoPath || currentIndex === playlist.length - 1} // Disable if no next video
            className="flex items-center gap-2"
            title={lastVideoPath ?? ""}
          >
            <ChevronsRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
