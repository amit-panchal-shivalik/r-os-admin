import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { getBlocks } from '@/store/slices/blockSlice';
import { getFloors } from '@/store/slices/floorSlice';
import { getUnits, createUnit, updateUnitStatus, resetUnit } from '@/store/slices/unitSlice';
import { showMessage } from '@/utils/Constant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Home, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const UnitsPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    
    const { blocks }: any = useSelector((state: any) => state.block);
    const { floors }: any = useSelector((state: any) => state.floor);
    const { units, status, error }: any = useSelector((state: any) => state.unit);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState('');
    const [selectedFloorId, setSelectedFloorId] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<any>(null);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [formData, setFormData] = useState({
        blockId: '',
        floorId: '',
        unitNumber: '',
        unitType: '',
        area: '',
        unitStatus: 'Vacant' as 'Vacant' | 'Occupied' | 'Under Maintenance',
    });

    const buildingId = user?.buildingId;

    useEffect(() => {
        if (buildingId) {
            dispatch(getBlocks({ societyId: buildingId }));
        } else if (user && !buildingId) {
            // If user exists but buildingId is missing, try to get it from localStorage
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    if (parsedUser.buildingId) {
                        dispatch(getBlocks({ societyId: parsedUser.buildingId }));
                    }
                } catch (error) {
                    console.error('Error parsing userInfo:', error);
                }
            }
        }
    }, [dispatch, buildingId, user]);

    useEffect(() => {
        if (selectedBlockId) {
            dispatch(getFloors({ blockId: selectedBlockId }));
            setSelectedFloorId('');
        }
    }, [dispatch, selectedBlockId]);

    useEffect(() => {
        if (selectedBlockId) {
            dispatch(getUnits({ blockId: selectedBlockId }));
        }
    }, [dispatch, selectedBlockId]);

    // Track previous status to only handle transitions
    const prevStatusRef = useRef(status);
    
    useEffect(() => {
        // Only handle success if status transitioned from 'pending' to 'complete'
        if (status === 'complete' && error === null && prevStatusRef.current === 'pending') {
            if (isCreateModalOpen) {
                showMessage('Unit created successfully');
                setIsCreateModalOpen(false);
                resetForm();
                dispatch(getUnits({ blockId: selectedBlockId }));
                dispatch(resetUnit());
            } else if (isEditStatusModalOpen) {
                showMessage('Unit status updated successfully');
                setIsEditStatusModalOpen(false);
                setSelectedUnit(null);
                dispatch(getUnits({ blockId: selectedBlockId }));
                dispatch(resetUnit());
            }
        } else if (status === 'failed' && error) {
            showMessage(error, 'error');
        }
        prevStatusRef.current = status;
    }, [status, error, isCreateModalOpen, isEditStatusModalOpen, selectedBlockId, dispatch]);

    const resetForm = () => {
        setFormData({
            blockId: selectedBlockId,
            floorId: '',
            unitNumber: '',
            unitType: '',
            area: '',
            unitStatus: 'Vacant',
        });
    };

    const handleBlockChange = (blockId: string) => {
        setSelectedBlockId(blockId);
    };

    const handleCreate = () => {
        if (!formData.blockId || !formData.floorId) {
            showMessage('Please select block and floor', 'error');
            return;
        }
        if (!formData.unitNumber.trim() || !formData.unitType.trim() || !formData.area.trim()) {
            showMessage('Please fill all required fields', 'error');
            return;
        }

        dispatch(createUnit(formData));
    };

    const handleOpenCreateModal = () => {
        if (!selectedBlockId) {
            showMessage('Please select a block first', 'error');
            return;
        }
        dispatch(resetUnit()); // Reset status when opening modal
        setFormData({ ...formData, blockId: selectedBlockId, floorId: '' });
        setIsCreateModalOpen(true);
    };

    const handleEditStatus = (unit: any) => {
        setSelectedUnit(unit);
        setIsEditStatusModalOpen(true);
    };

    const handleUpdateStatus = () => {
        if (!selectedUnit) return;
        
        dispatch(updateUnitStatus({
            id: selectedUnit._id,
            unitStatus: selectedUnit.unitStatus
        }));
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            'Vacant': 'bg-green-100 text-green-800',
            'Occupied': 'bg-blue-100 text-blue-800',
            'Under Maintenance': 'bg-orange-100 text-orange-800'
        };
        return variants[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Units</h1>
                        <p className="text-gray-600 mt-2">Manage building units</p>
                    </div>
                    <Button onClick={handleOpenCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Unit
                    </Button>
                </div>

                {/* Block Selector */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Select Block</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedBlockId} onValueChange={handleBlockChange}>
                            <SelectTrigger className="w-full md:w-64">
                                <SelectValue placeholder="Select a block" />
                            </SelectTrigger>
                            <SelectContent>
                                {blocks.map((block: any) => (
                                    <SelectItem key={block._id} value={block._id}>
                                        {block.blockName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {!selectedBlockId && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64">
                            <Home className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-600">Please select a block to view units</p>
                        </CardContent>
                    </Card>
                )}

                {selectedBlockId && status === 'pending' && units.length === 0 && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    </div>
                )}

                {selectedBlockId && status === 'complete' && units.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64">
                            <Home className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No units found for this block</p>
                            <Button onClick={handleOpenCreateModal}>
                                Create Unit
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {selectedBlockId && units.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {units.map((unit: any) => (
                            <Card key={unit._id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Home className="w-5 h-5 text-orange-500" />
                                                <h3 className="font-bold text-lg">{unit.unitNumber}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">{unit.unitType}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditStatus(unit)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Floor:</span>
                                            <span className="font-medium">
                                                {unit.floorId?.floorName || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Area:</span>
                                            <span className="font-medium">{unit.area} sq.ft</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Status:</span>
                                            <Badge className={getStatusBadge(unit.unitStatus)}>
                                                {unit.unitStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Unit Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                    // Only allow closing if not pending, not when select is open, and user explicitly wants to close
                    if (!open && status !== 'pending' && !isSelectOpen) {
                        setIsCreateModalOpen(false);
                        resetForm();
                    }
                }}>
                    <DialogContent 
                        className="max-w-md" 
                        onInteractOutside={(e) => {
                            if (status === 'pending') {
                                e.preventDefault();
                            }
                        }}
                        onEscapeKeyDown={(e) => {
                            if (status === 'pending') {
                                e.preventDefault();
                            }
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Add New Unit</DialogTitle>
                            <DialogDescription>
                                Add a new unit to the selected block and floor.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="createBlockId">Block *</Label>
                                <Select
                                    value={formData.blockId}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, blockId: value, floorId: '' });
                                        dispatch(getFloors({ blockId: value }));
                                    }}
                                    onOpenChange={(open) => setIsSelectOpen(open)}
                                >
                                    <SelectTrigger id="createBlockId">
                                        <SelectValue placeholder="Select block" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {blocks.map((block: any) => (
                                            <SelectItem key={block._id} value={block._id}>
                                                {block.blockName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="floorId">Floor *</Label>
                                <Select
                                    value={formData.floorId}
                                    onValueChange={(value) => setFormData({ ...formData, floorId: value })}
                                    disabled={!formData.blockId}
                                    onOpenChange={(open) => setIsSelectOpen(open)}
                                >
                                    <SelectTrigger id="floorId">
                                        <SelectValue placeholder="Select floor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {floors.map((floor: any) => (
                                            <SelectItem key={floor._id} value={floor._id}>
                                                {floor.floorName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="unitNumber">Unit Number *</Label>
                                <Input
                                    id="unitNumber"
                                    value={formData.unitNumber}
                                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                    placeholder="e.g., 101"
                                />
                            </div>
                            <div>
                                <Label htmlFor="unitType">Unit Type *</Label>
                                <Input
                                    id="unitType"
                                    value={formData.unitType}
                                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                                    placeholder="e.g., 2BHK, 3BHK"
                                />
                            </div>
                            <div>
                                <Label htmlFor="area">Area (sq.ft) *</Label>
                                <Input
                                    id="area"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    placeholder="e.g., 1200"
                                />
                            </div>
                            <div>
                                <Label htmlFor="unitStatus">Status</Label>
                                <Select
                                    value={formData.unitStatus}
                                    onValueChange={(value: any) => setFormData({ ...formData, unitStatus: value })}
                                    onOpenChange={(open) => setIsSelectOpen(open)}
                                >
                                    <SelectTrigger id="unitStatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Vacant">Vacant</SelectItem>
                                        <SelectItem value="Occupied">Occupied</SelectItem>
                                        <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => { 
                                    if (status !== 'pending') {
                                        setIsCreateModalOpen(false); 
                                        resetForm(); 
                                    }
                                }} 
                                disabled={status === 'pending'}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={status === 'pending'}>
                                {status === 'pending' ? 'Creating...' : 'Create Unit'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Unit Status Modal */}
                <Dialog open={isEditStatusModalOpen} onOpenChange={(open) => {
                    if (!open && status !== 'pending') {
                        setIsEditStatusModalOpen(false);
                        setSelectedUnit(null);
                    }
                }}>
                    <DialogContent 
                        onInteractOutside={(e) => {
                            if (status === 'pending') {
                                e.preventDefault();
                            }
                        }}
                        onEscapeKeyDown={(e) => {
                            if (status === 'pending') {
                                e.preventDefault();
                            }
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Update Unit Status</DialogTitle>
                            <DialogDescription>
                                Change the status of the selected unit.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">Unit Number</p>
                                <p className="font-semibold">{selectedUnit?.unitNumber}</p>
                            </div>
                            <div>
                                <Label htmlFor="editUnitStatus">Status *</Label>
                                <Select
                                    value={selectedUnit?.unitStatus}
                                    onValueChange={(value) => setSelectedUnit({ ...selectedUnit, unitStatus: value })}
                                    onOpenChange={(open) => setIsSelectOpen(open)}
                                >
                                    <SelectTrigger id="editUnitStatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Vacant">Vacant</SelectItem>
                                        <SelectItem value="Occupied">Occupied</SelectItem>
                                        <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsEditStatusModalOpen(false); setSelectedUnit(null); }} disabled={status === 'pending'}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateStatus} disabled={status === 'pending'}>
                                {status === 'pending' ? 'Updating...' : 'Update Status'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};