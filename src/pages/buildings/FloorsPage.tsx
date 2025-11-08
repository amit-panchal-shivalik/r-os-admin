import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { getBlocks } from '@/store/slices/blockSlice';
import { getFloors, createFloors, resetFloor } from '@/store/slices/floorSlice';
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
import { Plus, Layers } from 'lucide-react';

export const FloorsPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    
    const { blocks }: any = useSelector((state: any) => state.block);
    const { floors, status, error }: any = useSelector((state: any) => state.floor);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [formData, setFormData] = useState({
        blockId: '',
        floorNamePrefix: '',
        startFloorNumber: 0,
        endFloorNumber: 0,
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
        }
    }, [dispatch, selectedBlockId]);

    // Track previous status to only handle transitions
    const prevStatusRef = useRef(status);
    
    useEffect(() => {
        // Only handle success if status transitioned from 'pending' to 'complete'
        if (status === 'complete' && error === null && prevStatusRef.current === 'pending' && isCreateModalOpen) {
            showMessage('Floors created successfully');
            setIsCreateModalOpen(false);
            resetForm();
            if (selectedBlockId) {
                dispatch(getFloors({ blockId: selectedBlockId }));
            }
            dispatch(resetFloor());
        } else if (status === 'failed' && error) {
            showMessage(error, 'error');
        }
        prevStatusRef.current = status;
    }, [status, error, isCreateModalOpen, selectedBlockId, dispatch]);

    const resetForm = () => {
        setFormData({
            blockId: '',
            floorNamePrefix: '',
            startFloorNumber: 0,
            endFloorNumber: 0,
        });
    };

    const handleBlockChange = (blockId: string) => {
        setSelectedBlockId(blockId);
    };

    const handleCreate = () => {
        if (!formData.blockId) {
            showMessage('Please select a block', 'error');
            return;
        }
        if (!formData.floorNamePrefix.trim()) {
            showMessage('Floor name prefix is required', 'error');
            return;
        }
        if (formData.startFloorNumber > formData.endFloorNumber) {
            showMessage('Start floor number must be less than or equal to end floor number', 'error');
            return;
        }

        dispatch(createFloors(formData));
    };

    const handleOpenCreateModal = () => {
        if (!selectedBlockId) {
            showMessage('Please select a block first', 'error');
            return;
        }
        dispatch(resetFloor()); // Reset status when opening modal
        setFormData({ ...formData, blockId: selectedBlockId });
        setIsCreateModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Floors</h1>
                        <p className="text-gray-600 mt-2">Create and manage floors</p>
                    </div>
                    <Button onClick={handleOpenCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Floors
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
                            <Layers className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-600">Please select a block to view floors</p>
                        </CardContent>
                    </Card>
                )}

                {selectedBlockId && status === 'pending' && floors.length === 0 && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    </div>
                )}

                {selectedBlockId && status === 'complete' && floors.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64">
                            <Layers className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No floors found for this block</p>
                            <Button onClick={handleOpenCreateModal}>
                                Create Floors
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {selectedBlockId && floors.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {floors.map((floor: any) => (
                            <Card key={floor._id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 text-center">
                                    <Layers className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                                    <p className="font-semibold text-gray-900">{floor.floorName}</p>
                                    <p className="text-xs text-gray-500 mt-1">{floor.status}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Floors Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                    // Only allow closing if not pending, not when select is open, and user explicitly wants to close
                    if (!open && status !== 'pending' && !isSelectOpen) {
                        setIsCreateModalOpen(false);
                        resetForm();
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
                            <DialogTitle>Add Multiple Floors</DialogTitle>
                            <DialogDescription>
                                Create multiple floors at once by specifying a range.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="blockId">Block *</Label>
                                <Select
                                    value={formData.blockId}
                                    onValueChange={(value) => setFormData({ ...formData, blockId: value })}
                                    onOpenChange={(open) => setIsSelectOpen(open)}
                                >
                                    <SelectTrigger id="blockId">
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
                                <Label htmlFor="floorNamePrefix">Floor Name Prefix *</Label>
                                <Input
                                    id="floorNamePrefix"
                                    value={formData.floorNamePrefix}
                                    onChange={(e) => setFormData({ ...formData, floorNamePrefix: e.target.value })}
                                    placeholder="e.g., Floor "
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Example: "Floor " will create "Floor 1", "Floor 2", etc.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startFloorNumber">Start Floor Number *</Label>
                                    <Input
                                        id="startFloorNumber"
                                        type="number"
                                        value={formData.startFloorNumber}
                                        onChange={(e) => setFormData({ ...formData, startFloorNumber: parseInt(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endFloorNumber">End Floor Number *</Label>
                                    <Input
                                        id="endFloorNumber"
                                        type="number"
                                        value={formData.endFloorNumber}
                                        onChange={(e) => setFormData({ ...formData, endFloorNumber: parseInt(e.target.value) })}
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    This will create {formData.endFloorNumber - formData.startFloorNumber + 1} floors
                                    {formData.floorNamePrefix && ` from "${formData.floorNamePrefix}${formData.startFloorNumber}" to "${formData.floorNamePrefix}${formData.endFloorNumber}"`}
                                </p>
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
                                {status === 'pending' ? 'Creating...' : 'Create Floors'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};