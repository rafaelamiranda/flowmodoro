import React, { useState, useEffect } from 'react';

const Flowmodoro = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [task, setTask] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [workTime, setWorkTime] = useState(0);

// Função para atualizar a classe 'dark' do <body>
const applyDarkModeClass = (isDark: boolean) => {
  if (isDark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
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
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setDarkMode(mediaQuery.matches);
    mediaQuery.addListener(handleChange); 
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    let interval: number | null = null;

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
      alert("Tempo de descanso finalizado!"); // Substitua por um alerta sonoro conforme necessário
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

  const resetFlowmodoro = () => {
    setIsActive(false);
    setIsPaused(true);
    setIsResting(false);
    setTime(0);
    setWorkTime(0);
  };

  const showRestButton = time !== 0 && isPaused;

  return (
    <div className='flex flex-col items-center justify-center h-screen dark:bg-gray-900'>
      <div className="absolute top-0 right-0 p-5">
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700"
        >
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
      <div className="p-5">
        <input
          type="text"
          placeholder="Qual é a tarefa?"
          className="text-center p-2 bg-gray-200 dark:bg-gray-600 rounded"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        <h1 className="text-5xl text-center dark:text-white my-12">{new Date(time * 1000).toISOString().substr(14, 5)}</h1>

        <div className="flex space-x-4 mt-4 items-center justify-center">
          <button
            onClick={handleStartPause}
            className={`px-4 py-2 rounded ${isPaused ? 'bg-blue-500' : 'bg-yellow-500'}`}
          >
            {isPaused ? 'Iniciar' : 'Pausar'}
          </button>
          {showRestButton && (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-red-500 rounded"
            >
              Descansar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flowmodoro;