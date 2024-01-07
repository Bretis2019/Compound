import {Skeleton} from "@/components/ui/skeleton";

export default function Loading(){

    return (
        <div className={"bg-black w-screen h-screen px-4 py-2 text-white flex flex-col justify-between"}>
            <div className={"w-full flex md:flex-row flex-col gap-y-8 md:justify-between"}>
                <div className={"flex md:flex-col items-center md:w-fit w-full gap-x-2 justify-between"}>
                    <div><Skeleton className={"w-32 h-8"}/></div>
                    <div>
                        <div><Skeleton className={"w-8 h-3"}/></div>
                        <div><Skeleton className={"w-8 h-3"}/></div>
                    </div>
                </div>
                <div className={"flex flex-col gap-y-4"}>
                    <div><Skeleton className={"w-16 h-4"}/></div>
                    <div><Skeleton className={"w-16 h-4"}/></div>
                    <div><Skeleton className={"w-16 h-4"}/></div>
                    <div><Skeleton className={"w-16 h-4"}/></div>
                </div>
            </div>
            <div><Skeleton className={"w-[95svw] h-[350px]"}/></div>
        </div>
    )
}