import { useState, useEffect, useCallback, useRef } from "react";
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
  const statusMessageRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const playSound = useCallback((soundFile: string) => {
    const audio = new Audio(soundFile);
    audio.play();
  }, []);

  useEffect(() => {
    if (statusMessageRef.current) {
      statusMessageRef.current.innerText = isActive ? "Foco iniciado" : "Foco pausado";
      if (isResting) {
        statusMessageRef.current.innerText = "Descanso iniciado";
      }
    }
  }, [isActive, isResting]);

  const onAddNewTask = useCallback((newTask: Task) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
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
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          const updatedFocusTime = task.focusTime + (time / 60); 
          return { ...task, focusTime: updatedFocusTime };
        }
        return task;
      });
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
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, isResting]);
  
  useEffect(() => {
    let restInterval: NodeJS.Timeout | null = null;
  
    if (isResting && restTime > 0) {
      restInterval = setInterval(() => {
        setRestTime((prevRestTime) => prevRestTime - 1);
      }, 1000);
    } else if (restTime === 0 && isResting) {
      setIsResting(false);
      playSound(endRestSound);
      toast({
        title: "Tempo de descanso finalizado",
        description: "Você pode retomar suas atividades.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      resetFlowmodoro();
    }
  
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [isResting, restTime, playSound, toast, resetFlowmodoro]);
  

  return (
    <Box bg={useColorModeValue('white', 'gray.700')} color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
      <Flex direction="column" align="center" justify="center" h="100vh">
        <Flex position="absolute" top={5} right={5} gap={2}>
          <ButtonComponent id="add-task-button" colorScheme="teal" onClick={onOpen} ariaLabel="Adicionar Tarefa" ref={triggerButtonRef}> 
            Adicionar Tarefa
          </ButtonComponent>
          <TaskModal
            isOpen={isOpen}
            onClose={onClose}
            onAddNewTask={onAddNewTask}
            onDeleteTask={onDeleteTask}
            triggerButtonRef={triggerButtonRef}
          />
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
            <ButtonComponent id="btn-pause" icon={<FaPause />} colorScheme="teal" onClick={handleStartPause} ariaLabel="Pausar">
              Pausar
            </ButtonComponent>
          )}
          {isPaused && time === 0 && !isResting && (
            <ButtonComponent id="btn-start" icon={<FaPlay />} colorScheme="teal" onClick={handleStartPause} ariaLabel="Iniciar">
              Iniciar
            </ButtonComponent>
          )}
          {isPaused && time > 0 && !isResting && (
            <>
              <ButtonComponent id="btn-reset" icon={<FaRedo />} colorScheme="teal" onClick={resetFlowmodoro} ariaLabel="Resetar">
                Resetar
              </ButtonComponent>
              <ButtonComponent id="btn-rest" icon={<FaCoffee />} colorScheme="teal" onClick={handleStop} ariaLabel="Descansar">
                Descansar
              </ButtonComponent>
            </>
          )}
          {isResting && <Text>Tempo de descanso! Aproveite para relaxar.</Text>}
        </Flex>
      </Flex>
      <div ref={statusMessageRef} aria-live="polite" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}></div>
    </Box>
  );
};

export default Flowmodoro;
