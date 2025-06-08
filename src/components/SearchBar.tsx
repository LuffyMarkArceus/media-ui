interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
}: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search videos..."
      className="w-full p-3 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:placeholder-gray-400 transition-colors duration-200"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
