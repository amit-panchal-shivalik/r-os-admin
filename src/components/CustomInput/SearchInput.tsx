import React from 'react';
import IconSearch from '../Icon/IconSearch';
import { SearchInputProps } from '../../types/CustomInputTypes';

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    onClick,
    className = '',
}) => {
    return (
        <div
            className={`relative w-full ${className}`}
            onClick={onClick}
        >
            <label className="standard-label">Search</label>
            <input
                type="text"
                placeholder={placeholder}
                className="px-4 py-3 pl-10 pr-4 bg-background border text-foreground w-full rounded-lg focus:outline-none focus:ring-1 focus:ring-design-primary"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="absolute left-3 bottom-3 pointer-events-none">
                <IconSearch className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
    );
};

export default SearchInput;