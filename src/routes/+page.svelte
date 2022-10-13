<script lang="ts">
    import type { Entsoedata, Entsoepoint } from '$lib/apis/entsoe';

    import PriceGraph from '$lib/components/PriceGraph.svelte';
    import moment from 'moment';
    import type { PageServerLoad } from './$types';

    export let data: PageServerLoad;
    

    let settings = {
        startTime: moment().hours(6),
        endTime: moment().hours(22),
        useTimeLimits: true,
        nOfLow: 4,
        nOfHigh: 4,
        lowPrice: 100, // e/mwh
        highPrice: 500, // e/mwh
        useFixedPriceLimits: true,
    }

    let priceData: Entsoedata = data.priceData;
    let today = processLimits(priceData.today);

    let status = currentStatus(today);

    let x: string[] = priceData.times;
    let y: number[] = priceData.prices;

    function processLimits(dataIn: Entsoepoint[]) {

        let limitedData = dataIn.map(d => ({...d, time: moment(d.time)}));
        
        if(settings.useTimeLimits) {
            limitedData = limitedData.filter(d => d.time.isBetween(settings.startTime, settings.endTime))
        }
        console.log('limits', limitedData);

        const prices = limitedData.map(p => p.price);
        prices.sort();
        console.log(prices);
        let lowLimitPrice = prices[settings.nOfLow]
        let highLimitPrice = prices[prices.length-settings.nOfHigh];

        if(settings.useFixedPriceLimits) {
            lowLimitPrice = Math.max(lowLimitPrice, settings.lowPrice);
            highLimitPrice = Math.min(highLimitPrice, settings.highPrice);
        }
        console.log(lowLimitPrice, highLimitPrice);
       
        let dataOut = dataIn.map(d => ({
            ...d,
            status: getStatus(d.price, lowLimitPrice, highLimitPrice)
        }))


        return {
            lowLimitPrice,
            highLimitPrice,
            points: dataOut,
        };
    }

    function getStatus(price: number, low: number, high: number) {
        if(price <= low) {
            return 0;
        } else if (price >= high) {
            return 10;
        } else {
            return 5;
        }
    }

    function currentStatus(today) {
        const now = moment();
        console.log('now', now);
        console.log(typeof today.points[0].time)
        let point = today.points.find(d => moment(d.time).isSame(now, 'hours'));
        console.log(point);
        
        return {
            price: point.price,
        }
    }

    // $: console.log(data.priceData.times);

    // let x = data.priceData.times;//
    //let x = data.priceData.times.map(t => moment(t));
    //console.log('x', x, data.priceData.prices);

</script>

<div class="min-h-screen w-screen max-w-screen bg-red-500 flex flex-col">
    <div class="flex flex-col">
        <h2 class="font-bold text-center">
            <span class="text-[15rem] ">{status.price}</span> <span class="text-xl">€/MWh</span>
        </h2>
    </div>
    <div class="flex flex-col p-5">
            <PriceGraph {x} {y}></PriceGraph>
    </div>
</div>