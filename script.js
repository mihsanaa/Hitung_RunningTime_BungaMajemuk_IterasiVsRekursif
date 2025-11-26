const form = document.getElementById('form');
const resultsSection = document.getElementById('results');
const summaryEl = document.getElementById('summary');
const tableBody = document.getElementById('tableBody');
const chartCtx = document.getElementById('chart').getContext('2d');
let chart = null;
alert ("hati hati web scam");
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

    // table
    tableBody.innerHTML = '';
    const labels = [];
    const dataIt = [];
    const dataRe = [];

    json.data.forEach(row => {
        const tr = document.createElement('tr');
        const timeIterms = row.time_iter_ms;
        const timeRekms = row.time_rek_ms;

    tr.innerHTML = `
    <td style="text-align:center">${row.bulan}</td>
    <td>${row.iterative.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
    <td>${row.recursive.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
    <td>${timeIterms.toFixed(7)} ms</td>
    <td>${timeRekms.toFixed(7)} ms</td>
`;

        tableBody.appendChild(tr);

        labels.push(row.bulan);
        dataIt.push(row.iterative);
        dataRe.push(row.recursive);
    });

    if (chart) chart.destroy();
    chart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Iterative', data: dataIt, fill:false, tension:0.2 },
                { label: 'Recursive', data: dataRe, fill:false, tension:0.2 }
            ]
        },
        options: {
            interaction: { mode:'index', intersect:false },
            plugins: { legend: { display:true } },
            scales: { y: { beginAtZero: false } }
        }
    });
}
