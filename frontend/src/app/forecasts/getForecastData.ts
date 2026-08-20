import { supabase } from "../../lib/supabase"; // Your initialized Supabase client
import { LGA } from "./ForecastCard";

export interface FetchForecastsParams {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
    filterRisk?: string;
}

export interface PaginatedResult {
    data: LGA[] | null;
    count: number | null;
    nextPage: number | null;
}

export async function getPaginatedForecasts({
    page = 0,
    pageSize = 50, // Let's fetch 50 cards at a time
    searchQuery = "",
    filterRisk = "all",
}: FetchForecastsParams): Promise<PaginatedResult> {

    const rangeStart = page * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    // 1. Build the query, ensuring we explicitly select all the new horizon columns!
    let query = supabase
        .from("flood_predictions")
        .select("*, lga_metadata(*)", { count: "exact" }) // count: "exact" gets the total matching records
        .order("probability_percent", { ascending: false }); // Sort by risk

    // 2. Apply dynamic filters (if present)
    if (searchQuery) {
        query = query.ilike("lga_metadata.ADM2_NAME", `%${searchQuery}%`);
    }

    if (filterRisk !== "all") {
        query = query.eq("status", filterRisk.toUpperCase()); // e.g., 'AT RISK', 'SAFE'
    }

    // 3. APPLY THE PAGINATION RANGE (The Infinite Loading core)
    query = query.range(rangeStart, rangeEnd);

    // 4. Execute the query
    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching paginated forecasts:", error);
        return { data: null, count: null, nextPage: null };
    }

    // 5. Calculate if there's a next page
    const hasNextPage = count ? rangeEnd < count : false;
    const nextPage = hasNextPage ? page + 1 : null;

    return {
        data: data as LGA[], // cast to your specific type
        count,
        nextPage
    };
}