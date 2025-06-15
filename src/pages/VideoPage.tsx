import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { VideoPlayer } from "../components/VideoPlayer";
import { TopNav } from "../components/topnav";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useVideoPageBreadcrumbs } from "../hooks/useVideoPageBreadCrumbs";
import { Button } from "../components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DownloadIcon,
} from "lucide-react";

export default function VideoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const path = decodeURIComponent(searchParams.get("path") ?? "");
  const playlistParam = searchParams.get("playlist");

  const playlist: string[] = useMemo(() => {
    if (!playlistParam) return [];
    try {
      return JSON.parse(decodeURIComponent(playlistParam));
    } catch (e) {
      console.error("Failed to parse playlist:", e);
      return [];
    }
  }, [playlistParam]);

  const currentIndex = useMemo(
    () => playlist.findIndex((p) => p === path),
    [playlist, path]
  );

  const firstVideoPath = playlist.length > 0 ? playlist[0] : null;
  const previousVideoPath =
    currentIndex > 0 ? playlist[currentIndex - 1] : null;
  const nextVideoPath =
    currentIndex !== -1 && currentIndex < playlist.length - 1
      ? playlist[currentIndex + 1]
      : null;
  const lastVideoPath =
    playlist.length > 0 ? playlist[playlist.length - 1] : null;

  const navigateToVideo = (newPath: string | null) => {
    if (newPath) {
      navigate(
        `/video?path=${encodeURIComponent(
          newPath
        )}&playlist=${encodeURIComponent(JSON.stringify(playlist))}`
      );
    }
  };

  const handleVideoEnded = () => {
    if (nextVideoPath) {
      navigateToVideo(nextVideoPath);
    }
  };

  const breadcrumbItems = useVideoPageBreadcrumbs(path);

  if (!path) {
    return <div className="p-4 text-red-500">Invalid video path.</div>;
  }

  const fileName = decodeURIComponent(path.split("/").pop() || path);
  // const subtitlePath = path.replace(/\.[^/.]+$/, ".vtt"); // Use full path with .vtt

  // console.log("SUB PATH for backend: ", fileName);

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
        onEnded={handleVideoEnded}
      />

      <div className="flex justify-between items-center w-full max-w-4xl mx-auto mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(firstVideoPath)}
            disabled={!firstVideoPath || currentIndex === 0}
            className="flex items-center gap-2"
            title={firstVideoPath ?? ""}
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(previousVideoPath)}
            disabled={!previousVideoPath}
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
              href={`/api/media_stream?path=${encodeURIComponent(
                path
              )}&download=true`}
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
            disabled={!nextVideoPath}
            className="flex items-center gap-2"
            title={nextVideoPath ?? ""}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button
            variant={"outline"}
            onClick={() => navigateToVideo(lastVideoPath)}
            disabled={!lastVideoPath || currentIndex === playlist.length - 1}
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
