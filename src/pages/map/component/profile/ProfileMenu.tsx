import React, { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';

const ProfileMenu = ({ userInfo, handleLogout }: { userInfo: any; handleLogout: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    console.log('Attaching click outside listener',userInfo);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {userInfo?.avatar ? (
            <img
              src={userInfo.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-700">
              {(userInfo?.firstName?.[0] || 'U').toUpperCase()}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border py-2">
          <div className="px-4 py-2">
            <div className="text-sm font-medium text-gray-900">
              {userInfo?.firstName || 'User'} {userInfo?.lastName || ''}
            </div>
            <div className="text-xs text-gray-500">
              {(userInfo?.role ) || 'No Role'}
            </div>
          </div>
          <div className="border-t mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2 hover:bg-gray-50"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;