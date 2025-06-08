import { useSearchParams } from "react-router-dom";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const [searchParams] = useSearchParams();
  const currentPath = searchParams.get("path") || ""; // Default to empty string for root

  const breadcrumbs: BreadcrumbItem[] = [];
  let cumulativePath = "";

  // Add Home breadcrumb
  breadcrumbs.push({ name: "Home", path: "" }); // Root path

  // Split the path by backslash, filter out empty strings (e.g., from leading/trailing backslashes)
  // Use a regex to handle multiple backslashes and ensure correct splitting.
  // Also, replace occurrences of '/' with '\' to ensure consistent splitting,
  // in case the path parameter uses forward slashes.
  const normalizedPath = currentPath.replace(/\//g, "\\");
  const segments = normalizedPath
    .split("\\")
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
