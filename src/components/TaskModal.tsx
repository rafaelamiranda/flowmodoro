import { useState, useEffect, FC } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Button, Table, Thead, Tbody, Tr, Th, Td, useToast } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: string;
  name: string;
  focusTime: number;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskModal: FC<TaskModalProps> = ({ isOpen, onClose, onAddNewTask, onDeleteTask }) => {
  const [taskName, setTaskName] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      setTasks(savedTasks);
    }
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const submitTask = () => {
    if (!taskName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para a tarefa.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const newTask: Task = {
      id: uuidv4(),
      name: taskName.trim(),
      focusTime: 0
    };

    onAddNewTask(newTask);
    setTaskName('');
    toast({
      title: 'Tarefa adicionada.',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
    onClose();
  };

  const formatFocusTime = (focusTime: number) => {
    const mins = Math.floor(focusTime);
    const secs = Math.round((focusTime - mins) * 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cadastrar Tarefa</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Nome da Tarefa"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            mb={4}
          />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tarefa</Th>
                <Th>Tempo de Foco</Th>
                <Th>Ação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tasks.map((task) => (
                <Tr key={task.id}>
                  <Td>{task.name}</Td>
                  <Td>{formatFocusTime(task.focusTime)}</Td>
                  <Td>
                    <Button size="sm" colorScheme="red" onClick={() => onDeleteTask(task.id)}>
                      <DeleteIcon />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={submitTask}>Adicionar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;