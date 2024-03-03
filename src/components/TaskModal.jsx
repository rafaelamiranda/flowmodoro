import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

function TaskModal({ isOpen, onClose }) {
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Carregar tarefas do localStorage quando o componente é inicializado
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    // Salvar tarefas no localStorage sempre que elas são atualizadas
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const submitTask = () => {
    if (!taskName.trim()) {
      alert('Por favor, insira um nome para a tarefa.');
      return;
    }

    const newTask = {
      id: tasks.length + 1,
      name: taskName.trim(),
      focusTime: 0  // Inicializando o tempo de foco como 0 para cada nova tarefa
    };

    setTasks([...tasks, newTask]);
    setTaskName('');  // Limpar o campo de entrada após adicionar uma tarefa
    // Não fechar o modal ao adicionar uma tarefa, permitindo a adição de múltiplas tarefas
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
                <Th>Tempo de Foco (min)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tasks.map((task) => (
                <Tr key={task.id}>
                  <Td>{task.name}</Td>
                  <Td>{task.focusTime}</Td>
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
};

export default TaskModal;
