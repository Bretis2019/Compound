import yahooFinance from 'yahoo-finance2'; // Replace with the actual package you are using
import { type NextRequest } from 'next/server'
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || "";

    try {
        const stockData = await yahooFinance.search(query)
        const suggestionsShort = stockData.quotes.map(item =>{
            return (
                item.shortname ? {long: item.shortname,ticker:  item.symbol} : null
            )
        }).filter(item => item !== null);
        const response = {
            suggestions: suggestionsShort
        }

        return Response.json(response);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return Response.json({status: 500})
    }
}
