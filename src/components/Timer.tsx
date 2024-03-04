import { FC } from 'react';
import { Flex, Text } from '@chakra-ui/react';

interface TimerComponentProps {
  time: number; 
}

const TimerComponent: FC<TimerComponentProps> = ({ time }) => {
  const formatTime = (time: number) => {
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

export default TimerComponent;
