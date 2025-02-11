import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg 
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 outline-none transition duration-200
                 placeholder:text-gray-400"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;