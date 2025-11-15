import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {LucideIcon, TrendingUp} from "lucide-react";

interface Props {
    title: string,
    Icon: LucideIcon,
    value: number,
}

const StatsCard = ({title, Icon,  value}: Props) => (
    <Card className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
            </CardTitle>
            <Icon className={`h-4 w-4`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-foreground">{value}</div>
        </CardContent>
    </Card>
);

export default StatsCard;