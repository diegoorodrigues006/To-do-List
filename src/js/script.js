const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const timeInput = document.getElementById('todo-time');
const priorityInput = document.getElementById('todo-priority');
const todoList = document.getElementById('todo-list');
const todoIdInput = document.getElementById('todo-id');
const btnSubmit = document.getElementById('btn-submit');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');
const currentDateDisplay = document.getElementById('current-date-display');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Inicializar data de hoje e hora padrão nos inputs
const todayStr = new Date().toISOString().split('T')[0];
dateInput.value = todayStr;
timeInput.value = "12:00";

updateCurrentDateHeader();

// Verificar Dark Mode salvo anteriormente
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

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

// Botões de Filtro
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

// Adicionar ou Atualizar Tarefa (CRUD)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const priority = priorityInput.value;
    const id = todoIdInput.value;

    if (!text || !date || !time) return;

    if (id) {
        // UPDATE
        todos = todos.map(todo => {
            if (todo.id == id) {
                return { ...todo, text, date, time, priority };
            }
            return todo;
        });
        todoIdInput.value = '';
        btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Evento';
    } else {
        // CREATE
        const newTodo = {
            id: Date.now(),
            text,
            date,
            time,
            priority,
            completed: false
        };
        todos.push(newTodo);
    }

    form.reset();
    dateInput.value = todayStr;
    timeInput.value = "12:00";
    saveAndRender();
});

// Renderizar Tarefas
function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos.filter(todo => {
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    // Ordenar cronologicamente por data e hora
    filteredTodos.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="empty-state">Nenhum evento encontrado nesta categoria.</li>`;
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;

        const formattedDate = formatDate(todo.date);

        li.innerHTML = `
            <div class="todo-info" onclick="toggleComplete(${todo.id})" title="Marcar como concluída">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <div class="todo-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>
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
    renderTodos();
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function updateCurrentDateHeader() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const now = new Date();
    currentDateDisplay.innerText = "Hoje: " + now.toLocaleDateString('pt-BR', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}