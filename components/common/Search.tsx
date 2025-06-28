import { FaSearch } from "react-icons/fa";

type searchBarProps = {
  setSearchVal: (value: string) => void;
  searchVal: string;
};
function Search({ setSearchVal, searchVal }: searchBarProps) {
  return (
    <div>
      <div className="relative w-[200px] max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center  text-gray-500">
          <FaSearch className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchVal}
          placeholder="Search by Name..."
          className="pl-10 pr-4 py-2 w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
          onChange={(e) => setSearchVal(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Search;
