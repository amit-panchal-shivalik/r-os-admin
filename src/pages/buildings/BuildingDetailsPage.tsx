import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBuildingById, resetBuilding } from '@/store/slices/buildingSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, ArrowLeft, Users, Home } from 'lucide-react';
import { showMessage } from '@/utils/Constant';

export const BuildingDetailsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { building, status, error }: any = useSelector((state: any) => state.building);

    useEffect(() => {
        if (id) {
            dispatch(getBuildingById(id));
        }
        return () => {
            dispatch(resetBuilding());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (status === 'failed' && error) {
            showMessage(error, 'error');
        }
    }, [status, error]);

    if (status === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'failed' || !building) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/buildings')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Buildings
                    </Button>
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64">
                            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">
                                {error || 'Building not found'}
                            </p>
                            <Button onClick={() => navigate('/buildings')}>
                                Go to Buildings List
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/buildings')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Buildings
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Building Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Building2 className="w-6 h-6" />
                                    {building?.building?.buildingName || building?.buildingName || 'Building Details'}
                                </CardTitle>
                                <p className="text-gray-600 mt-2">
                                    {building?.building?.societyName || building?.societyName || 'Society Name'}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">
                                            {building?.building?.address || building?.address || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {building?.building?.city || building?.city || ''}, {building?.building?.state || building?.state || ''} - {building?.building?.pincode || building?.pincode || ''}
                                        </p>
                                    </div>
                                </div>

                                {(building?.building?.territory || building?.territory) && (
                                    <div>
                                        <p className="text-sm text-gray-500">Territory</p>
                                        <p className="font-medium">{building?.building?.territory || building?.territory}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className={`font-medium inline-block px-2 py-1 rounded ${
                                        (building?.building?.status || building?.status) === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {building?.building?.status || building?.status || 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Building Admin Info */}
                        {(building?.buildingAdmin || building?.building?.buildingAdmin) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Building Admin
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">
                                            {(building?.buildingAdmin || building?.building?.buildingAdmin)?.firstName || ''} {(building?.buildingAdmin || building?.building?.buildingAdmin)?.lastName || ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{(building?.buildingAdmin || building?.building?.buildingAdmin)?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">
                                            {(building?.buildingAdmin || building?.building?.buildingAdmin)?.countryCode || '+91'} {(building?.buildingAdmin || building?.building?.buildingAdmin)?.phoneNumber || 'N/A'}
                                        </p>
                                    </div>
                                    {(building?.buildingAdmin || building?.building?.buildingAdmin)?.status && (
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className={`font-medium inline-block px-2 py-1 rounded ${
                                                (building?.buildingAdmin || building?.building?.buildingAdmin)?.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {(building?.buildingAdmin || building?.building?.buildingAdmin)?.status}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm text-gray-600">Blocks</span>
                                    </div>
                                    <span className="font-bold text-blue-600">
                                        {building?.building?.totalBlocks || building?.totalBlocks || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Home className="w-5 h-5 text-green-600" />
                                        <span className="text-sm text-gray-600">Units</span>
                                    </div>
                                    <span className="font-bold text-green-600">
                                        {building?.building?.totalUnits || building?.totalUnits || 0}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

