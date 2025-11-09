'use client';

import { X } from 'lucide-react';
import React from 'react';
import { Drawer } from 'vaul';
import SearchInput from '../CustomInput/SearchInput';
import Searchinput from '@/pages/map/component/Searchinput';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode; // Component to render inside the drawer
  direction?: 'left' | 'right' | 'bottom'; // Direction of the drawer
  handleSearch: (query: string) => void; // Callback to handle search
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({ open, onOpenChange, children, direction = 'left', handleSearch }) => {
  const isSideDrawer = direction === 'left' || direction === 'right';
  const isMobile = useIsMobile();
  if (isMobile && isSideDrawer) {
    direction = 'bottom';
  }
  return (
    <Drawer.Root open={open} direction={direction} >
      <Drawer.Portal>
       
        <Drawer.Content
          className={`bg-gray-100 flex flex-col z-20 overflow-y-auto ${
            isSideDrawer && !isMobile ? 'h-full w-[450px]' : 'h-full w-full'
          } fixed ${direction === 'left' ? 'left-0 top-0' : ''} ${
            direction === 'right' ? 'right-0 top-0' : ''
          } ${direction === 'bottom' ? 'bottom-0 left-0 right-0 w-full' : ''} outline-none`}
        >
          <div className="px-4 absolute right-0  top-1 my-4 mt-auto">
              <div className="flex gap-6 mx-auto">
               <div className='w-[90%]'>
                {/* <Searchinput onSearch={handleSearch}/> */}
               </div>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                 <X color='white'/>
                </button>
              </div>
            </div>
          <div className={` ${isSideDrawer ? 'h-full' : ''}  flex-1`}>
            <div

            />
            <div className="max-w-md mx-auto ">{children}</div>
          </div>  
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CustomDrawer;