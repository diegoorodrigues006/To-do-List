const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const timeInput = document.getElementById('todo-time');
const priorityInput = document.getElementById('todo-priority');
const categoryInput = document.getElementById('todo-category');
const searchInput = document.getElementById('search-input'); // Novo elemento de busca
const todoList = document.getElementById('todo-list');
const todoIdInput = document.getElementById('todo-id');
const btnSubmit = document.getElementById('btn-submit');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');
const currentDateDisplay = document.getElementById('current-date-display');

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

renderCalendar();
renderTodos();

// Alternar Dark Mode
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});

// Evento da Barra de Pesquisa em Tempo Real
searchInput.addEventListener('input', () => {
    renderTodos();
});

// Navegação do Mini Calendário
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

// Renderizar Mini Calendário Interativo
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

        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDay = String(i).padStart(2, '0');
        const thisDateStr = `${year}-${formattedMonth}-${formattedDay}`;

        if (thisDateStr === todayStr) {
            dayDiv.classList.add('today');
        }

        if (thisDateStr === selectedDateFilter) {
            dayDiv.classList.add('selected');
        }

        const hasTask = todos.some(t => t.date === thisDateStr);
        if (hasTask) {
            dayDiv.classList.add('has-event');
        }

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

// Botões de Filtro de Status
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

// Adicionar ou Atualizar Tarefa
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
            if (todo.id == id) {
                return { ...todo, text, date, time, priority, category };
            }
            return todo;
        });
        todoIdInput.value = '';
        btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Evento';
    } else {
        const newTodo = {
            id: Date.now(),
            text,
            date,
            time,
            priority,
            category,
            completed: false
        };
        todos.push(newTodo);
    }

    form.reset();
    dateInput.value = todayStr;
    timeInput.value = "12:00";
    saveAndRender();
});

// Renderizar Tarefas (com Filtro de Pesquisa em Tempo Real)
function renderTodos() {
    todoList.innerHTML = '';

    const searchQuery = searchInput.value.toLowerCase().trim();

    let filteredTodos = todos.filter(todo => {
        // Filtro por texto da barra de pesquisa
        if (searchQuery && !todo.text.toLowerCase().includes(searchQuery)) {
            return false;
        }

        // Filtro por data selecionada no calendário
        if (selectedDateFilter && todo.date !== selectedDateFilter) return false;

        // Filtro por status
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
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
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