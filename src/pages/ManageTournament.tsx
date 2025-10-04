import React, {useEffect, useState} from 'react';
import {Button} from "@/components/ui/button.tsx";
import {ChevronLeft, ChevronRight, Download, Loader, PlusSquare, RotateCcw} from "lucide-react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import axios from "axios";
import api from "@/lib/axios.ts";
import {useForm} from "react-hook-form";
import {useToast} from "@/hooks/use-toast.ts";
import {Input} from "@/components/ui/input.tsx";
import {useFetch} from "@/hooks/useFetch.ts";
import {PaginatedResponse} from "@/pages/Teams.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Link} from "react-router-dom";
import {Switch} from "@/components/ui/switch.tsx";

const ManageTournament = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [tournaments, setTournaments] = useState([]);
    const [isRefetching, setIsRefetching] = useState(false);
    const [paginationData, setPaginationData] = useState<PaginatedResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState({
        name: '',
        amount: ''
    });

    const fetchTournaments = async (page = 1, search = "") => {
        setIsRefetching(true)
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (search) {
                params.append('search', search);
            }

            const response = await api.get(`/admin/tournament?${params.toString()}`);
            const data = response.data.data.tournaments;

            setPaginationData(data);
            setTournaments(data.data);
            setCurrentPage(data.current_page);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast({
                title: "Error",
                description: "Failed to tournaments teams.",
                variant: "destructive",
            });
        } finally {
            setIsRefetching(false);
        }
    };

    useEffect(() => {
      fetchTournaments(1)
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery !== undefined) {
                fetchTournaments(1, searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handlePageChange = (page: number) => {
        if (page < 1 || (paginationData && page > paginationData.last_page)) return;
        fetchTournaments(page, searchQuery);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // console.log(tournaments)

    const handleSyncTeams = () => {
        setDialogOpen(true);
    };

    const handleDialogConfirm = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/admin/tournament', data);
            toast({
                title: "Success",
                description: "Tournament has being successfully.",
            });
            setDialogOpen(false);
            setData({name: '', amount: ''})
            await fetchTournaments()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create tournament.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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
                    <p className="mt-4 text-muted-foreground">Loading tournaments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Tournaments Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage football teams available to users
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSyncTeams}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <PlusSquare
                            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                        />
                       Create Tournament
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.length > 0 ? (
                    tournaments.map((tourn) => (
                        <Card
                            key={tourn.id}
                            className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200"
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <h2 className="text-lg text-foreground">{tourn.name}</h2>

                                    <Badge
                                        variant={tourn.status === 'open' ? "default" : "secondary"}
                                        className={
                                            tourn.status === 'open'
                                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                : ""
                                        }
                                    >
                                        {tourn.status === 'open' ? "Active" : "Inactive"}
                                    </Badge>
                                </CardTitle>

                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className='grid grid-cols-2 gap-2 mb-2'>
                                    <div className='flex flex-col items-center justify-center'>
                                        <span className={'text-xs'}>Amount</span>
                                        <small className={'text-sm'}>{tourn.amount}</small>
                                    </div>
                                    <div className='flex flex-col items-center justify-center'>
                                        <span className={'text-xs'}>Users</span>
                                        <small className={'text-sm'}>{tourn.users_count}</small>
                                    </div>
                                </div>
                                        <Link
                                            to={`/tourns/${tourn.id}/players`}
                                            className="w-full"
                                        >
                                            <Button size={'sm'} className={'w-full'}>View Players</Button>
                                        </Link>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No tournament found</p>
                    </div>
                )}
            </div>

            {paginationData && paginationData.last_page > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card/50 backdrop-blur border-border">
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">
                                {paginationData.total}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Teams</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur border-border">
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">
                                {tournaments.filter((t) => t.status === 1).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Active on Page</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur border-border">
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">
                                {tournaments.filter((t) => t.status === 0).length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Inactive on Page
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Tournament</DialogTitle>
                        <DialogDescription>
                            Enter the tournament details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                        <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Enter tournament name" />
                    </div>

                    <div className="mt-2">
                        <Input onChange={e => setData({...data, amount: e.target.value})} placeholder="Enter tournament amount" />
                    </div>


                    <DialogFooter>
                        <Button
                            onClick={handleDialogConfirm}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader className="animate-spin " />} Create
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageTournament;