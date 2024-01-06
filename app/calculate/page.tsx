"use client"
import {inflationTable} from "@/app/calculate/inflationTable";
import {ChartsTabs} from "@/app/calculate/ChartsTabs";
import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

interface StockData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface InvestmentResult {
    date: string; // month name abbreviated
    deposits: number; // starting balance plus current total of monthly deposits
    compound: number; // current balance
}


const formatNumberWithCommas = (number: number) => {
    return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

function getMonthAbbreviation(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = date.getMonth();
    return months[monthIndex];
}

function todayDate(){
    const today = new Date();

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getInflation(country: string){
    return inflationTable[country];
}

function calculateInflationBalance(inflationRate: number, startDate: string, endDate: string, startingBalance: number, monthlyContribution: number) {
    // Parse start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);


    // Calculate the number of months between start and end dates
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    // Convert yearly inflation rate to monthly
    const monthlyInflationRate = (1 + inflationRate) ** (1 / 12) - 1;

    let currentBalance = startingBalance;

    for (let i = 0; i < months; i++) {
        // Adjust for inflation
        currentBalance *= 1 - (monthlyInflationRate / 100);

        // Add monthly contribution
        currentBalance += monthlyContribution;
    }

    return formatNumberWithCommas(currentBalance);
}


function calculateInvestingEndBalance(
    startingBalance: number,
    monthlyContribution: number,
    stockData: StockData[]
): [string, InvestmentResult[]] {
    let currentBalance = startingBalance;
    let totalDeposits = startingBalance; // Initialize with the starting balance

    const resultArray: InvestmentResult[] = [];

    let currentMonth: string | undefined = undefined;

    for (const data of stockData) {
        const date = getMonthAbbreviation(data.date); // Assuming data.date is a Date object

        // Skip adding monthly contribution for the first month
        if (currentMonth !== undefined) {
            // Check if it's a new month
            if (date !== currentMonth) {
                currentMonth = date;

                // Add monthly contribution only if it's a new month
                totalDeposits += monthlyContribution;
            }
        } else {
            currentMonth = date;
        }

        const monthlyReturn = (data.close - data.open) / data.open + 1;
        currentBalance = currentBalance * monthlyReturn + monthlyContribution;

        const deposits = totalDeposits;
        const compound = currentBalance;

        resultArray.push({ date, deposits, compound });
    }

    return [formatNumberWithCommas(currentBalance), resultArray];
}



function calculateEndBalance(startDate: string, endDate: string, startingBalance: number, monthlyContribution: number){
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Calculate the number of months between start and end dates
    const monthsDiff = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12 +
        (endDateObj.getMonth() - startDateObj.getMonth());

    const endBalance = startingBalance + monthlyContribution * monthsDiff

    // Calculate the end balance
    return formatNumberWithCommas(endBalance);
}

async function fetchData(stock: string, startDate: string, endDate: string) {
    try {
        const response = await fetch(`api/stockData?stock=${stock}&startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();
        return data.map((item: StockData) => ({
            ...item,
            date: new Date(item.date)
        }));
    } catch (error) {
        console.log('error', error);
        return null;
    }
}

export default function Home(){

    const searchParams = useSearchParams()

    const country = searchParams.get("country") || "Algeria";
    const stock = searchParams.get("stock") || "spy";
    const startDate = searchParams.get("startDate") || "2021-01-01";
    const startingBalance = Number(searchParams.get("startingBalance")) || 0;
    const monthlyContribution = Number(searchParams.get("monthlyContribution")) || 0;
    const endDate = todayDate();
    const inflation = getInflation(country);


    const [endBalance, setEndBalance] = useState('');
    const [inflationEndBalance, setInflationEndBalance] = useState('');
    const [investingEndBalance, setInvestingEndBalance] = useState('');
    const [chartData, setChartData] = useState<InvestmentResult[]>([]);

    useEffect(() => {
        // Fetch data and calculate values in the useEffect hook
        const fetchDataAndCalculate = async () => {
            try {
                const stockDataResult = await fetchData(stock, startDate, endDate);

                const endBalanceResult = calculateEndBalance(startDate, endDate, startingBalance, monthlyContribution);
                setEndBalance(endBalanceResult);

                const inflationEndBalanceResult = calculateInflationBalance(inflation, startDate, endDate, startingBalance, monthlyContribution);
                setInflationEndBalance(inflationEndBalanceResult);

                const investingDataResult = calculateInvestingEndBalance(startingBalance, monthlyContribution, stockDataResult);
                setInvestingEndBalance(investingDataResult[0]);
                setChartData(investingDataResult[1]);
            } catch (error) {
                console.error('Error fetching or calculating data:', error);
            }
        };

        // Call the fetchDataAndCalculate function
        fetchDataAndCalculate();
    }, [stock, startDate, endDate, startingBalance, monthlyContribution, inflation]);

    return (
        <div className={"bg-black w-screen h-screen px-4 py-2 text-white flex flex-col justify-between"}>
            <div className={"w-full flex md:flex-row flex-col gap-y-8 md:justify-between"}>
                <div className={"flex md:flex-col items-center md:w-fit w-full gap-x-2 justify-between"}>
                    <div className={"font-extrabold text-6xl"}>{stock}</div>
                    <div>
                        <div>{startDate}</div>
                        <div>{endDate}</div>
                    </div>
                </div>
                <div className={"flex flex-col gap-y-4"}>
                    <div>Deposits: <span className={"font-semibold"}>${endBalance}</span></div>
                    <div>Without investing: <span className={"font-semibold"}>${inflationEndBalance}</span></div>
                    <div>with investing: <span className={"font-semibold"}>${investingEndBalance}</span></div>
                </div>
            </div>
            <ChartsTabs data={chartData}/>
        </div>
    )
}