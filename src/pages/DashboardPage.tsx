import { useEffect } from 'react';
import IconHome from '../components/Icon/IconHome';
import IconUsersGroup from '../components/Icon/IconUsersGroup';
import IconUser from '../components/Icon/IconUser';
import IconUsers from '../components/Icon/IconUsers';
import IconMessage from '../components/Icon/IconMessage';
import IconSearch from '../components/Icon/IconSearch';
import IconShoppingBag from '../components/Icon/IconShoppingBag';
import IconDesktop from '../components/Icon/IconDesktop';
import IconFile from '../components/Icon/IconFile';
import IconCalendar from '../components/Icon/IconCalendar';
import IconInfoTriangle from '../components/Icon/IconInfoTriangle';
import IconTrendingUp from '../components/Icon/IconTrendingUp';
import IconCashBanknotes from '../components/Icon/IconCashBanknotes';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueColor?: string;
}

const DashboardCard = ({ title, value, icon }: DashboardCardProps) => {
  return (
    <div className="bg-primary-white border border-primary-gray rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p 
            className="text-3xl font-bold mb-2 leading-tight text-primary-black"  
          >
            {value}
          </p>
          <p className="text-sm font-medium text-primary-black/70">{title}</p>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 bg-primary-black">
          <div className="text-primary-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  useEffect(() => {
    document.title = 'Dashboard - Smart Society';
  }, []);

  const dashboardData = [
    // First Row
    { title: 'Blocks', value: '6', icon: <IconHome className="w-6 h-6" fill={false} duotone={false} />,  },
    { title: 'Units', value: '279', icon: <IconHome className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Committee', value: '5', icon: <IconUsersGroup className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Tenant', value: '18', icon: <IconUser className="w-6 h-6" fill={false} duotone={false} />, },
    
    // Second Row
    { title: 'Owner', value: '198', icon: <IconUser className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Employees', value: '93', icon: <IconUsers className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Complaint', value: '60', icon: <IconMessage className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Lost & Found', value: '7', icon: <IconSearch className="w-6 h-6" fill={false} duotone={false} />, },
    
    // Third Row
    { title: 'Parkings', value: '782', icon: <IconShoppingBag className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Android Users', value: '206', icon: <IconDesktop className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'iOS Users', value: '132', icon: <IconDesktop className="w-6 h-6" fill={false} duotone={false} />, },
  ];

  const financialData = [
    // Fourth Row - Financials
    { title: 'Bills/Maintenance', value: '₹0.00', icon: <IconFile className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Amenity & Event', value: '₹132K+', icon: <IconCalendar className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Penalty', value: '₹0.00', icon: <IconInfoTriangle className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Total Income', value: '₹136K+', icon: <IconTrendingUp className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Total Expense', value: '₹9K+', icon: <IconTrendingUp className="w-6 h-6" fill={false} duotone={false} />, },
    { title: 'Cash on Hand', value: '₹127K+', icon: <IconCashBanknotes className="w-6 h-6" fill={false} duotone={false} />, },
  ];

  return (
    <div className=" bg-primary-background-color min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-black mb-2">Dashboard</h1>
        <p className="text-base text-primary-black/50">Welcome to your society management portal</p>
      </div>
      
      {/* First 3 rows - 4 column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {dashboardData.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Fourth row - Financials - 3 column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {financialData.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
};