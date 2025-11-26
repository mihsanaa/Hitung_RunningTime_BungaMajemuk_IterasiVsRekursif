const form = document.getElementById('form');
const resultsSection = document.getElementById('results');
const summaryEl = document.getElementById('summary');
const tableBody = document.getElementById('tableBody');
const chartCtx = document.getElementById('chart').getContext('2d');
let chart = null;
// event submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const P = document.getElementById('P').value;
    const r = document.getElementById('r').value;
    const bulan = document.getElementById('bulan').value;

    const url = `http://localhost:8080/api/calc?P=${P}&r=${r}&bulan=${bulan}`;
    const resp = await fetch(url);
    const json = await resp.json();

    renderResults(json);
});
function renderResults(json) {
    resultsSection.style.display = 'block';
    summaryEl.textContent = `P=${json.P}, r=${json.r} (per bulan), sampai n=${json.bulan} bulan`;

    tableBody.innerHTML = '';
    const labels = [];
    const dataIt = [];
    const dataRe = [];
    const dataTimeIt = [];
    const dataTimeRe = [];

    json.data.forEach(row => {
        const timeIterms = row.time_iter_ms;
        const timeRekms = row.time_rek_ms;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center">${row.bulan}</td>
            <td>${row.iterative.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            <td>${row.recursive.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            <td>${timeIterms.toFixed(6)} ms</td>
            <td>${timeRekms.toFixed(6)} ms</td>
        `;
        tableBody.appendChild(tr);

        labels.push(row.bulan);
        dataIt.push(row.iterative);
        dataRe.push(row.recursive);
        dataTimeIt.push(timeIterms);
        dataTimeRe.push(timeRekms);
    });

    if (chart) chart.destroy();
    chart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Time Iterative', data: dataTimeIt, fill:false, tension:0.2 },
                { label: 'Time Recursive', data: dataTimeRe, fill:false, tension:0.2 }
            ]
        },
        options: {
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                legend: { display: true },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw;
                            return context.dataset.label + ': ' + value.toFixed(6);
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(6);
                        }
                    }
                }
            }
        }

    });
}

