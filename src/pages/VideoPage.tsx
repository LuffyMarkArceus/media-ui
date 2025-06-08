import { useSearchParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import { TopNav } from "../components/topnav";

// Import the new components/hooks
// import { useBreadcrumbs, type BreadcrumbItem } from "../hooks/useBreadcrumbs"; // No longer need useBreadcrumbs directly here
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useVideoPageBreadcrumbs } from "../hooks/useVideoPageBreadCrumbs"; // NEW import

export default function VideoPage() {
  const [searchParams] = useSearchParams();
  const path = decodeURIComponent(searchParams.get("path") ?? "");

  // Call the new hook here, inside the functional component
  const breadcrumbItems = useVideoPageBreadcrumbs(path); // Pass the full video path
  // This `if (!path)` condition is still outside any hook calls *within this component*,
  // which is allowed because it determines if the component should render at all.
  if (!path) {
    return <div className="p-4 text-red-500">Invalid video path.</div>;
  }

  const fileName = decodeURIComponent(path.split("/").pop() || path); // Adjusted split to backslash for consistency

  return (
    <div className="min-h-screen p-4 bg-white text-black dark:bg-zinc-900 dark:text-white transition-colors duration-300">
      <div>
        <TopNav />
      </div>

      <Breadcrumbs items={breadcrumbItems} />

      <h3 className="text-center font-bold mt-4 text-base mb-4 text-gray-700 dark:text-gray-300 truncate">
        {fileName}
      </h3>

      <VideoPlayer
        src={`/api/media_stream?path=${encodeURIComponent(path)}`}
        title={fileName}
        subtitlePath={path}
      />
    </div>
  );
}
