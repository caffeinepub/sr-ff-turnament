import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  Loader2,
  ReceiptText,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { PaymentRequest } from "../../hooks/useQueries";
import {
  useAllPaymentRequests,
  useUpdatePaymentRequestStatus,
} from "../../hooks/useQueries";

function formatDate(timestamp: number) {
  const ms = timestamp;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: PaymentRequest["status"] }) {
  if ("pending" in status) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
        <Clock className="w-3 h-3" /> Pending
      </Badge>
    );
  }
  if ("accepted" in status) {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
        <CheckCircle className="w-3 h-3" /> Accepted
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
      <XCircle className="w-3 h-3" /> Rejected
    </Badge>
  );
}

function PaymentCard({
  req,
  onAccept,
  onReject,
  isPending,
  index,
}: {
  req: PaymentRequest;
  onAccept: () => void;
  onReject: () => void;
  isPending: boolean;
  index: number;
}) {
  const isDeposit = "deposit" in req.requestType;
  const isPendingStatus = "pending" in req.status;

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 space-y-3"
      data-ocid={`payments.${isDeposit ? "deposit" : "withdraw"}.item.${index}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{req.username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(req.timestamp)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-foreground">
            ₹{Number(req.amount)}
          </p>
          <StatusBadge status={req.status} />
        </div>
      </div>

      {req.note && (
        <div className="bg-background rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground">UTR / Transaction ID</p>
          <p className="text-sm font-mono text-foreground mt-0.5">{req.note}</p>
        </div>
      )}

      {!isDeposit && req.upiId && (
        <div className="bg-background rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground">UPI ID (send to)</p>
          <p className="text-sm font-mono text-foreground mt-0.5">
            {req.upiId}
          </p>
        </div>
      )}

      {isPendingStatus && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={onAccept}
            disabled={isPending}
            data-ocid={`payments.${isDeposit ? "deposit" : "withdraw"}.confirm_button.${index}`}
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <CheckCircle className="w-3 h-3 mr-1" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={onReject}
            disabled={isPending}
            data-ocid={`payments.${isDeposit ? "deposit" : "withdraw"}.delete_button.${index}`}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

function RequestList({
  requests,
  type,
}: {
  requests: PaymentRequest[];
  type: "deposit" | "withdraw";
}) {
  const { mutate: updateStatus, isPending } = useUpdatePaymentRequestStatus();

  const filtered = requests.filter((r) =>
    type === "deposit"
      ? "deposit" in r.requestType
      : "withdraw" in r.requestType,
  );

  if (filtered.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid={`payments.${type}.empty_state`}
      >
        <ReceiptText className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">No {type} requests yet</p>
      </div>
    );
  }

  const handleAccept = (id: number) => {
    updateStatus(
      { requestId: id, status: { accepted: null } },
      {
        onSuccess: () => toast.success("Request accepted!"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const handleReject = (id: number) => {
    updateStatus(
      { requestId: id, status: { rejected: null } },
      {
        onSuccess: () => toast.success("Request rejected"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  return (
    <div className="space-y-3">
      {filtered.map((req, i) => (
        <PaymentCard
          key={req.id.toString()}
          req={req}
          index={i + 1}
          onAccept={() => handleAccept(req.id)}
          onReject={() => handleReject(req.id)}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

export default function AdminPayments() {
  const { data: requests, isLoading } = useAllPaymentRequests();

  const allRequests = requests ?? [];
  const pendingCount = allRequests.filter((r) => "pending" in r.status).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="w-6 h-6 text-primary" />
        <div>
          <h1 className="font-display font-bold text-xl">Payment Requests</h1>
          <p className="text-muted-foreground text-sm">
            {pendingCount > 0
              ? `${pendingCount} pending request${pendingCount > 1 ? "s" : ""}`
              : "All requests reviewed"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="payments.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="deposits" data-ocid="payments.tab">
          <TabsList className="w-full">
            <TabsTrigger
              value="deposits"
              className="flex-1"
              data-ocid="payments.deposits.tab"
            >
              Deposits
              {allRequests.filter(
                (r) => "deposit" in r.requestType && "pending" in r.status,
              ).length > 0 && (
                <span className="ml-2 bg-yellow-500 text-black text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {
                    allRequests.filter(
                      (r) =>
                        "deposit" in r.requestType && "pending" in r.status,
                    ).length
                  }
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="withdrawals"
              className="flex-1"
              data-ocid="payments.withdrawals.tab"
            >
              Withdrawals
              {allRequests.filter(
                (r) => "withdraw" in r.requestType && "pending" in r.status,
              ).length > 0 && (
                <span className="ml-2 bg-yellow-500 text-black text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {
                    allRequests.filter(
                      (r) =>
                        "withdraw" in r.requestType && "pending" in r.status,
                    ).length
                  }
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposits" className="mt-4">
            <RequestList requests={allRequests} type="deposit" />
          </TabsContent>
          <TabsContent value="withdrawals" className="mt-4">
            <RequestList requests={allRequests} type="withdraw" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
