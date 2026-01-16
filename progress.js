// API Configuration
const API_URL = 'http://localhost:3000/api/progress';

// Prompt for password
const askPassword = (action) => {
    const password = prompt(`🔒 Digite a senha para ${action}:`);
    return password;
};

// Get all progress data from server
const getProgressData = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('❌ Erro ao carregar dados. Certifique-se de que o servidor está rodando (npm start)');
        return [];
    }
};

// Save progress data to server (requires password)
const saveProgressData = async (data, password) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Password': password
            },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            throw new Error('INVALID_PASSWORD');
        }

        if (!response.ok) throw new Error('Failed to save data');
        return await response.json();
    } catch (error) {
        console.error('Error saving data:', error);
        if (error.message === 'INVALID_PASSWORD') {
            alert('❌ Senha incorreta!');
        } else {
            alert('❌ Erro ao salvar dados');
        }
        throw error;
    }
};

// Add new entry via API (requires password)
const addEntry = async (date, weight, bodyFat, password) => {
    try {
        const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Password': password
            },
            body: JSON.stringify({ date, weight, bodyFat })
        });

        if (response.status === 401) {
            throw new Error('INVALID_PASSWORD');
        }

        if (!response.ok) throw new Error('Failed to add entry');

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error adding entry:', error);
        if (error.message === 'INVALID_PASSWORD') {
            alert('❌ Senha incorreta!');
        } else {
            alert('❌ Erro ao adicionar medição');
        }
        throw error;
    }
};

// Delete entry via API (requires password)
const deleteEntry = async (id, password) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Password': password
            }
        });

        if (response.status === 401) {
            throw new Error('INVALID_PASSWORD');
        }

        if (!response.ok) throw new Error('Failed to delete entry');

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error deleting entry:', error);
        if (error.message === 'INVALID_PASSWORD') {
            alert('❌ Senha incorreta!');
        } else {
            alert('❌ Erro ao excluir medição');
        }
        throw error;
    }
};

// Export data to JSON file
const exportData = async () => {
    const data = await getProgressData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diet_progress_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
};

// Import data from JSON file
const importData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Validate data structure
                if (!Array.isArray(importedData)) {
                    reject(new Error('Formato de arquivo inválido'));
                    return;
                }

                // Validate each entry
                for (const entry of importedData) {
                    if (!entry.date || !entry.weight || !entry.bodyFat) {
                        reject(new Error('Dados incompletos no arquivo'));
                        return;
                    }
                }

                // Save imported data
                await saveProgressData(importedData);
                resolve(importedData);
            } catch (error) {
                reject(new Error('Erro ao ler arquivo: ' + error.message));
            }
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };

        reader.readAsText(file);
    });
};

// Calculate lean mass
const calculateLeanMass = (weight, bodyFatPercent) => {
    const fatMass = (weight * bodyFatPercent) / 100;
    return weight - fatMass;
};

// Calculate fat mass
const calculateFatMass = (weight, bodyFatPercent) => {
    return (weight * bodyFatPercent) / 100;
};

// Format date for display
const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Update stats cards
const updateStatsCards = async () => {
    const data = await getProgressData();

    if (data.length === 0) {
        document.getElementById('currentWeight').textContent = '--';
        document.getElementById('currentFat').textContent = '--';
        document.getElementById('leanMass').textContent = '--';
        document.getElementById('goalRemaining').textContent = '--';
        return;
    }

    const latest = data[0];
    const previous = data[1];

    const goalWeight = 85.0;
    const leanMass = calculateLeanMass(latest.weight, latest.bodyFat);
    const goalRemaining = latest.weight - goalWeight;

    // Update values
    document.getElementById('currentWeight').textContent = `${latest.weight.toFixed(1)} kg`;
    document.getElementById('currentFat').textContent = `${latest.bodyFat.toFixed(1)}%`;
    document.getElementById('leanMass').textContent = `${leanMass.toFixed(1)} kg`;
    document.getElementById('goalRemaining').textContent = `${goalRemaining.toFixed(1)} kg`;

    // Update changes
    if (previous) {
        const weightChange = latest.weight - previous.weight;
        const fatChange = latest.bodyFat - previous.bodyFat;
        const previousLean = calculateLeanMass(previous.weight, previous.bodyFat);
        const leanChange = leanMass - previousLean;

        const weightChangeEl = document.getElementById('weightChange');
        weightChangeEl.textContent = `${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)} kg`;
        weightChangeEl.className = `stat-change ${weightChange <= 0 ? 'positive' : 'negative'}`;

        const fatChangeEl = document.getElementById('fatChange');
        fatChangeEl.textContent = `${fatChange >= 0 ? '+' : ''}${fatChange.toFixed(1)}%`;
        fatChangeEl.className = `stat-change ${fatChange <= 0 ? 'positive' : 'negative'}`;

        const leanChangeEl = document.getElementById('leanChange');
        leanChangeEl.textContent = `${leanChange >= 0 ? '+' : ''}${leanChange.toFixed(1)} kg`;
        leanChangeEl.className = `stat-change ${leanChange >= 0 ? 'positive' : 'negative'}`;
    }
};

