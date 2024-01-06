import {inflationTable} from "@/app/calculate/inflationTable";
import yahooFinance from 'yahoo-finance2';
import {StockBarChart} from "@/app/calculate/StockBarChart";
const formatNumberWithCommas = (number: number) => {
    return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

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

interface StockData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

function calculateInvestingEndBalance(
    startingBalance: number,
    monthlyContribution: number,
    stockData: StockData[]
){
    let currentBalance = startingBalance;

    for (const data of stockData) {
        const monthlyReturn = (data.close - data.open) / data.open + 1;
        currentBalance = currentBalance * monthlyReturn + monthlyContribution;
    }

    return formatNumberWithCommas(currentBalance);
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
    const startDate = "2020-01-01";
    const endDate = todayDate();
    const stockData = await yahooFinance.historical(stock, {period1: startDate, period2: endDate, interval: "1mo"});
    const startingBalance = 0;
    const monthlyContribution = 50000;

    const endBalance = calculateEndBalance(startDate, endDate, startingBalance, monthlyContribution)


    const inflationEndBalance: string = calculateInflationBalance(inflation, startDate, endDate, startingBalance, monthlyContribution);

    const investingEndBalance = calculateInvestingEndBalance(startingBalance, monthlyContribution, stockData);

    const chartData = stockData.map((stock) => {
        return {
            name: stock.date,
            close: stock.close,
        }
    });

    return (
        <div>
            <div>Deposits{endBalance}</div>
            <div>Without investing balance {inflationEndBalance}</div>
            <div>with investing balance {investingEndBalance}</div>
            <StockBarChart data={chartData}/>
        </div>
    )
}