import { useState, useEffect, useCallback } from "react";
import { Flex, Box, Text, Select, useToast, Button, useDisclosure } from '@chakra-ui/react';
import { FaPlay, FaPause, FaRedo, FaCoffee } from 'react-icons/fa';
import { useColorModeValue } from '@chakra-ui/react';
import TaskModal from "../components/TaskModal";
import TimerComponent from '../components/Timer';
import ButtonComponent from '../components/Button';
import DarkModeSwitch from "../components/DarkModeSwitch";
import startSound from '../assets/start.mp3';
import pauseSound from '../assets/stop.mp3';
import resetSound from '../assets/restart.mp3';
import startRestSound from '../assets/break.mp3';
import endRestSound from '../assets/alerta.mp3';
import './style.css';

const Flowmodoro = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [restTime, setRestTime] = useState(0);
  const [currentFocusTime , setCurrentFocusTime] = useState(0);
  const toast = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;

  const playSound = useCallback((soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  }, []);

  const loadTasks = useCallback(async () => {
    console.log('Carregando tarefas...'); // Para depuração
    const response = await fetch(`${apiUrl}/api/tasks`);
    const data = await response.json();
    setTasks(data);
  }, [apiUrl]);

  useEffect(() => {
    console.log('Tarefas atualizadas:', tasks);
  }, [tasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onAddNewTask = useCallback(async (newTask) => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar tarefa');
      }

      // Recarrega as tarefas do servidor após adicionar uma nova tarefa com sucesso
      await loadTasks();

      toast({
        title: 'Tarefa adicionada.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [apiUrl, toast, loadTasks]); // Adicione 'loadTasks' às dependências do useCallback


  const onDeleteTask = useCallback(async (taskId) => {
    const response = await fetch(`${apiUrl}/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      toast({
        title: "Tarefa excluída",
        description: "Tarefa excluída com sucesso.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    }
  }, [onClose, toast, apiUrl]);

  const handleStartPause = useCallback(async () => {
    if (!selectedTaskId || tasks.length === 0) {
      toast({
        title: "Nenhuma tarefa selecionada",
        description: "Por favor, selecione uma tarefa antes de iniciar o foco.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsActive(!isActive);
    setIsPaused(!isPaused);

    if (!isActive) {
      playSound(startSound);
      // Não precisa atualizar o backend quando o cronômetro começa
    } else {
      playSound(pauseSound);
      // Atualize o tempo de foco no backend quando o cronômetro pausa
      const selectedTask = tasks.find(task => task._id === selectedTaskId);
      if (selectedTask) {
        const updatedFocusTime = selectedTask.focusTime + (time / 60); // Converta o tempo para minutos
        try {
          const response = await fetch(`${apiUrl}/api/tasks/${selectedTaskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ focusTime: updatedFocusTime }),
          });

          if (!response.ok) {
            throw new Error('Falha ao atualizar a tarefa');
          }

          // Atualize o estado local após a atualização bem-sucedida
          const updatedTask = await response.json();
          setTasks(tasks.map(task => task._id === selectedTaskId ? updatedTask : task));
        } catch (error) {
          console.error(error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o tempo de foco da tarefa.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
  }, [isActive, isPaused, playSound, selectedTaskId, tasks, time, toast, apiUrl]);


  const handleStop = useCallback(() => {
    setIsResting(true);
    playSound(startRestSound);
    setRestTime(Math.floor(time * 0.2));
  }, [time, playSound]);

  const resetFlowmodoro = useCallback(() => {
    setIsActive(false);
    setIsPaused(true);
    setIsResting(false);
    setTime(0);
    setRestTime(0);
    playSound(resetSound);
  }, [playSound]);

  useEffect(() => {
    let interval = null;

    if (isActive && !isPaused && !isResting) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (isResting) {
      interval = setInterval(() => {
        setRestTime((prevRestTime) => prevRestTime - 1);
      }, 1000);
    }

    if (isResting && restTime <= 0) {
      clearInterval(interval);
      playSound(endRestSound);
      resetFlowmodoro();
      toast({
        title: "Tempo de descanso finalizado",
        description: "Você pode retomar suas atividades.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, isResting, restTime, playSound, toast, resetFlowmodoro]);

  return (
    <Box bg={useColorModeValue('white', 'gray.700')} color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
      <Flex direction="column" align="center" justify="center" h="100vh">
        <Flex position={"absolute"} top={5} right={5}>
          <Button onClick={onOpen}>Adicionar Tarefa</Button>
          <TaskModal
      isOpen={isOpen}
      onClose={onClose}
      onAddNewTask={onAddNewTask}
      onDeleteTask={onDeleteTask}
      apiUrl={apiUrl} // Passando apiUrl como prop para TaskModal
    />
          <DarkModeSwitch />
        </Flex>

        <Flex direction="column" align="center" justify="center">
          <Select placeholder="Selecione uma tarefa" onChange={(e) => setSelectedTaskId(e.target.value)} value={selectedTaskId} isDisabled={isResting}>
  {tasks.map((task) => (
    <option key={task._id} value={task._id}>{task.name}</option>
  ))}
</Select>

        </Flex>

        <TimerComponent time={isResting ? restTime : time} />
        <Flex>
          {!isPaused && !isResting && (
            <ButtonComponent icon={<FaPause />} colorScheme="yellow" onClick={handleStartPause} aria-label="Pausar">
              Pausar
            </ButtonComponent>
          )}
          {isPaused && time === 0 && !isResting && (
            <ButtonComponent icon={<FaPlay />} colorScheme="teal" onClick={handleStartPause} aria-label="Iniciar">
              Iniciar
            </ButtonComponent>
          )}
          {isPaused && time > 0 && !isResting && (
            <>
              <ButtonComponent icon={<FaRedo />} colorScheme="pink" onClick={resetFlowmodoro} aria-label="Resetar">
                Resetar
              </ButtonComponent>
              <ButtonComponent icon={<FaCoffee />} colorScheme="red" onClick={handleStop} aria-label="Descansar">
                Descansar
              </ButtonComponent>
            </>
          )}
          {isResting && <Text>Tempo de descanso! Aproveite para relaxar.</Text>}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Flowmodoro;
