import React, {useState, useEffect} from 'react';
import { ListGroup, Button, Form, Container, Row, Col, Tab, Nav, Dropdown } from 'react-bootstrap';
import "./ToDoList.css"

function TodoList() {
  const [todoLists, setTodoLists] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);


  useEffect(() => {
    fetchTodoLists();
  }, []);

  const fetchTodoLists = async () => {
    try {
      const response = await fetch('https://localhost:7270/Todo/getTodoItems');
      let data = await response.json();
      data = data.map(item => ({
        ...item,
        dueDate: formatDate(item.dueDate)
      }));

      const lists = data.reduce((acc, item) => {
        if (item.list && item.list.trim() !== '') {
          if (!acc[item.list]) {
            acc[item.list] = [];
          }
          acc[item.list].push({
            ...item,
            dueDate: formatDate(item.dueDate)
          });
        }
        return acc;
      }, {});

      const formattedLists = Object.keys(lists).map(listName => ({
        name: listName,
        todos: lists[listName]
      }));

      setTodoLists([{ name: 'All Items', todos: data }, ...formattedLists]);
    } catch (error) {
      console.error('Failed to fetch todos', error);
    }
  };
  // console.log("receive data: ", todoLists);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];

  }

  // const [selectedList, setSelectedList] = useState('All Items');

  // const [todos, setTodos] = useState(start_todos);
  const getVariant = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 2) {
      return 'danger';
    } else if (diffDays <= 4) {
      return 'warning';
    } else if (diffDays <= 7) {
      return 'success';
    } else {
      return 'primary';
    }
  };

  const addTodoList = (newListName) => {
    setTodoLists([...todoLists, { name: newListName, todos: [] }]);
  };

  const addTodo = (newTodo, listName) => {
    console.log("newTodo: ", newTodo)
    console.log("listName: ", listName)
    fetch("https://localhost:7270/Todo/addTodoItem", {  // Update with your backend URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo)
    })
        .then(response => response.json())
        .then(todoItem => {
          todoItem.dueDate = formatDate(todoItem.dueDate);

          setTodoLists(todoLists.map(list => (
              list.name === listName || list.name === 'All Items'
                  ? { ...list, todos: [...list.todos, todoItem] }
                  : list
          )));
        })
        .catch(error => console.error("Error adding todo:", error));
  };

  const updateTodo = async (todo) => {
    try {
      console.log('updateTodo:', todo);
      const response = await fetch(`https://localhost:7270/Todo/updateTodoItem/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
      });
      if (response.ok) {
        fetchTodoLists(); // Refresh the list after update
      } else {
        console.error('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };


  const moveTodo = (todoToMove, newListName) => {
    setTodoLists(todoLists.map(list => {
      if (list.name === 'All Items') {
        // "All Items" list should always contain all todos
        return {
          ...list,
          todos: todoLists.reduce((acc, currentList) => [...acc, ...currentList.todos], [])
        };
      } else if (list.name === newListName) {
        // Add the todo to the new list
        return { ...list, todos: [...list.todos, todoToMove] };
      } else if (list.todos.includes(todoToMove)) {
        // Remove the todo from the old list
        return { ...list, todos: list.todos.filter(todo => todo !== todoToMove) };
      } else {
        return list;
      }
    }));
  };

  const handleEdit = (todo) => {
    setEditingTodo({ ...todo });
  };

  const handleBlur = (field, value, todo) => {
    console.log('handleBlur:', todo);
    if (todo[field] !== value) {
      const updatedTodo = { ...todo, [field]: value };
      updateTodo(updatedTodo); // Call updateTodo to submit changes to the backend
    }
  };



  return (
    <Container className="p-3">
      <Row className="mb-5">
        <Col>
          <h1 className="text-center">Assignment 3: ToDo List</h1>
        </Col>
      </Row>
      <Row className="d-flex align-items-start">
        <Col md={4} className="form-container">
          <Form onSubmit={(e) => {
              e.preventDefault();
              addTodoList(e.target.elements[0].value);
              e.target.reset();
            }}>
            <Form.Group className="mb-3">
              <Form.Label>New List Name</Form.Label>
              <Form.Control type="text" required placeholder='Add new list' />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add New List
            </Button>
          </Form>

          <Form onSubmit={(e) => {
                e.preventDefault();
                addTodo({
                  title: e.target.elements.title.value,
                  description: e.target.elements.description.value,
                  dueDate: new Date(e.target.elements.dueDate.value).toISOString(),
                  list: e.target.elements.list.value
                }, e.target.elements.list.value);
                e.target.reset();
              }}>
              <Form.Group>
                <Form.Label htmlFor="title">Title</Form.Label>
                <Form.Control type="text" id="title" name="title" placeholder='Add todo item' required />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor="description">Description</Form.Label>
                <Form.Control as="textarea" rows={3} id="description" name="description" required />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor="dueDate">Due Date</Form.Label>
                <Form.Control type="date" id="dueDate" name="dueDate" required />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor="list">List</Form.Label>
                <Form.Control as="select" id="list" name="list" required>
                {todoLists.map((list, index) => (
                  <option key={index} value={list.name}>{list.name}</option>
                ))}
                </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Add Todo Item</Button>
          </Form>
        </Col>
        <Col md={8}>
          <Tab.Container id="list-tabs" defaultActiveKey="All Items">
            <Row>
              <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                  {todoLists.map((list, index) => (
                    <Nav.Item key={index}>
                      <Nav.Link eventKey={list.name}>{list.name}</Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  {todoLists.map((list, index) => (
                    <Tab.Pane eventKey={list.name} key={index}>
                      {list.todos.map((todo, index) => (
                          <ListGroup.Item key={index} variant={getVariant(todo.dueDate)}>
                            <h4
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleBlur('title', e.target.textContent, todo)}
                            >
                              {todo.title}
                            </h4>
                            <p
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleBlur('description', e.target.textContent, todo)}
                            >
                              {todo.description}
                            </p>
                            <input
                                type="date"
                                defaultValue={todo.dueDate}
                                className="p-2"
                                onBlur={(e) => handleBlur('dueDate', e.target.value, todo)}
                            />
                            <Dropdown onSelect={(newListName) => moveTodo(todo, newListName)} className="float-right">
                              <Dropdown.Toggle variant="success" id={`dropdown-basic${index}`}>
                                Move to...
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {todoLists.map((list, listIndex) => (
                                    <Dropdown.Item eventKey={list.name} key={listIndex}>{list.name}</Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          </ListGroup.Item>
                      ))}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );

}

export default TodoList;