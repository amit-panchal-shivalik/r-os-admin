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
  iconBgColor: string;
  valueColor?: string;
}

const DashboardCard = ({ title, value, icon, iconBgColor, valueColor = 'text-primary-black' }: DashboardCardProps) => {
  return (
    <div className="bg-primary-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p 
            className="text-3xl font-bold mb-2 leading-tight" 
            style={{ color: valueColor === 'text-primary-black' ? 'rgb(27, 27, 27)' : valueColor }}
          >
            {value}
          </p>
          <p className="text-sm font-medium text-primary-gray">{title}</p>
        </div>
        <div 
          className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ml-4"
          style={{ backgroundColor: iconBgColor }}
        >
          <div className="text-white">
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
    { title: 'Blocks', value: '6', icon: <IconHome className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#10b981' }, // green
    { title: 'Units', value: '279', icon: <IconHome className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#ec4899' }, // pink
    { title: 'Committee', value: '5', icon: <IconUsersGroup className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#f97316' }, // orange
    { title: 'Tenant', value: '18', icon: <IconUser className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#3b82f6' }, // light blue
    
    // Second Row
    { title: 'Owner', value: '198', icon: <IconUser className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#3b82f6' }, // light blue
    { title: 'Employees', value: '93', icon: <IconUsers className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#ec4899' }, // pink
    { title: 'Complaint', value: '60', icon: <IconMessage className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#f97316' }, // orange
    { title: 'Lost & Found', value: '7', icon: <IconSearch className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#10b981' }, // green
    
    // Third Row
    { title: 'Parkings', value: '782', icon: <IconShoppingBag className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#3b82f6' }, // light blue
    { title: 'Android Users', value: '206', icon: <IconDesktop className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#ec4899' }, // pink
    { title: 'iOS Users', value: '132', icon: <IconDesktop className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#f97316' }, // orange
    
    // Fourth Row - Financials (with teal/cyan text color)
    { title: 'Bills/Maintenance', value: '₹0.00', icon: <IconFile className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#9ca3af', valueColor: '#14b8a6' }, // light gray bg, teal text
    { title: 'Amenity & Event', value: '₹132K+', icon: <IconCalendar className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#9ca3af', valueColor: '#14b8a6' }, // light gray bg, teal text
    { title: 'Penalty', value: '₹0.00', icon: <IconInfoTriangle className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#9ca3af', valueColor: '#14b8a6' }, // light gray bg, teal text
    { title: 'Total Income', value: '₹136K+', icon: <IconTrendingUp className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#9ca3af', valueColor: '#14b8a6' }, // light gray bg, teal text
    { title: 'Total Expense', value: '₹9K+', icon: <IconTrendingUp className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#9ca3af', valueColor: '#14b8a6' }, // light gray bg, teal text
    { title: 'Cash on Hand', value: '₹127K+', icon: <IconCashBanknotes className="w-6 h-6" fill={false} duotone={false} />, iconBgColor: '#9ca3af', valueColor: '#14b8a6' }, // light gray bg, teal text
  ];

  return (
    <div className="p-6 bg-primary-background-color min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-black mb-2">Dashboard</h1>
        <p className="text-base" style={{ color: 'rgb(27, 27, 27)' }}>Welcome to your society management portal</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dashboardData.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            valueColor={item.valueColor}
          />
        ))}
      </div>
    </div>
  );
};