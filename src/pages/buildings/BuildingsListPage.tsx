import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBuildings } from '@/store/slices/buildingSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, MapPin } from 'lucide-react';

export const BuildingsListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { buildings, status }: any = useSelector((state: any) => state.building);

    useEffect(() => {
        dispatch(getAllBuildings({ page: 1, limit: 100 }));
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Buildings</h1>
                    <Button onClick={() => navigate('/buildings/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Building
                    </Button>
                </div>

                {status === 'pending' && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    </div>
                )}

                {status === 'complete' && buildings.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64">
                            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No buildings found</p>
                            <Button onClick={() => navigate('/buildings/create')}>
                                Create Your First Building
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {status === 'complete' && buildings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {buildings.map((building: any) => (
                            <Card key={building._id} className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/buildings/${building._id}`)}>
                                <CardHeader>
                                    <CardTitle className="text-xl">{building.buildingName}</CardTitle>
                                    <p className="text-sm text-gray-600">{building.societyName}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                            <div>
                                                <p>{building.address}</p>
                                                <p>{building.city}, {building.state} - {building.pincode}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <div>
                                                <p className="text-xs text-gray-500">Blocks</p>
                                                <p className="font-semibold">{building.totalBlocks || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Units</p>
                                                <p className="font-semibold">{building.totalUnits || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};