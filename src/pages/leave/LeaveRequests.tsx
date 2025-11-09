import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage } from '@/utils/localstorage';
import { getManagerLeaveRequestsApi, approveLeaveApi, rejectLeaveApi } from '@/apis/leave';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function LeaveRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const storedUser = getFromLocalStorage<Record<string, unknown>>('userInfo');
      const userId = (storedUser && ((storedUser as any)?.user?._id as string)) || '';
  const res = await getManagerLeaveRequestsApi({ id: userId });
      const items = (res?.message || []) as any[];
      setRequests(items);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to load requests';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id?: string; name?: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (id?: string, name?: string) => {
    if (!id) return;
    try {
      setProcessingId(id as string);
      await approveLeaveApi({ request_id: id });
      setRequests((prev) => prev.filter((r) => (r._id ?? r.id) !== id));
      toast({ title: 'Approved', description: `Leave request for ${name || 'employee'} approved` });
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to approve';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (id?: string, name?: string) => {
    if (!id) return;
    setRejectTarget({ id, name });
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const submitReject = async () => {
    if (!rejectTarget?.id) return;
    const id = rejectTarget.id;
    const name = rejectTarget.name;
    try {
      setProcessingId(id as string);
      await rejectLeaveApi({ request_id: id, rejection_reason: rejectionReason });
      setRequests((prev) => prev.filter((r) => (r._id ?? r.id) !== id));
      toast({ title: 'Rejected', description: `Leave request for ${name || 'employee'} rejected`, variant: 'destructive' });
      setRejectDialogOpen(false);
      setRejectTarget(null);
      setRejectionReason('');
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to reject';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Leave Requests</h1>

      <div className="bg-card p-4 rounded-md">
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-muted-foreground">No pending leave requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Dates</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r: any, idx: number) => {
                  const id = r._id ?? r.id ?? idx;
                  const emp = r.employee_id || r.employee || {};
                  // employee name may be absent
                  const name = (emp && (emp.name || emp.fullName)) || r.employee_name || r.applicant_name || 'Unknown';

                  // dates can be snake_case or camelCase
                  const from = r.from_date || r.fromDate || r.from;
                  const to = r.to_date || r.toDate || r.to;
                  const leaveDate = (() => {
                    try {
                      if (from && to) return `${new Date(from).toLocaleDateString()} - ${new Date(to).toLocaleDateString()}`;
                      if (from) return new Date(from).toLocaleDateString();
                      if (r.leaveDate) return new Date(r.leaveDate).toLocaleDateString();
                    } catch (e) {
                      /* ignore */
                    }
                    return r.leave_range || '-';
                  })();

                  const type = (r.leave_type_id && r.leave_type_id.name) || (r.leave_type && r.leave_type.name) || (r.leaveType && r.leaveType.name) || r.type || '-';
                  const days = r.leave_taken ?? r.leaveTaken ?? r.leaveTakenDays ?? r.days ?? '-';
                  const reason = (r.reason || r.reason_text || r.notes || '-').toString().trim() || '-';
                  const status = r.status || r.currentStatus || '-';

                  return (
                    <TableRow key={id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>{leaveDate}</TableCell>
                      <TableCell>{type}</TableCell>
                      <TableCell>{days}</TableCell>
                      <TableCell className="max-w-xs truncate">{reason}</TableCell>
                      <TableCell>{status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleApprove(id, name)} className="text-success">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleReject(id, name)} className="text-destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

          <Dialog open={rejectDialogOpen} onOpenChange={(open) => {
            setRejectDialogOpen(open);
            if (!open) {
              setRejectTarget(null);
              setRejectionReason('');
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Leave Request</DialogTitle>
                <DialogDescription>Provide a reason for rejecting this leave request.</DialogDescription>
              </DialogHeader>

              <div>
                <label className="block text-sm font-medium mb-2">Rejection reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border p-2 text-sm"
                  placeholder="Enter the reason for rejection"
                />
              </div>

              <DialogFooter>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setRejectDialogOpen(false)} disabled={!!processingId}>Cancel</Button>
                  <Button onClick={submitReject} disabled={!!processingId || !rejectionReason.trim()}>
                    {processingId ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </div>
  );
}
