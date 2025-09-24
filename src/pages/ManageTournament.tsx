import React, {useState} from 'react';
import {Button} from "@/components/ui/button.tsx";
import {Download, Loader, RotateCcw} from "lucide-react";
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

const ManageTournament = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [data, setData] = useState({
        name: '',
        amount: ''
    });




    const handleSyncTeams = () => {
        setDialogOpen(true);
    };

    const handleDialogConfirm = async () => {
        setIsLoading(true);
        try {
            // Fetch teams from external API
            const response = await api.post('/admin/tournament', data);
            toast({
                title: "Success",
                description: "Tournament has being successfully.",
            });
            setDialogOpen(false);
            setData({name: '', amount: ''})
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



    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Teams Management
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
                        <RotateCcw
                            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                        />
                       Create Tournament
                    </Button>
                </div>
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