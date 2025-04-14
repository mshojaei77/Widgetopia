import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemIcon, Checkbox, ListItemText, IconButton, Paper, Typography } from '@mui/material';
import { DeleteOutline as DeleteIcon, Add as AddIcon, CheckCircle as CheckCircleIcon, RadioButtonUnchecked as UncheckedIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Animation variants for framer-motion
const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Load todos from storage on initial render
  useEffect(() => {
    const loadTodos = async () => {
      try {
        if (chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.get(['todos'], (result) => {
            const initialTodos = [
              { id: 1, text: 'Write design document', completed: true },
              { id: 2, text: 'Call caterer', completed: false },
              { id: 3, text: 'Read user feedback', completed: false },
            ];
            setTodos(result.todos && result.todos.length > 0 ? result.todos : initialTodos);
          });
        } else {
          setTodos([
            { id: 1, text: 'Write design document', completed: true },
            { id: 2, text: 'Call caterer', completed: false },
            { id: 3, text: 'Read user feedback', completed: false },
          ]);
        }
      } catch (error) {
        console.error('Error loading todos:', error);
        setTodos([
          { id: 1, text: 'Write design document', completed: true },
          { id: 2, text: 'Call caterer', completed: false },
          { id: 3, text: 'Read user feedback', completed: false },
        ]);
      }
    };
    loadTodos();
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    // Save even if todos array is empty to persist deletion of all items
    try {
      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ todos });
      }
    } catch (error) {
      console.error('Error saving todos:', error);
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
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  return (
    <Paper 
      elevation={0} 
      className="glass" 
      sx={{ 
        p: 3, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          mb: 2.5, 
          fontWeight: 600,
          letterSpacing: '0.5px',
          textAlign: 'left',
        }}
      >
        Todo list
      </Typography>
      <Box 
        component="form" 
        onSubmit={addTodo} 
        sx={{ 
          display: 'flex', 
          mb: 2,
          position: 'relative',
        }}
      >
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
          sx={{ 
            mr: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
                transition: 'border-color 0.3s ease',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--primary-color)',
                boxShadow: '0 0 15px rgba(138, 180, 248, 0.3)',
              }
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1,
              }
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ 
            whiteSpace: 'nowrap',
            borderRadius: 'var(--radius-md)',
            bgcolor: 'var(--primary-color)',
            boxShadow: '0 4px 10px rgba(138, 180, 248, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'var(--primary-color)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 15px rgba(138, 180, 248, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 2px 5px rgba(138, 180, 248, 0.3)',
            }
          }}
        >
          Add
        </Button>
      </Box>

      <List sx={{ 
        overflowY: 'auto', 
        flexGrow: 1, 
        px: 0.5,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '3px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }
        },
      }}>
        <AnimatePresence>
          {todos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ListItem>
                <ListItemText 
                  secondary="No tasks yet. Add one above!" 
                  sx={{ 
                    textAlign: 'center', 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontStyle: 'italic' 
                  }} 
                />
              </ListItem>
            </motion.div>
          ) : (
            todos.map(todo => (
              <motion.div
                key={todo.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={listItemVariants}
                layout
              >
                <ListItem
                  dense
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => deleteTodo(todo.id)} 
                      size="small"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'rgba(255, 255, 255, 0.9)',
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ 
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.07)',
                      transform: 'translateX(4px)'
                    },
                    borderRadius: 'var(--radius-sm)',
                    mb: 0.7,
                    padding: '8px 16px',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: todo.completed ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                    opacity: todo.completed ? 0.7 : 1,
                    background: todo.completed ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                    <Checkbox
                      className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
                      edge="start"
                      checked={todo.completed}
                      tabIndex={-1}
                      disableRipple
                      onClick={() => toggleTodo(todo.id)}
                      icon={
                        <UncheckedIcon 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: 'var(--primary-color)',
                              transform: 'scale(1.1)'
                            }
                          }} 
                        />
                      }
                      checkedIcon={
                        <CheckCircleIcon 
                          sx={{ 
                            color: 'var(--primary-color)',
                            filter: 'drop-shadow(0 0 3px rgba(138, 180, 248, 0.5))'
                          }} 
                        />
                      }
                      sx={{
                        '&.Mui-checked': {
                          '& svg': {
                            animation: 'bounce 0.4s'
                          }
                        }
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={todo.text} 
                    sx={{ 
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      transition: 'all 0.3s ease',
                      '& .MuiListItemText-primary': {
                        color: todo.completed ? 'rgba(255, 255, 255, 0.7)' : 'white',
                        transition: 'color 0.3s ease',
                        fontWeight: todo.completed ? 'normal' : 500,
                        letterSpacing: '0.1px',
                        lineHeight: 1.4,
                      }
                    }} 
                  />
                </ListItem>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </List>
    </Paper>
  );
};

export default TodoList; 