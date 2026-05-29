// State Management
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const todoPriority = document.getElementById('todo-priority');
const todoTag = document.getElementById('todo-tag');
const todoList = document.getElementById('todo-list');
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progress-text');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    setupEventListeners();
});

function setupEventListeners() {
    todoForm.addEventListener('submit', addTodo);
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Filter Event Listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderTodos();
        });
    });
}

// Add New Todo
function addTodo(e) {
    e.preventDefault();

    const todoText = todoInput.value.trim();
    if (!todoText) return;

    const newTodo = {
        id: Date.now(),
        text: todoText,
        dueDate: todoDate.value || 'No Due Date',
        priority: todoPriority.value,
        tag: todoTag.value,
        completed: false
    };

    todos.push(newTodo);
    saveAndUpdate();
    todoForm.reset();
}

// Toggle Complete Status
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveAndUpdate();
}

// Delete Todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndUpdate();
}

// Clear All Completed Todos
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveAndUpdate();
}

// Global Save and Sync
function saveAndUpdate() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

// Update Progress Bar
function updateProgress() {
    if (todos.length === 0) {
        progressBar.style.width = '0%';
        progressText.innerText = '0% Completed';
        return;
    }

    const completedCount = todos.filter(t => t.completed).length;
    const percentage = Math.round((completedCount / todos.length) * 100);
    
    progressBar.style.width = `${percentage}%`;
    progressText.innerText = `${percentage}% Completed (${completedCount}/${todos.length} tasks)`;
}

// Render UI dynamically
function renderTodos() {
    todoList.innerHTML = '';

    // Filter array based on current selection
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 20px;">No tasks found.</p>`;
        updateProgress();
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="todo-left">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-details">
                    <span class="todo-text">${escapeHTML(todo.text)}</span>
                    <div class="todo-meta">
                        <span class="todo-tag">${todo.tag}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${todo.dueDate}</span>
                    </div>
                </div>
            </div>
            <button class="delete-btn"><i class="fa-regular fa-trash-can"></i></button>
        `;

        // Checkbox event logic
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleComplete(todo.id));

        // Delete button logic
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        todoList.appendChild(li);
    });

    updateProgress();
}

// Helper to prevent XSS vulnerability injections
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}