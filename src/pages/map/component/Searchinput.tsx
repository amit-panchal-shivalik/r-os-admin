import { Input } from '@/components/ui/input';
import { setSearchQuery } from '@/store/slices/mapSlice';
import { RootState } from '@/store/store';
import { Search } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  onSearch: (query: string) => void; // Callback to handle search
};

const Searchinput = ({ onSearch }: Props) => {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((s: RootState) => s.map);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery); // Trigger the search callback
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        onKeyPress={handleSearchKeyPress}
        placeholder="Search for places..."
        className="w-full px-4 py-3 pl-10 pr-4 rounded-lg shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => onSearch(searchQuery)}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <Search size={20} />
      </button>
    </div>
  );
};

export default Searchinput;