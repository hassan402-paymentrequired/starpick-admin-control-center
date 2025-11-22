import React, {useEffect, useState} from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import StatsCard from "@/components/stats-card.tsx";
import {Input} from "@/components/ui/input.tsx";
import RequestCard from "@/components/request-card.tsx";
import {useToast} from "@/hooks/use-toast.ts";
import {PaginatedResponse} from "@/pages/Teams.tsx";
import api from "@/lib/axios.ts";
import {Button} from "@/components/ui/button.tsx";


const WithdrawRequest = () => {
    const [requests, setRequests] = useState([]);

    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState('');

    const [paginationData, setPaginationData] = useState<PaginatedResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRefetching, setIsRefetching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    const fetchRequests = async (page = 1, search = "") => {
        setIsRefetching(true)
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (search) {
                params.append('search', search);
            }

            const response = await api.get(`/admin/withdraw?${params.toString()}`);
            const data = response.data;
            console.log(data.data.requests.data);

            setPaginationData(data.data.requests);
            setRequests(data.data.requests.data);
            setCurrentPage(data.data.requests.current_page);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast({
                title: "Error",
                description: "Failed to fetch teams.",
                variant: "destructive",
            });
        } finally {
            setIsRefetching(false);
        }
    };

    useEffect(() => {
        fetchRequests(1);
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery !== undefined) {
                fetchRequests(1, searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handlePageChange = (page: number) => {
        if (page < 1 || (paginationData && page > paginationData.last_page)) return;
        fetchRequests(page, searchQuery);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPaginationButtons = () => {
        if (!paginationData || paginationData.last_page <= 1) return null;

        const buttons = [];
        const currentPage = paginationData.current_page;
        const lastPage = paginationData.last_page;

        // Always show first page
        if (currentPage > 3) {
            buttons.push(
                <Button
                    key={1}
                    variant={1 === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className="min-w-[40px]"
                >
                    1
                </Button>
            );

            if (currentPage > 4) {
                buttons.push(
                    <span key="ellipsis-start" className="px-2 text-muted-foreground">
            ...
          </span>
                );
            }
        }

        // Show pages around current page
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(lastPage, currentPage + 2); i++) {
            buttons.push(
                <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(i)}
                    className="min-w-[40px]"
                >
                    {i}
                </Button>
            );
        }

        // Always show last page
        if (currentPage < lastPage - 2) {
            if (currentPage < lastPage - 3) {
                buttons.push(
                    <span key="ellipsis-end" className="px-2 text-muted-foreground">
            ...
          </span>
                );
            }

            buttons.push(
                <Button
                    key={lastPage}
                    variant={lastPage === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(lastPage)}
                    className="min-w-[40px]"
                >
                    {lastPage}
                </Button>
            );
        }

        return buttons;
    };

    if (!paginationData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading withdraw requests...</p>
                </div>
            </div>
        );
    }

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setModalAction('approve');
        setShowModal(true);
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setModalAction('reject');
        setRejectionReason('');
        setShowModal(true);
    };

    const confirmAction = () => {
        if (modalAction === 'approve') {
           api.patch(`/admin/withdraw/${selectedRequest.id}/status`, { status: 'paid' })
               .then(response => {
                   toast({
                       title: "Success",
                       description: response.data.data.message || "Request approved successfully.",
                   });
               })
               .catch(error =>
                   console.error('Error approving withdrawal request:', error)
               )
        } else if (modalAction === 'reject' && rejectionReason.trim()) {
            api.patch(`/admin/withdraw/${selectedRequest.id}/status`, { status: 'rejected', reason: rejectionReason })
                .then(response => {
                    toast({
                        title: "Success",
                        description: response.data.data.message || "Request Rejected successfully.",
                    });
                })
                .catch(error =>
                    console.error('Error approving withdrawal request:', error)
                )
        }
        fetchRequests(currentPage, searchQuery);
        setShowModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
    };

    const stats = {
        pending: 20,
        approved: 12,
        rejected: 3
    };

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold  mb-2">Withdrawal Requests</h1>
                    <p className="">Review and manage user withdrawal requests</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard title="Pending Requests" value={stats.pending} Icon={Clock} />
                    <StatsCard title="Approved Requests" value={stats.approved} Icon={CheckCircle} />
                    <StatsCard title="Rejected Requests" value={stats.rejected} Icon={XCircle} />

                </div>

                {/* Filters and Search */}
                <div className=" rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            {/*<Input />*/}
                            <Input
                                type="text"
                                placeholder="Search by name, email, or account number..."
                                className="w-full pl-10 pr-4 py-2 "
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-400 w-5 h-5" />

                            <select
                                className="w-full px-3 py-2 rounded border border-input bg-background text-foreground mb-4"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">Select League</option>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Paid</option>
                                <option value="rejected">Canceled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {isRefetching && (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Loading...</span>
                        </div>
                    </div>
                )}

                {/* Requests Table */}
                {requests.length === 0 ? (
                    <div className=" rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                        <div className="text-gray-400 mb-4">
                            <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-lg">No withdrawal requests found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {requests.map((request) => (
                            <RequestCard request={request} handleApprove={handleApprove} handleReject={handleReject} />
                        ))}
                    </div>
                )}
            </div>

            {paginationData && paginationData.last_page > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-5">
                    <div className="text-sm text-muted-foreground">
                        Showing {paginationData.from} to {paginationData.to} of {paginationData.total} teams
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!paginationData.prev_page_url || isRefetching}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>

                        <div className="hidden sm:flex items-center gap-1">
                            {renderPaginationButtons()}
                        </div>

                        <div className="sm:hidden text-sm text-muted-foreground px-2">
                            Page {currentPage} of {paginationData.last_page}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!paginationData.next_page_url || isRefetching}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-100 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {modalAction === 'approve' ? 'Approve Withdrawal Request' : 'Reject Withdrawal Request'}
                        </h3>

                        {selectedRequest && (
                            <div className="mb-4 p-4 bg-gray-200 rounded-lg">
                                <p className="text-sm text-gray-600">User: <span className="font-semibold text-gray-900">{selectedRequest.user.name}</span></p>
                                <p className="text-sm text-gray-600">Amount: <span className="font-semibold text-gray-900">₦{selectedRequest.amount.toLocaleString()}</span></p>
                                <p className="text-sm text-gray-600">Bank: <span className="font-semibold text-gray-900">{selectedRequest.bank_name}</span></p>
                                <p className="text-sm text-gray-600">Account: <span className="font-semibold text-gray-900">{selectedRequest.account_name} - {selectedRequest.account_number}</span></p>
                            </div>
                        )}

                        {modalAction === 'reject' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    rows={4}
                                    placeholder="Please provide a reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setRejectionReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                disabled={modalAction === 'reject' && !rejectionReason.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                    modalAction === 'approve'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                                }`}
                            >
                                Confirm {modalAction === 'approve' ? 'Approval' : 'Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawRequest;