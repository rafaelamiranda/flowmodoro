import soundFile from '../assets/alerta.mp3';
import { useState, useEffect } from "react";
import "@theme-toggles/react/css/Classic.css";
import { Classic } from "@theme-toggles/react";
import { useSpring, animated } from 'react-spring';
import './style.css';

const Flowmodoro = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [task, setTask] = useState("");
  const [isResting, setIsResting] = useState(false);
  const [workTime, setWorkTime] = useState(0);

  // Função para atualizar a classe 'dark' do <body>
  const applyDarkModeClass = (isDark) => {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  // Inicia com o modo dark ativado
  const [darkMode, setDarkMode] = useState(true);

  // Aplica a classe 'dark' ao <body> na montagem do componente
  useEffect(() => {
    applyDarkModeClass(darkMode);
  }, [darkMode]);

  // Toggle para o modo dark/light
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Escuta as mudanças nas preferências do sistema para o tema escuro
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setDarkMode(mediaQuery.matches);
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    let interval = null;

    if ((isActive && !isPaused) || (isResting && isActive)) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      window.clearInterval(interval);
    }

    if (isResting && time >= workTime * 0.2) {
      if (interval) {
        window.clearInterval(interval);
      }
      const audio = new Audio(soundFile); 
      audio.play();
      resetFlowmodoro();
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isActive, isPaused, isResting, time, workTime]);

  const handleStartPause = () => {
    setIsActive(true);
    setIsPaused(!isPaused);
    if (isResting) {
      resetFlowmodoro();
    }
  };

  const handleStop = () => {
    if (!isResting) {
      setIsResting(true);
      setWorkTime(time);
      setTime(0);
    } else {
      resetFlowmodoro();
    }
  };

  const handleReset = () => {
    resetFlowmodoro();
  };

  const resetFlowmodoro = () => {
    setIsActive(false);
    setIsPaused(true);
    setIsResting(false);
    setTime(0);
    setWorkTime(0);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return { minutes, seconds };
  };

  // Definindo a animação do ícone de play/pause
  const styles = useSpring({
    transform: isPaused ? 'scale(1.2)' : 'scale(1)',
    config: { tension: 210, friction: 20 },
  });

  // Definindo a animação do ícone de descansar
  const { transform } = useSpring({
    config: { duration: 750 },
    transform: isActive ? 'rotate(360deg)' : 'rotate(0deg)',
    reset: true,
  });

  // Definindo a animação do ícone de reset
  const rotating = useSpring({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
    reset: true,
    reverse: false,
    loop: false,
    config: { duration: 800 }, 
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-900 antialiased">
      <div className={`absolute top-0 right-0 p-5 ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <Classic
          duration={750}
          onToggle={toggleDarkMode}
          placeholder=""
        />
      </div>
      <div className="p-5">
        <input
          type="text"
          placeholder="Qual é a tarefa?"
          className="text-center p-2 bg-gray-100 dark:bg-gray-700 w-full text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-teal-500  focus:ring focus:ring-blue-500 dark:focus:ring-teal-500 focus:ring-opacity-50 rounded-lg shadow-sm"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        <div className="flex space-x-2 items-center justify-center my-12"> 
          {/* Dígitos do contador */}
          {formatTime(time).minutes.split('').map((digit, index) => (
            <span key={index} className="bg-gray-300 dark:bg-gray-800 text-gray-700 dark:text-white font-mono text-8xl  p-4 rounded flex justify-center items-center" style={{ width: '8vw', height: '10vw' }}>
              {digit}
            </span>
          ))}
          {/* Separador */}
          <span className="text-green-500 dark:text-teal-400 text-8xl mx-2">
            :
          </span>
          {/* Dígitos do contador */}
          {formatTime(time).seconds.split('').map((digit, index) => (
            <span key={index} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-mono text-8xl p-4 rounded flex justify-center items-center" style={{ width: '8vw', height: '10vw' }}>
              {digit}
            </span>
          ))}
        </div>

        <div className="flex space-x-4 mt-4 items-center justify-center">
          
          {/* Pause */}
          {!isPaused && (
            <button
              onClick={handleStartPause}
              className="px-4 py-2 rounded dark:text-white text-black bg-gray-200 dark:bg-gray-600 icon"
              title="Iniciar/Pausar"
              aria-label="Iniciar/Pausar"
            >
              <animated.svg
                style={styles}
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke={darkMode ? 'rgb(45 212 191)' : 'rgb(34 197 94)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <>
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </> 
              </animated.svg>
            </button> 
          )}

          {/* Play */}
          {isPaused && time === 0 && !isResting && (
            <button
              onClick={handleStartPause}
              className="px-4 py-2 rounded dark:text-white text-black bg-gray-200 dark:bg-gray-600 icon"
              title="Iniciar"
              aria-label="Iniciar"
            >
              <animated.svg
                style={styles}
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke={darkMode ? 'rgb(45 212 191)' : 'rgb(34 197 94)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </animated.svg>
            </button>
          )}

          {/* Resetar */}
          {isPaused && time !== 0 &&!isResting && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded dark:text-white text-black bg-gray-200 dark:bg-gray-600 icon"
              title="Resetar"
              aria-label="Resetar"
            >
              <animated.svg
                style={rotating}
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke={darkMode ? 'rgb(45 212 191)' : 'rgb(34 197 94)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </animated.svg>
            
            </button>
          )}

          {/* Descansar */}
          {isPaused && time >= 0 && !isResting && (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded dark:text-white text-black icon"
              title="Descansar"
              aria-label="Descansar"
              type="button"
            >
              <animated.svg
                style={{ transform }}
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke={darkMode ? 'rgb(45 212 191)' : 'rgb(34 197 94)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </animated.svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flowmodoro;
