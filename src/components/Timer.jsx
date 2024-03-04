import PropTypes from 'prop-types';
import { Flex, Text } from '@chakra-ui/react';

const TimerComponent = ({ time }) => {
  // Função para formatar o tempo
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return { minutes, seconds };
  };

  const { minutes, seconds } = formatTime(time);

  return (
    <Flex mb={4} align="center">
      {minutes.split('').map((digit, index) => (
        <Text key={index} fontSize="6xl" mb={4}>{digit}</Text>
      ))}
      <Text fontSize="6xl" mb={4}>:</Text>
      {seconds.split('').map((digit, index) => (
        <Text key={index} fontSize="6xl" mb={4}>{digit}</Text>
      ))}
    </Flex>
  );
};

// Definindo propTypes para o componente Timer
TimerComponent.propTypes = {
  time: PropTypes.number.isRequired,
};

export default TimerComponent;
