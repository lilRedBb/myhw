import React from 'react';
import { renderHook, act, render, screen, fireEvent, useState } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TodoList from './ToDoList';

describe('TodoList Component', () => {
  test('renders without crashing', () => {
    render(<TodoList />);
  });

  test('renders the title', () => {
    render(<TodoList />);
    const titleElement = screen.getByText(/Assignment 3: ToDo List/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders form elements', () => {
    render(<TodoList />);
    const todoInput = screen.getByPlaceholderText(/Add todo item/i);
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    const addButton = screen.getByText(/Add Todo item/i);

    expect(todoInput).toBeInTheDocument();
    expect(dueDateInput).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
  });

  test('renders todo items', () => {
    render(<TodoList />);
    const todoItems = screen.getAllByRole('tab');
    expect(todoItems.length).toBe(1); // Assuming there are 4 todos in the initial state
  });

  test('renders todo items with correct titles', () => {
    render(<TodoList />);
    const todoTitles = ['Todo 1', 'Todo 2', 'Todo 3', 'Todo 4'];
    todoTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  const getVariant = (dueDate) => {
    const currentDate = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = Math.abs(dueDateObj - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays > 7) return 'primary';
    if (diffDays <= 7 && diffDays > 4) return 'success';
    if (diffDays <= 4 && diffDays > 2) return 'warning';
    return 'danger';
  };
  
  test('applies correct variant based on due date', () => {
    render(<TodoList />);
    const todoPane = document.querySelectorAll('[role="tabpanel"]');
    const todoItems = todoPane[0].children;
  
    let variants = [];
    for (let i = 0; i < todoItems.length; i++) {
      const input = todoItems[i].querySelector('input');
      const dueDate = input.getAttribute('value');
      const expectedVariant = getVariant(dueDate);
      //variants.push(expectedVariant);
      expect(todoItems[i]).toHaveClass(`list-group-item-${expectedVariant}`);
    }

   });

  test('adds a new todo list', () => {
    render(<TodoList />);
    const listInput = screen.getByPlaceholderText(/Add new list/i);
    const addListButton = screen.getByText(/Add New List/i);

    fireEvent.change(listInput, { target: { value: 'New List' } });
    fireEvent.click(addListButton);

    const todoLists = screen.getAllByRole('tab');
    expect(todoLists.length).toBe(2);
  });


  test('adds a new todo item', () => {
    render(<TodoList />);
    const todoInput = screen.getByPlaceholderText(/Add todo item/i);
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    const addButton = screen.getByText(/Add Todo item/i);

    fireEvent.change(todoInput, { target: { value: 'New Todo' } });
    fireEvent.change(dueDateInput, { target: { value: '2021-10-10' } });
    fireEvent.click(addButton);

    const todoPane = document.querySelectorAll('[role="tabpanel"]');
    const todoItems = todoPane[0].children;
    expect(todoItems.length).toBe(5);

  });

  test('moves a todo item to another list', () => {
    render(<TodoList />);

    const listInput = screen.getByPlaceholderText(/Add new list/i);
    const addListButton = screen.getByText(/Add New List/i);

    const listName = 'Another List';
    fireEvent.change(listInput, { target: { value: listName } });
    fireEvent.click(addListButton);

    const todoLists = screen.getAllByRole('tab');
    expect(todoLists.length).toBe(2);

    const todoPane = document.querySelector('[id="list-tabs-tabpane-All Items"]');
    // document.getElementById('list-tabs-tabpane-All Items');
    const todoItems = todoPane.children;
    const moveButton = todoItems[0].querySelector('button');

      // Open the dropdown menu
    fireEvent.click(moveButton);

      // Ensure the dropdown is open
    const dropdownMenu = document.querySelector('.dropdown-menu.show');
    expect(dropdownMenu).toBeInTheDocument();
    
    // // Select the new list from the dropdown
    const dropdownItem = document.getElementsByClassName('dropdown-item')[1];//screen.getByText(listName);
    fireEvent.click(dropdownItem);

    const newListPane = document.getElementById('list-tabs-tabpane-'+listName);
    const newListItems = newListPane.children;

    expect(newListItems.length).toBe(1);
    expect(todoItems.length).toBe(4);

  });


  // const [todoLists, setTodoLists] = useState([
  //   {
  //     name: 'List 1',
  //     todos: [
  //       { title: 'Todo 1', description: 'Description 1', dueDate: '2023-10-01' },
  //       { title: 'Todo 2', description: 'Description 2', dueDate: '2023-10-02' }
  //     ]
  //   },
  //   {
  //     name: 'List 2',
  //     todos: [
  //       { title: 'Todo 3', description: 'Description 3', dueDate: '2023-10-03' }
  //     ]
  //   },
  //   {
  //     name: 'All Items',
  //     todos: [
  //       { title: 'Todo 1', description: 'Description 1', dueDate: '2023-10-01' },
  //       { title: 'Todo 2', description: 'Description 2', dueDate: '2023-10-02' },
  //       { title: 'Todo 3', description: 'Description 3', dueDate: '2023-10-03' }
  //     ]
  //   }
  // ]);
  

  // const moveTodo = (todoToMove, newListName) => {
  //   setTodoLists(todoLists.map(list => {
  //     if (list.name === 'All Items') {
  //       // "All Items" list should always contain all todos
  //       return {
  //         ...list,
  //         todos: todoLists.reduce((acc, currentList) => [...acc, ...currentList.todos], [])
  //       };
  //     } else if (list.name === newListName) {
  //       // Add the todo to the new list
  //       return { ...list, todos: [...list.todos, todoToMove] };
  //     } else if (list.todos.includes(todoToMove)) {
  //       // Remove the todo from the old list
  //       return { ...list, todos: list.todos.filter(todo => todo !== todoToMove) };
  //     } else {
  //       return list;
  //     }
  //   }));
  // };

  // test('moves a todo item to a new list', () => {
  //   //const { result } = renderHook(() => useToDoList());

  //   const todoToMove = { title: 'Todo 1', description: 'Description 1', dueDate: '2023-10-01' };
  //   const newListName = 'List 2';

  //   moveTodo(todoToMove, newListName);
    

  //   const list1 = todoLists.find(list => list.name === 'List 1');
  //   const list2 = todoLists.find(list => list.name === 'List 2');

  //   expect(list1.todos).not.toContain(todoToMove);
  //   expect(list2.todos).toContain(todoToMove);
  // });

  // test('ensures "All Items" list contains all todos', () => {
  //   //const { result } = renderHook(() => useToDoList());

  //   const todoToMove = { title: 'Todo 1', description: 'Description 1', dueDate: '2023-10-01' };
  //   const newListName = 'List 2';

  //   moveTodo(todoToMove, newListName);
    

  //   const allItemsList = todoLists.find(list => list.name === 'All Items');
  //   const allTodos = todoLists.reduce((acc, list) => [...acc, ...list.todos], []);

  //   expect(allItemsList.todos).toEqual(expect.arrayContaining(allTodos));
  // });
}); 