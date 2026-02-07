const state = {
    currentDate: new Date(2026, 1, 1), // Feb 2026
    tasks: [],
    achievements: [],
    protocols: {}
};

// DOM Elements
const currentMonthElement = document.getElementById('current-month');
const monthInfoElement = document.getElementById('month-info');
const tasksList = document.getElementById('tasks-list');
const protocolsTable = document.getElementById('protocols-table');
const chartContainer = document.getElementById('chart-container');
const reportModal = document.getElementById('report-modal');

function init() {
    loadFromLocalStorage();
    updateMonthDisplay();
    renderTasks();
    renderAchievements();
    generateProtocolsTable();
    renderChart();
    setupEventListeners();
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('productivityTrackerState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.currentDate = new Date(parsed.currentDate);
        state.tasks = parsed.tasks || [];
        state.achievements = parsed.achievements || [];
        state.protocols = parsed.protocols || {};
    }
}

function saveToLocalStorage() {
    localStorage.setItem('productivityTrackerState', JSON.stringify(state));
}

function updateMonthDisplay() {
    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    currentMonthElement.textContent = `${months[month]} ${year}`;
    monthInfoElement.textContent = `${daysInMonth} days • ${Math.ceil(daysInMonth / 7)} weeks`;
}

function renderTasks() {
    tasksList.innerHTML = '';
    state.tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `<span>${task.name}</span><button class="delete-btn" onclick="deleteTask(${index})"><i class="fas fa-times"></i></button>`;
        tasksList.appendChild(li);
    });
}

function generateProtocolsTable() {
    protocolsTable.innerHTML = '';
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    let headerHTML = '<tr><th>TASK</th>';
    for (let d = 1; d <= days; d++) {
        headerHTML += `<th>${d}</th>`;
    }
    headerHTML += '</tr>';
    protocolsTable.innerHTML = headerHTML;

    state.tasks.forEach((task, tIdx) => {
        const row = document.createElement('tr');
        let rowHTML = `<td class="task-name-cell">${task.name}</td>`;
        for (let d = 1; d <= days; d++) {
            const key = `${tIdx}-${year}-${month}-${d}`;
            const checked = state.protocols[key] ? 'checked' : '';
            rowHTML += `<td><input type="checkbox" class="day-checkbox" data-key="${key}" ${checked} onchange="toggleProtocol('${key}', this.checked)"></td>`;
        }
        row.innerHTML = rowHTML;
        protocolsTable.appendChild(row);
    });
}

function toggleProtocol(key, isChecked) {
    state.protocols[key] = isChecked;
    saveToLocalStorage();
    renderChart();
}

function renderChart() {
    chartContainer.innerHTML = '';
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= days; d++) {
        let done = 0;
        state.tasks.forEach((_, tIdx) => {
            if (state.protocols[`${tIdx}-${year}-${month}-${d}`]) done++;
        });

        const percent = state.tasks.length ? Math.round((done / state.tasks.length) * 100) : 0;
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.left = `${60 + (d - 1) * 25}px`;
        bar.style.height = `${percent * 2}px`;
        bar.style.width = `20px`;
        bar.style.backgroundColor = percent >= 80 ? 'var(--chart-good)' : (percent >= 50 ? 'var(--chart-medium)' : 'var(--chart-poor)');
        chartContainer.appendChild(bar);
    }
}

function setupEventListeners() {
    document.getElementById('add-task-btn').onclick = () => {
        const group = document.getElementById('task-input-group');
        group.style.display = group.style.display === 'none' ? 'flex' : 'none';
    };

    document.getElementById('save-task-btn').onclick = () => {
        const input = document.getElementById('task-input');
        if (input.value.trim()) {
            state.tasks.push({ name: input.value.trim() });
            input.value = '';
            renderTasks();
            generateProtocolsTable();
            renderChart();
            saveToLocalStorage();
        }
    };

    document.getElementById('generate-report').onclick = () => {
        reportModal.style.display = 'flex';
        // Summary logic here
    };

    document.getElementById('close-modal').onclick = () => reportModal.style.display = 'none';
}

window.deleteTask = (index) => {
    state.tasks.splice(index, 1);
    renderTasks();
    generateProtocolsTable();
    renderChart();
    saveToLocalStorage();
};

document.addEventListener('DOMContentLoaded', init);