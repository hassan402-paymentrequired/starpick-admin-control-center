import React from 'react';
import {Building2, Calendar, CheckCircle, CreditCard, User, XCircle} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {formatDate} from "@/lib/utils.ts";

const RequestCard = ({request, handleReject, handleApprove}) => {

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="rounded-lg p-4 border border-gray-700 shadow-md bg-gray-800/50 backdrop-blur supports-[backdrop-filter]:bg-gray-800/50">
            {/* Card Header */}
            <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-700 rounded-full border border-gray-600 p-1.5">
                            <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xs text-gray-100">{request.user.name}</h3>
                            <p className="text-gray-400 text-xs">{request.user.email}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <p className="text-gray-400 text-xs mb-0.5">Withdrawal Amount</p>
                    <p className="text-base font-bold text-gray-100">₦{request.amount.toLocaleString()}</p>
                </div>
            </div>

            {/* Card Body */}
            <div className="space-y-3">
                {/* Bank Details */}
                <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Bank Name</p>
                            <p className="text-xs text-gray-200 font-medium">{request.bank_name}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Account Details - Account name</p>
                            <p className="text-xs text-gray-200 font-medium">{request.account_number} - {request.account_name}</p>
                            <p className="text-xs text-gray-400">{request.accountName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Initiated Date</p>
                            <p className="text-xs text-gray-200 font-medium">{formatDate(request.created_at)}</p>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">Status</span>
                        {getStatusBadge(request.status)}
                    </div>
                </div>

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.reason && (
                    <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1.5">Rejection Reason</p>
                        <p className="text-xs text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">
                            {request.reason}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                {request.status === 'pending' && (
                    <div className="pt-2 border-t border-gray-700">
                        <div className="flex gap-2 w-full">
                            <Button
                                onClick={() => handleApprove(request)}
                                className="flex-1 h-8 text-xs"
                                size="sm"
                            >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Approve
                            </Button>
                            <Button
                                onClick={() => handleReject(request)}
                                variant="destructive"
                                className="flex-1 h-8 text-xs"
                                size="sm"
                            >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reject
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestCard;