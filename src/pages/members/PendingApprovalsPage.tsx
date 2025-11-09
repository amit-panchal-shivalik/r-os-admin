import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getPendingMembers,
    approveMember,
    rejectMember,
    resetMemberState,
} from '@/store/slices/memberSlice';
import { showMessage } from '@/utils/Constant';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, RefreshCw, User, Mail, Phone, Home } from 'lucide-react';

export const PendingApprovalsPage = () => {
    const dispatch = useDispatch();
    const { pendingMembers, status, error }: any = useSelector((state: any) => state.member);

    // Get buildingId from localStorage (Building Admin context)
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (buildingId) {
            dispatch(getPendingMembers(buildingId));
        }
    }, [buildingId, dispatch]);

    useEffect(() => {
        if (status === 'complete' && loading) {
            showMessage('Action completed successfully');
            setLoading(false);
            setRejectDialogOpen(false);
            setRejectionReason('');
            setSelectedMember(null);
            
            // Refresh the list
            if (buildingId) {
                dispatch(getPendingMembers(buildingId));
            }
            dispatch(resetMemberState());
        } else if (status === 'failed' && loading) {
            showMessage(error || 'An error occurred', 'error');
            setLoading(false);
            dispatch(resetMemberState());
        }
    }, [status, loading, error, buildingId, dispatch]);

    const handleApprove = (member: any) => {
        if (window.confirm(`Are you sure you want to approve ${member.firstName} ${member.lastName}?`)) {
            setLoading(true);
            dispatch(approveMember(member._id));
        }
    };

    const handleRejectClick = (member: any) => {
        setSelectedMember(member);
        setRejectDialogOpen(true);
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            showMessage('Please provide a reason for rejection', 'error');
            return;
        }

        setLoading(true);
        dispatch(rejectMember({
            memberId: selectedMember._id,
            reason: rejectionReason,
        }));
    };

    const handleRefresh = () => {
        if (buildingId) {
            dispatch(getPendingMembers(buildingId));
        }
    };

    const getMemberTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            Owner: 'bg-blue-500',
            Tenant: 'bg-green-500',
            'Family Member': 'bg-purple-500',
        };
        return <Badge className={colors[type] || 'bg-gray-500'}>{type}</Badge>;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Pending Approvals</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve new member registration requests
                    </p>
                </div>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {status === 'pending' && !loading ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : pendingMembers.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold">All Caught Up!</h3>
                        <p className="text-muted-foreground">No pending approval requests at the moment.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Member Requests ({pendingMembers.length})</CardTitle>
                        <CardDescription>
                            New residents waiting for approval to access the society portal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member Details</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Unit Details</TableHead>
                                    <TableHead>Member Type</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingMembers.map((member: any) => (
                                    <TableRow key={member._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {member.firstName} {member.lastName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {member.gender || 'Not specified'}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    {member.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    {member.countryCode} {member.phoneNumber}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Home className="w-4 h-4 text-muted-foreground" />
                                                <div className="text-sm">
                                                    <div className="font-medium">
                                                        {member.unitId?.unitNumber || 'N/A'}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {member.blockId?.blockName}, {member.floorId?.floorName}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getMemberTypeBadge(member.memberType)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => handleApprove(member)}
                                                    disabled={loading}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleRejectClick(member)}
                                                    disabled={loading}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Member Registration</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject {selectedMember?.firstName} {selectedMember?.lastName}'s
                            registration? Please provide a reason below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Rejection *</Label>
                            <Input
                                id="reason"
                                placeholder="e.g., Invalid ownership documents, Unit already occupied, etc."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectDialogOpen(false);
                                setRejectionReason('');
                                setSelectedMember(null);
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectSubmit}
                            disabled={loading || !rejectionReason.trim()}
                        >
                            {loading ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
