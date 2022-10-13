import xml2js from 'xml2js';
import { ENTSOE_API_KEY } from '$env/static/private';
import moment from 'moment';

const PRICE_AREA = '10YFI-1--------U'
const PARSER = new xml2js.Parser();

export interface Entsoepoint {
    time: string,
    price: number,
}

export interface Entsoedata {
    today: Entsoepoint[],
    tomorrow: Entsoepoint[],
    times: string[],
    prices: number[],
}

export async function getPriceData() {
    
}

export async function readPriceData() {
    const url = entsoeUrl();
    try {
        const response = await fetch(url);
        const content = await response.text()
		const data = await PARSER.parseStringPromise(content)

        const timeserieses = data.Publication_MarketDocument.TimeSeries; //[0].Period[0]
        let today: Entsoepoint[] = [];
        let tomorrow: Entsoepoint[] = []
        const times = [];
        const prices = [];
	
        // console.log(data.Publication_MarketDocument.TimeSeries);
        
        for (const [idx, ts] of timeserieses.entries()) {

            const period = ts.Period[0];
            const startTime = moment(period.timeInterval[0].start[0]);
            const endTime = moment(period.timeInterval[0].end[0]);
            
            let timestamp = startTime.clone().subtract(1, 'hours');
            const dataPoints = period.Point;
            
            const points = [];

            for (const [i, p] of dataPoints.entries()) {
                const t = timestamp.add(1, 'hours');
                points.push({
                    time: t.format(),
                    price: p['price.amount'][0] 
                })
                times.push(t.format());
                prices.push(p['price.amount'][0] )
            }

            if(idx === 0 ) {
                today = points;
            } else {
                tomorrow = points;
            }
        }

        const res: Entsoedata = {
            today,
            tomorrow,
            times,
            prices,
        }
            
		return res
        
    } catch (err) {
        console.error(err);
        return {
            today: [],
            tomorrow: [],
            times: [],
            prices: [],
        };
    }
  
}

export const entsoeUrl = () => {

    const priceArea = PRICE_AREA;
    const token = ENTSOE_API_KEY;

    const atStartOfDay = moment().startOf('day')
    const periodStart = atStartOfDay.format('YYYYMMDDHHmm')
    const periodEnd = atStartOfDay.add(1, 'days').hour(23).format('YYYYMMDDHHmm')
 
    console.log(`Period: ${periodStart} - ${periodEnd}`)

    return `https://transparency.entsoe.eu/api?documentType=A44&in_Domain=${priceArea}&out_Domain=${priceArea}&periodStart=${periodStart}&periodEnd=${periodEnd}&securityToken=${token}`
}