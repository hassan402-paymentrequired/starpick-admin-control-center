import React, { useState } from 'react';
import {CheckCircle, XCircle, Clock, Search, Filter, User, Building2, CreditCard, Calendar} from 'lucide-react';
import StatsCard from "@/components/stats-card.tsx";
import {Input} from "@/components/ui/input.tsx";
import RequestCard from "@/components/request-card.tsx";

const WithdrawRequest = () => {
    const [requests, setRequests] = useState([
        {
            id: 1,
            userName: 'John Doe',
            email: 'john@example.com',
            amount: 5000,
            bankName: 'First Bank',
            accountNumber: '1234567890',
            accountName: 'John Doe',
            initiatedDate: '2025-11-14 10:30 AM',
            status: 'pending'
        },
        {
            id: 2,
            userName: 'Jane Smith',
            email: 'jane@example.com',
            amount: 12000,
            bankName: 'GTBank',
            accountNumber: '0987654321',
            accountName: 'Jane Smith',
            initiatedDate: '2025-11-14 09:15 AM',
            status: 'pending'
        },
        {
            id: 3,
            userName: 'Mike Johnson',
            email: 'mike@example.com',
            amount: 8500,
            bankName: 'Access Bank',
            accountNumber: '5555666677',
            accountName: 'Mike Johnson',
            initiatedDate: '2025-11-13 03:45 PM',
            status: 'approved'
        },
        {
            id: 4,
            userName: 'Sarah Williams',
            email: 'sarah@example.com',
            amount: 15000,
            bankName: 'Zenith Bank',
            accountNumber: '2233445566',
            accountName: 'Sarah Williams',
            initiatedDate: '2025-11-13 02:20 PM',
            status: 'rejected',
            rejectionReason: 'Insufficient documentation provided'
        },
        {
            id: 5,
            userName: 'David Brown',
            email: 'david@example.com',
            amount: 7200,
            bankName: 'UBA',
            accountNumber: '9988776655',
            accountName: 'David Brown',
            initiatedDate: '2025-11-12 11:45 AM',
            status: 'pending'
        }
    ]);

    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState('');

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
            setRequests(requests.map(req =>
                req.id === selectedRequest.id
                    ? { ...req, status: 'approved' }
                    : req
            ));
        } else if (modalAction === 'reject' && rejectionReason.trim()) {
            setRequests(requests.map(req =>
                req.id === selectedRequest.id
                    ? { ...req, status: 'rejected', rejectionReason }
                    : req
            ));
        }
        setShowModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
    };

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        const matchesSearch = req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.accountNumber.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });



    const stats = {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                        <div className="text-gray-400 mb-4">
                            <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-lg">No withdrawal requests found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredRequests.map((request) => (
                            <RequestCard request={request} handleApprove={handleApprove} handleReject={handleReject} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {modalAction === 'approve' ? 'Approve Withdrawal Request' : 'Reject Withdrawal Request'}
                        </h3>

                        {selectedRequest && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">User: <span className="font-semibold text-gray-900">{selectedRequest.userName}</span></p>
                                <p className="text-sm text-gray-600">Amount: <span className="font-semibold text-gray-900">₦{selectedRequest.amount.toLocaleString()}</span></p>
                                <p className="text-sm text-gray-600">Bank: <span className="font-semibold text-gray-900">{selectedRequest.bankName}</span></p>
                                <p className="text-sm text-gray-600">Account: <span className="font-semibold text-gray-900">{selectedRequest.accountNumber}</span></p>
                            </div>
                        )}

                        {modalAction === 'reject' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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