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
  const [workTime, setWorkTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks')) || []);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const playSound = useCallback((soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  }, []);

  // Atualiza o localStorage sempre que a lista de tarefas muda
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let interval = null;
  
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (isResting) {
      interval = setInterval(() => {
        setRestTime(prevRestTime => prevRestTime + 1);
      }, 1000);
    }
  
    if (isResting && restTime >= workTime * 0.2) {
      clearInterval(interval);
      playSound(endRestSound);
      resetFlowmodoro();
      toast({
        title: "Tempo de descanso finalizado",
        description: "Você pode retomar suas atividades.",
        status: "info",
        duration: 9000,
        isClosable: true,
      });
    }
  
    return () => clearInterval(interval);
  }, [isActive, isPaused, isResting, time, restTime, workTime, toast, playSound]);
  

  const handleSelectChange = (event) => {
    const selectedTaskId = event.target.value;
    setSelectedTaskId(selectedTaskId);
    const selectedTask = tasks.find((task) => task.id === parseInt(selectedTaskId));
    if (selectedTask) {
      setWorkTime(selectedTask.focusTime * 60);
    }
  };

  const handleStartPause = useCallback(() => {
    // Verifica se o foco está ativo e não pausado para pausar o foco
    if (isActive && !isPaused) {
      // Encontra a tarefa selecionada na lista de tarefas
      const updatedTasks = tasks.map(task => {
        if (task.id === parseInt(selectedTaskId)) {
          // Atualiza o workTime da tarefa selecionada adicionando o tempo atual do contador
          return { ...task, focusTime: task.focusTime + (time / 60) }; // Converte 'time' de segundos para minutos
        }
        return task;
      });
  
      // Atualiza a lista de tarefas com a tarefa atualizada
      setTasks(updatedTasks);
  
      // Salva as tarefas atualizadas no localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
  
    // Alterna o estado de pausa e ativa o som correspondente
    setIsActive(!isActive);
    setIsPaused(!isPaused);
    playSound(isPaused ? startSound : pauseSound);
  }, [isActive, isPaused, tasks, time, selectedTaskId, playSound]);
  

  const handleStop = useCallback(() => {
    console.log(workTime);
    setIsResting(true);
    setTime(0);
    playSound(startRestSound);
  }, [playSound, workTime]);

  const handleReset = useCallback(() => {
    resetFlowmodoro();
    playSound(resetSound);
  }, [playSound]);

  const resetFlowmodoro = () => {
    setIsActive(false);
    setIsPaused(true);
    setIsResting(false);
    setTime(0);
    // Reset workTime
    setWorkTime(0);
  };
  

  return (
    <Box bg={useColorModeValue('white', 'gray.700')} color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
      <Flex direction="column" align="center" justify="center" h="100vh">
        <Flex position={"absolute"} top={5} right={5}>
          <Button onClick={onOpen}>Adicionar Tarefa</Button>
          <TaskModal isOpen={isOpen} onClose={onClose} tasks={tasks} setTasks={setTasks} />
          <DarkModeSwitch />
        </Flex>

        <Flex direction="column" align="center" justify="center">
          <Select placeholder="Selecione uma tarefa" onChange={handleSelectChange} value={selectedTaskId} isDisabled={isResting} aria-label="Selecione uma tarefa" isRequired >
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.name}</option>
            ))}
          </Select>
        </Flex>

        <TimerComponent time={time} />
        <Flex>
          {!isPaused && (
            <ButtonComponent icon={<FaPause />} colorScheme="yellow" onClick={handleStartPause} aria-label="Pausar">
              Pausar
            </ButtonComponent>
          )}
          {isPaused && time === 0 && !isResting && (
            <ButtonComponent icon={<FaPlay />} colorScheme="teal" onClick={handleStartPause} aria-label="Iniciar">
              Iniciar
            </ButtonComponent>
          )}
          {isPaused && time !== 0 && !isResting && (
            <ButtonComponent icon={<FaRedo />} colorScheme="pink" onClick={handleReset} aria-label="Resetar">
              Resetar
            </ButtonComponent>
          )}
          {isPaused && time > 0 && !isResting && (
            <ButtonComponent icon={<FaCoffee />} colorScheme="red" onClick={handleStop} aria-label="Descansar">
              Descansar
            </ButtonComponent>
          )}
          {isResting && <Text>Tempo de descanso! Aproveite para relaxar.</Text>}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Flowmodoro;
