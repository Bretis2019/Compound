import {Suspense} from "react";
import Loading from "@/app/calculate/loading";
import Home from "@/app/calculate/page";

export default function CalculateLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <Suspense fallback={<Loading />}>
            <Home />
        </Suspense>
    )
}
