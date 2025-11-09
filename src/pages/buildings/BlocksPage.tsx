import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { getBlocks, createBlock, updateBlock, deleteBlock, resetBlock } from '@/store/slices/blockSlice';
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
import { Plus, Edit, Trash2, Layers } from 'lucide-react';

export const BlocksPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    
    const { blocks, status, error }: any = useSelector((state: any) => state.block);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBlock, setSelectedBlock] = useState<any>(null);
    const [formData, setFormData] = useState({
        blockName: '',
        status: 'active'
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

    // Track previous status to only handle transitions
    const prevStatusRef = useRef(status);
    
    useEffect(() => {
        // Only handle success if status transitioned from 'pending' to 'complete'
        if (status === 'complete' && error === null && prevStatusRef.current === 'pending') {
            if (isCreateModalOpen || isEditModalOpen) {
                showMessage(isCreateModalOpen ? 'Block created successfully' : 'Block updated successfully');
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
                dispatch(getBlocks({ societyId: buildingId }));
                dispatch(resetBlock());
            }
        } else if (status === 'failed' && error) {
            showMessage(error, 'error');
        }
        prevStatusRef.current = status;
    }, [status, error, isCreateModalOpen, isEditModalOpen, buildingId, dispatch]);

    const resetForm = () => {
        setFormData({
            blockName: '',
            status: 'active'
        });
        setSelectedBlock(null);
    };

    const handleCreate = () => {
        if (!formData.blockName.trim()) {
            showMessage('Block name is required', 'error');
            return;
        }

        dispatch(createBlock({
            blockName: formData.blockName,
            buildingId: buildingId
        }));
    };

    const handleEdit = (block: any) => {
        setSelectedBlock(block);
        setFormData({
            blockName: block.blockName,
            status: block.status
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = () => {
        if (!formData.blockName.trim()) {
            showMessage('Block name is required', 'error');
            return;
        }

        dispatch(updateBlock({
            id: selectedBlock._id,
            blockName: formData.blockName,
            status: formData.status
        }));
    };

    const handleDelete = (block: any) => {
        if (window.confirm(`Are you sure you want to delete block "${block.blockName}"?`)) {
            dispatch(deleteBlock({ id: block._id }));
            setTimeout(() => {
                dispatch(getBlocks({ societyId: buildingId }));
            }, 500);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blocks</h1>
                        <p className="text-gray-600 mt-2">Manage building blocks</p>
                    </div>
                    <Button onClick={() => {
                        dispatch(resetBlock()); // Reset status when opening modal
                        setIsCreateModalOpen(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Block
                    </Button>
                </div>

                {status === 'pending' && blocks.length === 0 && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    </div>
                )}

                {status === 'complete' && blocks.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64">
                            <Layers className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No blocks found</p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Create Your First Block
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {blocks.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blocks.map((block: any) => (
                            <Card key={block._id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{block.blockName}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Status: <span className={block.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
                                                    {block.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(block)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(block)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Block Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                    if (!open && status !== 'pending') {
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
                            <DialogTitle>Add New Block</DialogTitle>
                            <DialogDescription>
                                Create a new block for your building.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="blockName">Block Name *</Label>
                                <Input
                                    id="blockName"
                                    value={formData.blockName}
                                    onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                                    placeholder="e.g., Block A"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && formData.blockName.trim()) {
                                            handleCreate();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); resetForm(); }} disabled={status === 'pending'}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={status === 'pending'}>
                                {status === 'pending' ? 'Creating...' : 'Create Block'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Block Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={(open) => {
                    if (!open && status !== 'pending') {
                        setIsEditModalOpen(false);
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
                            <DialogTitle>Edit Block</DialogTitle>
                            <DialogDescription>
                                Update the block name and status.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="editBlockName">Block Name *</Label>
                                <Input
                                    id="editBlockName"
                                    value={formData.blockName}
                                    onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                                    placeholder="e.g., Block A"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editStatus">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger id="editStatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); resetForm(); }} disabled={status === 'pending'}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} disabled={status === 'pending'}>
                                {status === 'pending' ? 'Updating...' : 'Update Block'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};