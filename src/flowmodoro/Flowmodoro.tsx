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

interface Task {
  id: string;
  name: string;
  focusTime: number;
}

const Flowmodoro: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [time, setTime] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('tasks') || '[]'));
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [restTime, setRestTime] = useState<number>(0);

  const toast = useToast();

  const playSound = useCallback((soundFile: string) => {
    const audio = new Audio(soundFile);
    audio.play();
  }, []);

  const onAddNewTask = useCallback((newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    localStorage.setItem('tasks', JSON.stringify([...tasks, newTask]));
  }, [tasks]);

  const onDeleteTask = useCallback((taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    toast({
      title: "Tarefa excluída",
      description: "Tarefa excluída com sucesso.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    onClose();
  }, [tasks, toast, onClose]);

  const handleStartPause = useCallback(() => {
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
    } else {
      playSound(pauseSound);
      const updatedTasks = tasks.map(task =>
        task.id === selectedTaskId ? { ...task, focusTime: task.focusTime + (time / 60) } : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
  }, [isActive, isPaused, playSound, selectedTaskId, tasks, time, toast]);

  const handleStop = useCallback(() => {
    if (time < 5) {
      toast({
        title: "Tempo de trabalho insuficiente",
        description: "Continue trabalhando por mais tempo antes de descansar.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      setIsResting(true);
      playSound(startRestSound);
      setRestTime(Math.floor(time * 0.2));
    }
  }, [time, playSound, toast]);

  const resetFlowmodoro = useCallback(() => {
    setIsActive(false);
    setIsPaused(true);
    setIsResting(false);
    setTime(0);
    setRestTime(0);
    playSound(resetSound);
  }, [playSound]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

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
      if (interval) clearInterval(interval);
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

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, isResting, restTime, playSound, toast, resetFlowmodoro]);

  return (
    <Box bg={useColorModeValue('white', 'gray.700')} color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
      <Flex direction="column" align="center" justify="center" h="100vh">
        <Flex position={"absolute"} top={5} right={5}>
          <ButtonComponent onClick={onOpen} colorScheme="teal">Adicionar Tarefa</ButtonComponent>
          <TaskModal isOpen={isOpen} onClose={onClose} onAddNewTask={onAddNewTask} onDeleteTask={onDeleteTask} />
          <DarkModeSwitch />
        </Flex>

        <Flex direction="column" align="center" justify="center">
          <Select placeholder="Selecione uma tarefa" onChange={(e) => setSelectedTaskId(e.target.value)} value={selectedTaskId} isDisabled={isResting || isActive || time > 0}>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.name}</option>
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
