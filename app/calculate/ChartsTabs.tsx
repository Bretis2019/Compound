"use client"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {StockBarChart} from "@/app/calculate/StockBarChart";
import {StockLineChart} from "@/app/calculate/StockLineChart";

export function ChartsTabs(props: any) {

    const { data } = props;

    return (
        <Tabs defaultValue="bar">
            <TabsList  className="grid w-full grid-cols-2">
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="line">Line Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="bar">
                <StockBarChart data={data}/>
            </TabsContent>
            <TabsContent value="line">
                <StockLineChart data={data}/>
            </TabsContent>
        </Tabs>
    )
}
