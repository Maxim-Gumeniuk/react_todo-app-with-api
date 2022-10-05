/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getTodos, createTodo, deleteTodo } from './api/todos';
import { AuthContext } from './components/Auth/AuthContext';
import { ErroNotification } from './components/Auth/ErrorNot';
import { TodoFooter } from './components/Auth/Footer';
import { TodoHeader } from './components/Auth/TodoHeader';
import { TodoList } from './components/Auth/TodoList';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [todos, setTodos] = useState<Todo[] | []>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterBy, setFiterBy] = useState('all');
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number[]>([]);

  const user = useContext(AuthContext); // eslint-disable-line @typescript-eslint/no-unused-vars
  const newTodoField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newTodoField.current) {
      newTodoField.current.focus();
    }
  }, []);

  useEffect(() => {
    // focus the element with `ref={newTodoField}`
    if (newTodoField.current) {
      newTodoField.current.focus();
    }
  }, []);

  useEffect(() => {
    async function todosFromServer() {
      try {
        if (user) {
          const visibleTodos = getTodos(user.id);

          setTodos(await visibleTodos);
        }
      } catch (error) {
        setErrorMessage(`${error}`);
      }
    }

    todosFromServer();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsAdding(true);

    if (!title) {
      setIsAdding(true);

      return setErrorMessage('Title can`t be empty');
    }

    if (user) {
      try {
        const newTodo = await createTodo(user.id, title);

        setIsAdding(true);

        setSelectedId([newTodo.id]);

        setIsAdding(false);
        setTodos([...todos, newTodo]);
      } catch {
        setErrorMessage('Unable to add a todo');
      }
    }

    return setTitle('');
  };

  const handleremoveTodo = async (todoId: number) => {
    setSelectedId([todoId]);
    setIsAdding(true);
    await deleteTodo(todoId)
      .then(() => {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      });
  };

  const completedTodos = todos.filter(({ completed }) => completed);

  const handleDeleteCompletedTodos = useCallback(() => {
    setSelectedId([...completedTodos].map(({ id }) => id));

    Promise.all(completedTodos.map(({ id }) => handleremoveTodo(id)))
      .then(() => setTodos([...todos.filter(({ completed }) => !completed)]))
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
        setSelectedId([]);
      });
  }, [todos, selectedId, errorMessage]);

  const filteredTodos = todos.filter(todoItem => {
    if (filterBy === 'active') {
      return !todoItem.completed;
    }

    if (filterBy === 'completed') {
      return todoItem.completed;
    }

    return todoItem;
  });

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <TodoHeader
        newTodoField={newTodoField}
        handleSubmit={handleSubmit}
        setTitle={setTitle}
        title={title}
      />

      {todos.length > 0 && (
        <div className="todoapp__content">
          <TodoList
            todos={filteredTodos}
            handleremoveTodo={handleremoveTodo}
            isAdding={isAdding}
            selectedId={selectedId}
          />

          <TodoFooter
            setFilterBy={setFiterBy}
            todos={filteredTodos}
            filterBy={filterBy}
            deleteTodo={handleDeleteCompletedTodos}
            completedTodos={completedTodos}
          />
        </div>
      )}

      {errorMessage && (
        <ErroNotification
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}

        />
      )}
    </div>
  );
};
