// Añadir en el head del HTML:
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// Función para generar datos aleatorios con tendencia alcista
function generateTrendingData(start, end, points, volatility = 0.2) {
    const data = [];
    const step = (end - start) / (points - 1);
    
    for (let i = 0; i < points; i++) {
        // Calcular el valor base con tendencia
        const baseValue = start + (step * i);
        
        // Añadir aleatoriedad controlada
        const randomFactor = (Math.random() - 0.3) * volatility * baseValue;
        
        // Asegurar que el valor no baja demasiado
        const value = Math.max(baseValue + randomFactor, baseValue * 0.9);
        
        data.push(Math.round(value));
    }
    
    return data;
}

// Función para generar datos más dinámicos
function generateRandomData(baseValues, volatility) {
    return baseValues.map((base, index) => {
        const trend = index * (volatility / 2); // Tendencia alcista
        const random = (Math.random() - 0.3) * volatility * base;
        return Math.round(base + trend + random);
    });
}

// Inicialización de componentes del dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard script loading...');

    // Generar datos más dinámicos
    const incidenciasData = generateRandomData([15, 17, 19, 21, 23, 25], 3);
    const comisionesData = generateRandomData([25, 35, 45, 55, 65, 75], 3);

    // Gráfica de Incidencias
    new Chart(document.getElementById('incidenciasChart'), {
        type: 'line',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            datasets: [{
                data: incidenciasData,
                borderColor: '#ECA408',
                backgroundColor: 'rgba(236, 164, 8, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#ECA408',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ECA408',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });

    // Gráfica de Comisiones
    new Chart(document.getElementById('comisionesChart'), {
        type: 'bar',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            datasets: [{
                data: comisionesData,
                backgroundColor: [
                    'rgba(236, 164, 8, 0.5)',
                    'rgba(236, 164, 8, 0.6)',
                    'rgba(236, 164, 8, 0.7)',
                    'rgba(236, 164, 8, 0.8)',
                    'rgba(236, 164, 8, 0.9)',
                    'rgba(236, 164, 8, 1.0)'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '€';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 80,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '€';
                        }
                    }
                }
            }
        }
    });

    initSidebar();
    initUserMenu();
    initDashboardTabs();
}); 