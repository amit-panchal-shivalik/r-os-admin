// components/shared/GlobalLoader.tsx
const GlobalLoader = ({ active }: { active: boolean }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur flex items-center justify-center">
      <div className="animate-spin h-14 w-14 border-4 border-gray-400 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default GlobalLoader;
