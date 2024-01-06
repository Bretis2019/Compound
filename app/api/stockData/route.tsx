import yahooFinance from 'yahoo-finance2'; // Replace with the actual package you are using
import { type NextRequest } from 'next/server'
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const stock = searchParams.get('stock');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        const stockData = await yahooFinance.historical(stock!, {
            period1: startDate!,
            period2: endDate!,
            interval: '1mo',
        });

        return Response.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return Response.json({status: 500})
    }
}
