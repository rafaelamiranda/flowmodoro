import React, { useState, useEffect, FC, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react';
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
  triggerButtonRef: React.RefObject<HTMLButtonElement>;
}

const TaskModal: FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onAddNewTask,
  onDeleteTask,
  triggerButtonRef
}) => {
  const [taskName, setTaskName] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskNameError, setIsTaskNameError] = useState<boolean>(false);
  const firstInputRef = useRef<HTMLInputElement>(null); // Ref para o primeiro input do formulário
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      setTasks(savedTasks);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (!isOpen && triggerButtonRef.current) {
      triggerButtonRef.current.focus();
    }
  }, [isOpen, triggerButtonRef]);

  const submitTask = () => {
    if (!taskName.trim()) {
      setIsTaskNameError(true);
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
    triggerButtonRef.current?.focus(); // Retorna o foco para o botão que abriu o modal
  };

  const formatFocusTime = (focusTime: number) => {
    const mins = Math.floor(focusTime);
    const secs = Math.round((focusTime - mins) * 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  function truncateText(text: string, maxLength: number) {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent width={"auto"} maxW={"80%"} aria-labelledby="modal-heading" aria-describedby="modal-description">
        <ModalHeader id="modal-heading">Cadastrar Tarefa</ModalHeader>
        <ModalCloseButton />
        <ModalBody id="modal-description">
          <FormControl isInvalid={isTaskNameError}>
            <Input
              ref={firstInputRef}
              placeholder="Nome da Tarefa"
              value={taskName}
              onChange={(e) => {
                setTaskName(e.target.value);
                setIsTaskNameError(false);
              }}
              mb={4}
              aria-label="Nome da Tarefa"
              aria-describedby="taskNameError"
            />
            {isTaskNameError && (
              <FormErrorMessage id="taskNameError">
                Por favor, insira um nome para a tarefa.
              </FormErrorMessage>
            )}
          </FormControl>
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
                  <Td>{truncateText(task.name, 100)}</Td>
                  <Td>{formatFocusTime(task.focusTime)}</Td>
                  <Td>
                    <Button size="sm" colorScheme="teal" onClick={() => onDeleteTask(task.id)} aria-label={`Excluir Tarefa ${task.name}`}>
                      <DeleteIcon />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={submitTask}>Adicionar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;
