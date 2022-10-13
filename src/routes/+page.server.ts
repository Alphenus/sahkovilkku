import { readPriceData, type Entsoedata } from '$lib/apis/entsoe';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    console.log('loading frontpage');
    
    const priceData: Entsoedata = await readPriceData();
    console.log('Prices', priceData);
    
    return {
        priceData: priceData,
    }
 
    //throw error(404, 'Not found');
}