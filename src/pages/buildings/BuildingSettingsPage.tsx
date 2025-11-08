import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Layers, Home, ChevronRight } from 'lucide-react';

export const BuildingSettingsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const menuItems = [
        {
            title: 'Building Details',
            description: 'View and manage building information',
            icon: Building2,
            path: '/building/details',
            color: 'bg-blue-500'
        },
        {
            title: 'Blocks',
            description: 'Manage building blocks',
            icon: Layers,
            path: '/building/blocks',
            color: 'bg-green-500'
        },
        {
            title: 'Floors',
            description: 'Create and manage floors',
            icon: Layers,
            path: '/building/floors',
            color: 'bg-purple-500'
        },
        {
            title: 'Units',
            description: 'Manage building units',
            icon: Home,
            path: '/building/units',
            color: 'bg-orange-500'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Building Settings</h1>
                    <p className="text-gray-600 mt-2">Configure and manage your building</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <Card
                            key={item.path}
                            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-gray-300"
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`${item.color} p-3 rounded-lg`}>
                                            <item.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};