// Update history table
const updateHistoryTable = async () => {
    const data = await getProgressData();
    const tbody = document.getElementById('historyTableBody');
    const emptyState = document.getElementById('emptyState');

    if (data.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = data.map((entry, index) => {
        const fatMass = calculateFatMass(entry.weight, entry.bodyFat);
        const leanMass = calculateLeanMass(entry.weight, entry.bodyFat);

        let variation = '';
        if (index < data.length - 1) {
            const prev = data[index + 1];
            const diff = entry.weight - prev.weight;
            const diffClass = diff <= 0 ? 'positive' : 'negative';
            variation = `<span class="stat-change ${diffClass}">${diff >= 0 ? '+' : ''}${diff.toFixed(1)} kg</span>`;
        } else {
            variation = '<span style="color: var(--text-secondary);">Primeira medição</span>';
        }

        return `
            <tr>
                <td>${formatDate(entry.date)}</td>
                <td>${entry.weight.toFixed(1)} kg</td>
                <td>${entry.bodyFat.toFixed(1)}%</td>
                <td>${fatMass.toFixed(1)} kg</td>
                <td>${leanMass.toFixed(1)} kg</td>
                <td>${variation}</td>
                <td>
                    <button class="delete-btn" onclick="handleDelete(${entry.id})"> Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
};

// Chart instances
let weightChart = null;
let bodyCompositionChart = null;

// Update weight chart
const updateWeightChart = async () => {
    const data = await getProgressData();

    if (data.length === 0) {
        if (weightChart) {
            weightChart.destroy();
            weightChart = null;
        }
        return;
    }

    // Reverse data for chronological order in chart
    const chartData = [...data].reverse();

    const ctx = document.getElementById('weightChart').getContext('2d');

    if (weightChart) {
        weightChart.destroy();
    }

    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(entry => formatDate(entry.date)),
            datasets: [{
                label: 'Peso (kg)',
                data: chartData.map(entry => entry.weight),
                borderColor: '#58a6ff',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#58a6ff',
                pointBorderColor: '#0d1117',
                pointBorderWidth: 2
            }, {
                label: 'Meta (85 kg)',
                data: chartData.map(() => 85),
                borderColor: '#d2a8ff',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#c9d1d9',
                        font: {
                            family: "'Fira Code', monospace",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    titleColor: '#c9d1d9',
                    bodyColor: '#c9d1d9',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    titleFont: {
                        family: "'Fira Code', monospace"
                    },
                    bodyFont: {
                        family: "'Fira Code', monospace"
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: '#30363d'
                    },
                    ticks: {
                        color: '#8b949e',
                        font: {
                            family: "'Fira Code', monospace"
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#30363d'
                    },
                    ticks: {
                        color: '#8b949e',
                        font: {
                            family: "'Fira Code', monospace"
                        }
                    }
                }
            }
        }
    });
};

// Update body fat percentage chart
const updateBodyCompositionChart = async () => {
    const data = await getProgressData();

    if (data.length === 0) {
        if (bodyCompositionChart) {
            bodyCompositionChart.destroy();
            bodyCompositionChart = null;
        }
        return;
    }

    // Reverse data for chronological order in chart
    const chartData = [...data].reverse();

    const ctx = document.getElementById('bodyCompositionChart').getContext('2d');

    if (bodyCompositionChart) {
        bodyCompositionChart.destroy();
    }

    bodyCompositionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(entry => formatDate(entry.date)),
            datasets: [{
                label: '% Gordura',
                data: chartData.map(entry => entry.bodyFat),
                borderColor: '#f78166',
                backgroundColor: 'rgba(247, 129, 102, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#f78166',
                pointBorderColor: '#0d1117',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#c9d1d9',
                        font: {
                            family: "'Fira Code', monospace",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    titleColor: '#c9d1d9',
                    bodyColor: '#c9d1d9',
                    borderColor: '#30363d',
                    borderWidth: 1,
                    titleFont: {
                        family: "'Fira Code', monospace"
                    },
                    bodyFont: {
                        family: "'Fira Code', monospace"
                    },
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: '#30363d'
                    },
                    ticks: {
                        color: '#8b949e',
                        font: {
                            family: "'Fira Code', monospace"
                        },
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#30363d'
                    },
                    ticks: {
                        color: '#8b949e',
                        font: {
                            family: "'Fira Code', monospace"
                        }
                    }
                }
            }
        }
    });
};

// Update all displays
const updateAllDisplays = async () => {
    await updateStatsCards();
    await updateHistoryTable();
    await updateWeightChart();
    await updateBodyCompositionChart();
};

// Handle form submission
document.getElementById('progressForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = document.getElementById('date').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const bodyFat = parseFloat(document.getElementById('bodyFat').value);

    if (!date || !weight || !bodyFat) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (weight <= 0 || bodyFat <= 0 || bodyFat >= 100) {
        alert('Por favor, insira valores válidos!');
        return;
    }

    try {
        // Ask for password
        const password = askPassword('adicionar medição');
        if (!password) {
            alert('❌ Operação cancelada');
            return;
        }

        await addEntry(date, weight, bodyFat, password);
        await updateAllDisplays();

        // Reset form
        document.getElementById('progressForm').reset();
        document.getElementById('date').valueAsDate = new Date();

        // Show success message
        const btn = document.querySelector('#progressForm .btn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Salvo com sucesso!';
        btn.style.background = '#7ee787';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});

// Handle delete
window.handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta medição?')) {
        // Ask for password
        const password = askPassword('excluir medição');
        if (!password) {
            alert('❌ Operação cancelada');
            return;
        }

        try {
            await deleteEntry(id, password);
            await updateAllDisplays();
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    }
};

// Handle export
window.handleExport = async () => {
    try {
        await exportData();
        alert('✅ Backup exportado com sucesso!\n\nSalve este arquivo em um local seguro (Google Drive, Dropbox, etc.)');
    } catch (error) {
        alert('❌ Erro ao exportar dados: ' + error.message);
    }
};

// Handle import
window.handleImport = async (event) => {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    try {
        const importedData = await importData(file);
        await updateAllDisplays();
        alert(`✅ Backup restaurado com sucesso!\n\n${importedData.length} medições foram importadas.`);

        // Reset file input
        event.target.value = '';
    } catch (error) {
        alert('❌ ' + error.message);
        event.target.value = '';
    }
};

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Initialize
updateAllDisplays();
