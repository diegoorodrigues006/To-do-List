const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const timeInput = document.getElementById('todo-time');
const priorityInput = document.getElementById('todo-priority');
const categoryInput = document.getElementById('todo-category');
const searchInput = document.getElementById('search-input');
const todoList = document.getElementById('todo-list');
const todoIdInput = document.getElementById('todo-id');
const btnSubmit = document.getElementById('btn-submit');
const themeToggle = document.getElementById('theme-toggle');
const notificationToggle = document.getElementById('notification-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');
const currentDateDisplay = document.getElementById('current-date-display');

// Elementos do Dashboard
const statTotal = document.getElementById('stat-total');
const statCompleted = document.getElementById('stat-completed');
const statPending = document.getElementById('stat-pending');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Elementos do Mini Calendário
const calendarDaysEl = document.getElementById('calendar-days');
const monthYearDisplay = document.getElementById('month-year-display');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const clearDateFilterBtn = document.getElementById('clear-date-filter');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let selectedDateFilter = null; 
let currentDateNav = new Date();

const todayStr = new Date().toISOString().split('T')[0];
dateInput.value = todayStr;
timeInput.value = "12:00";

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

if (Notification.permission === 'granted') {
    notificationToggle.style.color = 'var(--primary-color)';
}

renderCalendar();
renderTodos();

notificationToggle.addEventListener('click', () => {
    if (!('Notification' in window)) {
        alert('Este navegador não suporta notificações de desktop.');
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('Agenda & Tarefas', { body: 'Notificações ativadas com sucesso!' });
            notificationToggle.style.color = 'var(--primary-color)';
        } else {
            alert('Permissão de notificação negada.');
        }
    });
});

setInterval(() => {
    if (Notification.permission !== 'granted') return;
    const now = new Date();
    const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    todos.forEach(todo => {
        if (!todo.completed && todo.date === currentDateStr && todo.time === currentTimeStr && !todo.notified) {
            new Notification('⏰ Lembrete de Compromisso', {
                body: `Evento: "${todo.text}" (${todo.category}) está a começar!`,
                icon: 'https://cdn-icons-png.flaticon.com/512/3236/3236949.png'
            });
            todo.notified = true;
        }
    });
}, 30000);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});

searchInput.addEventListener('input', () => renderTodos());

prevMonthBtn.addEventListener('click', () => {
    currentDateNav.setMonth(currentDateNav.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDateNav.setMonth(currentDateNav.getMonth() + 1);
    renderCalendar();
});

clearDateFilterBtn.addEventListener('click', () => {
    selectedDateFilter = null;
    clearDateFilterBtn.style.display = 'none';
    currentDateDisplay.innerText = "Exibindo todas as tarefas";
    renderCalendar();
    renderTodos();
});

function renderCalendar() {
    calendarDaysEl.innerHTML = '';
    const year = currentDateNav.getFullYear();
    const month = currentDateNav.getMonth();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    monthYearDisplay.innerText = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    for (let i = firstDayIndex; i > 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day inactive';
        dayDiv.innerText = prevTotalDays - i + 1;
        calendarDaysEl.appendChild(dayDiv);
    }

    for (let i = 1; i <= totalDays; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = i;

        const thisDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        if (thisDateStr === todayStr) dayDiv.classList.add('today');
        if (thisDateStr === selectedDateFilter) dayDiv.classList.add('selected');
        if (todos.some(t => t.date === thisDateStr)) dayDiv.classList.add('has-event');

        dayDiv.addEventListener('click', () => {
            selectedDateFilter = thisDateStr;
            clearDateFilterBtn.style.display = 'block';
            currentDateDisplay.innerText = `Eventos em: ${formatDate(thisDateStr)}`;
            renderCalendar();
            renderTodos();
        });

        calendarDaysEl.appendChild(dayDiv);
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const priority = priorityInput.value;
    const category = categoryInput.value;
    const id = todoIdInput.value;

    if (!text || !date || !time) return;

    if (id) {
        todos = todos.map(todo => {
            if (todo.id == id) return { ...todo, text, date, time, priority, category, notified: false };
            return todo;
        });
        todoIdInput.value = '';
        btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Evento';
    } else {
        todos.push({
            id: Date.now(),
            text, date, time, priority, category,
            completed: false, notified: false
        });
    }

    form.reset();
    dateInput.value = todayStr;
    timeInput.value = "12:00";
    saveAndRender();
});

// NOVA FUNÇÃO: Atualiza o Dashboard dinamicamente
function updateDashboard() {
    let tasksToCount = todos;
    
    // Se o calendário estiver filtrando uma data, o dashboard mostra o progresso só desse dia
    if (selectedDateFilter) {
        tasksToCount = todos.filter(t => t.date === selectedDateFilter);
    }

    const total = tasksToCount.length;
    const completed = tasksToCount.filter(t => t.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    statTotal.innerText = total;
    statCompleted.innerText = completed;
    statPending.innerText = pending;
    
    progressBar.style.width = `${percentage}%`;
    progressText.innerText = `${percentage}% Concluído`;
}

function renderTodos() {
    todoList.innerHTML = '';
    
    // Chamamos a atualização do Dashboard antes de aplicar os filtros visuais de pesquisa
    updateDashboard();

    const searchQuery = searchInput.value.toLowerCase().trim();

    let filteredTodos = todos.filter(todo => {
        if (searchQuery && !todo.text.toLowerCase().includes(searchQuery)) return false;
        if (selectedDateFilter && todo.date !== selectedDateFilter) return false;
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    filteredTodos.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="empty-state">Nenhum evento encontrado.</li>`;
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="todo-info" onclick="toggleComplete(${todo.id})" title="Marcar como concluída">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <div class="todo-meta">
                    <span class="category-badge">${escapeHtml(todo.category)}</span>
                    <span><i class="fa-regular fa-calendar"></i> ${formatDate(todo.date)}</span>
                    <span><i class="fa-regular fa-clock"></i> ${todo.time}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="btn-edit" onclick="editTodo(${todo.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-delete" onclick="deleteTodo(${todo.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) return { ...todo, completed: !todo.completed };
        return todo;
    });
    saveAndRender();
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        input.value = todo.text;
        dateInput.value = todo.date;
        timeInput.value = todo.time;
        priorityInput.value = todo.priority;
        categoryInput.value = todo.category || 'Pessoal';
        todoIdInput.value = todo.id;
        btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Alteração';
        input.focus();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderCalendar();
    renderTodos();
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}