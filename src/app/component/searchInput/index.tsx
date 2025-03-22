import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchInput = () => {
  return (
    <form className="h-20 flex justify-center items-center w-full px-4 md:px-8">
      <div className="flex flex-row gap-2 md:gap-4 w-full max-w-2xl">
        <div className="relative flex-1">
          <Input
            placeholder="Search for music"
            className="pr-10 h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-none transition-all"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <Button className="bg-[#ff0000] hover:bg-red-700 text-white font-medium h-11 px-6 rounded-lg shadow-sm transition-colors">
          Search
        </Button>
      </div>
    </form>
  );
};
