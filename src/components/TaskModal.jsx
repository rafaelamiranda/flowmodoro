import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Button, Table, Thead, Tbody, Tr, Th, Td, useToast } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';

function TaskModal({ isOpen, onClose, apiUrl }) {
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/tasks`);
        if (!response.ok) {
          throw new Error('Erro ao carregar tarefas');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as tarefas.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, apiUrl, toast]);

  const submitTask = async () => {
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

    const newTask = {
      id: uuidv4(),
      name: taskName.trim(),
      focusTime: 0
    };

    try {
      const response = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar tarefa');
      }

      const addedTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, addedTask]);
      setTaskName('');
      toast({
        title: 'Tarefa adicionada.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar tarefa');
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast({
        title: "Tarefa deletada",
        description: "A tarefa foi deletada com sucesso.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a tarefa.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatFocusTime = (focusTime) => {
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
    <Tr key={task._id}>
      <Td>{task.name}</Td>
      <Td>{formatFocusTime(task.focusTime)}</Td>
      <Td>
        <Button size="sm" colorScheme="red" onClick={() => onDeleteTask(task._id)}>
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
}

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  apiUrl: PropTypes.string.isRequired
};

export default TaskModal;
