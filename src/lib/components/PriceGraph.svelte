<script lang="ts">
    import { browser } from '$app/env';
    import { onMount } from 'svelte/internal';
    import { Chart, registerables } from 'chart.js';
    import 'chartjs-adapter-moment';


    Chart.register(...registerables);

    export let x: string[] = [];
    export let y: number[] = [];

    let chartElement: HTMLCanvasElement;

    let options = {
        responsive: true,
        plugins: {
            title: {
                text: 'Chart.js Time Scale',
                display: false
            }
        },
        scales: {
            x: {
                type: 'time',
                // time: {
                //     // Luxon format string
                //     tooltipFormat: 'DD T'
                //},
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Price'
                }
            }
        },
    };

    let data = {
        labels: x,
        datasets: [{
            label: '€/MWh',
            data: y,
            fill: false,
            borderColor: 'rgb(0,0,0)',
            tension: 0.1,
            stepped: true,
        },
        /*{
            type: 'bar',
            data: [
                {x: "2022-09-16T02:00:00+03:00", y: Math.max(...y)}
            ],
            borderColor: 'rgb(0,0,0)',
            maxBarThickness: 4,
            stepped: true,
        }]*/
        ]
    }

    onMount( async() => {
        if (browser) {
            new Chart(chartElement, {
                type: 'bar',
                options,
                data,
            })
        }
    });

</script>

<canvas class="w-full, h-full" bind:this={chartElement}></canvas>