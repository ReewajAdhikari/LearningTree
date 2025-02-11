import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

const SearchBar = ({ value, onChange, loading, placeholder = "Search..." }) => {
  return (
    <motion.div
      className="bg-black/5 p-6 mt-14 rounded-xl text-center hover:scale-[1.02] transition-all"
      whileHover={{ y: -2 }}
      transition={springConfig}
    >
      <form className="relative" onSubmit={(e) => e.preventDefault()}>
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
          size={20} 
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)} // This will update the searchTerm
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
          placeholder={placeholder}
        />
        {loading && (
          <motion.div 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Search size={20} className="text-gray-400" />
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default SearchBar;