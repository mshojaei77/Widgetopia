import React, { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import './TodoList.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Load todos from storage on initial render
  useEffect(() => {
    const loadTodos = async () => {
      try {
        // Use Chrome's storage API if available, otherwise use mock data
        if (chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.get(['todos'], (result) => {
            if (result.todos) {
              setTodos(result.todos);
            } else {
              // Set some default todos
              setTodos([
                { id: 1, text: 'Build a Chrome Extension', completed: false },
                { id: 2, text: 'Learn React with TypeScript', completed: true },
                { id: 3, text: 'Try Bun for JavaScript tooling', completed: false }
              ]);
            }
          });
        } else {
          // Mock data for development outside of Chrome extension
          setTodos([
            { id: 1, text: 'Build a Chrome Extension', completed: false },
            { id: 2, text: 'Learn React with TypeScript', completed: true },
            { id: 3, text: 'Try Bun for JavaScript tooling', completed: false }
          ]);
        }
      } catch (error) {
        console.error('Error loading todos:', error);
        // Fallback to default todos
        setTodos([
          { id: 1, text: 'Build a Chrome Extension', completed: false },
          { id: 2, text: 'Learn React with TypeScript', completed: true },
          { id: 3, text: 'Try Bun for JavaScript tooling', completed: false }
        ]);
      }
    };

    loadTodos();
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    if (todos.length > 0) {
      try {
        if (chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.set({ todos });
        }
      } catch (error) {
        console.error('Error saving todos:', error);
      }
    }
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;

    const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <Widget title="Todo List" className="todo-widget">
      <form className="todo-form" onSubmit={addTodo}>
        <input
          type="text"
          className="todo-input"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit" className="todo-add-btn">Add</button>
      </form>
      
      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="todo-empty">No tasks yet. Add one above!</li>
        ) : (
          todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="todo-checkbox"
              />
              <span className="todo-text">{todo.text}</span>
              <button 
                className="todo-delete-btn"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete task"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </Widget>
  );
};

export default TodoList; 