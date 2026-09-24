const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoIdInput = document.getElementById('todo-id');
const btnSubmit = document.getElementById('btn-submit');

// Carrega as tarefas salvas no LocalStorage ou inicia um array vazio
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Renderiza as tarefas na tela assim que o script carrega
renderTodos();

// Evento de submit (Criar ou Atualizar)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = input.value.trim();
    const id = todoIdInput.value;

    if (!text) return;

    if (id) {
        // UPDATE (Editar tarefa existente)
        todos = todos.map(todo => {
            if (todo.id == id) {
                return { ...todo, text };
            }
            return todo;
        });
        todoIdInput.value = '';
        btnSubmit.innerText = 'Adicionar';
    } else {
        // CREATE (Adicionar nova tarefa)
        const newTodo = {
            id: Date.now(), // ID único baseado no timestamp atual
            text,
            completed: false
        };
        todos.push(newTodo);
    }

    input.value = '';
    saveAndRender();
});

// Função para renderizar o array de tarefas no HTML (READ)
function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<p style="text-align: center; color: #888;">Nenhuma tarefa cadastrada.</p>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <span class="todo-text" onclick="toggleComplete(${todo.id})">${todo.text}</span>
            <div class="todo-actions">
                <button class="btn-edit" onclick="editTodo(${todo.id})">Editar</button>
                <button class="btn-delete" onclick="deleteTodo(${todo.id})">Excluir</button>
            </div>
        `;

        todoList.appendChild(li);
    });
}

// UPDATE: Alternar status de concluído
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveAndRender();
}

// UPDATE: Preparar formulário para edição
function editTodo(id) {
    const todoToEdit = todos.find(todo => todo.id === id);
    if (todoToEdit) {
        input.value = todoToEdit.text;
        todoIdInput.value = todoToEdit.id;
        btnSubmit.innerText = 'Salvar';
        input.focus();
    }
}

// DELETE: Excluir tarefa
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRender();
}

// Salva no LocalStorage e atualiza a tela
function saveAndRender() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}