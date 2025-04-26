import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import styles from './TodolistScreenStyles';

const API_URL = 'https://fastapi-todolist-backend.onrender.com/api/todos/';

export default function TodolistScreenAPI() {
  const { colors, dark } = useTheme();

  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState('all');

  // 🔄 Fetch tasks from API
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          id: item.id,
          text: item.title,
          completed: item.completed,
        }));
        setTasks(formatted);
      })
      .catch(err => console.error('Failed to fetch tasks:', err));
  };

  // 🟢 Add or update a task
  const saveTask = () => {
    if (taskText.trim() === '') {
      Alert.alert('Validation', 'Task description cannot be empty.');
      return;
    }

    const payload = {
      title: taskText,
      completed: false,
    };

    if (editingTaskId !== null) {
      fetch(`${API_URL}${editingTaskId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(updated => {
          setTasks(prev =>
            prev.map(t =>
              t.id === editingTaskId
                ? { id: updated.id, text: updated.title, completed: updated.completed }
                : t
            )
          );
          resetModal();
        });
    } else {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(newTask => {
          setTasks(prev => [
            {
              id: newTask.id,
              text: newTask.title,
              completed: newTask.completed,
            },
            ...prev,
          ]);
          resetModal();
        });
    }
  };

  // 🧹 Reset modal
  const resetModal = () => {
    setModalVisible(false);
    setTaskText('');
    setEditingTaskId(null);
  };

  // ✅ Handle Add Button Press
  const onAddPress = () => {
    setTaskText('');
    setEditingTaskId(null);
    setModalVisible(true);
  };

  // ✅ Toggle complete status
  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    fetch(`${API_URL}${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: task.text, completed: !task.completed }),
    })
      .then(res => res.json())
      .then(updated => {
        setTasks(prev =>
          prev.map(t =>
            t.id === id
              ? { id: updated.id, text: updated.title, completed: updated.completed }
              : t
          )
        );
      });
  };

  // 🗑️ Delete task
  const deleteTask = (id) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          fetch(`${API_URL}${id}/`, { method: 'DELETE' })
            .then(() => {
              setTasks(prev => prev.filter(t => t.id !== id));
            });
        },
      },
    ]);
  };

  const editTask = (task) => {
    setTaskText(task.text);
    setEditingTaskId(task.id);
    setModalVisible(true);
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.completed);
      case 'complete':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  };

  const renderTaskItem = ({ item }) => (
    <View style={[styles.taskItem, { backgroundColor: colors.card }]}>
      <Text style={[styles.taskText, item.completed && styles.completedTask, { color: colors.text }]}>
        {item.text}
      </Text>
      <TouchableOpacity
        onPress={() => toggleComplete(item.id)}
        style={[styles.actionButton, item.completed ? styles.uncompleteBtn : styles.completeBtn]}
      >
        <Text style={styles.actionButtonText}>{item.completed ? 'Uncomplete' : 'Complete'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => editTask(item)} style={styles.iconButton}>
        <MaterialIcons name="edit" size={22} color="#6C63FF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.iconButton}>
        <MaterialIcons name="delete" size={22} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.innerContainer}>
        <Text style={[styles.text, { color: colors.text }]}>Connected Todo List</Text>

        <View style={styles.filterBar}>
          <FilterButton label="All" value="all" />
          <FilterButton label="Active" value="active" />
          <FilterButton label="Complete" value="complete" />
        </View>

        {getFilteredTasks().length === 0 ? (
          <Text style={[styles.noTaskText, { color: colors.text }]}>No tasks to display.</Text>
        ) : (
          <FlatList
            data={getFilteredTasks()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTaskItem}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.floatingButton} onPress={onAddPress}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTaskId ? 'Edit Task' : 'Add New Task'}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Enter task description"
              placeholderTextColor="#999"
              value={taskText}
              onChangeText={setTaskText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveTask}>
                <Text style={styles.modalButtonText}>{editingTaskId ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
