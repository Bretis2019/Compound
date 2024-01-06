import {inflationTable} from "@/app/calculate/inflationTable";
import yahooFinance from 'yahoo-finance2';
import {ChartsTabs} from "@/app/calculate/ChartsTabs";

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

export default async function Home(){
    const country = "Algeria";
    const inflation = getInflation(country);
    const stock = "GOOG";
    const startDate = "2023-01-01";
    const endDate = todayDate();
    const stockData = await yahooFinance.historical(stock, {period1: startDate, period2: endDate, interval: "1mo"});
    const startingBalance = 0;
    const monthlyContribution = 50000;

    const endBalance = calculateEndBalance(startDate, endDate, startingBalance, monthlyContribution)


    const inflationEndBalance: string = calculateInflationBalance(inflation, startDate, endDate, startingBalance, monthlyContribution);

    const investingData = calculateInvestingEndBalance(startingBalance, monthlyContribution, stockData);

    const investingEndBalance = investingData[0];


    const chartData = investingData[1]

    return (
        <div className={"bg-black w-screen h-screen px-4 py-2 text-white flex flex-col justify-between"}>
            <div className={"w-full flex justify-between"}>
                <div className={"font-extrabold text-6xl"}>{stock}</div>
                <div>
                    <div>Deposits: {endBalance}</div>
                    <div>Without investing balance: {inflationEndBalance}</div>
                    <div>with investing balance: {investingEndBalance}</div>
                </div>
            </div>
            <ChartsTabs data={chartData}/>
        </div>
    )
}