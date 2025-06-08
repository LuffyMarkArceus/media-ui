import type { BreadcrumbItem } from "./useBreadcrumbs"; // Re-use the interface

export function useVideoPageBreadcrumbs(videoPath: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let cumulativePath = "";

  // Add Home breadcrumb
  breadcrumbs.push({ name: "Home", path: "" });

  // Determine the directory path from the videoPath
  // Example: if videoPath is "Folder\Subfolder\video.mkv", directoryPath becomes "Folder\Subfolder"
  const directoryPath = videoPath.substring(0, videoPath.lastIndexOf("/"));

  // Normalize path and split segments
  const normalizedPath = directoryPath.replace(/\//g, "/");
  const segments = normalizedPath
    .split("/")
    .filter((segment) => segment !== "");

  segments.forEach((segment) => {
    cumulativePath =
      cumulativePath === "" ? segment : `${cumulativePath}\\${segment}`;
    breadcrumbs.push({
      name: segment,
      path: cumulativePath,
    });
  });

  return breadcrumbs;
}
