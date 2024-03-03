import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const ButtonComponent = ({ icon, onClick, colorScheme, children }) => {
  return (
    <ChakraButton leftIcon={icon} colorScheme={colorScheme} onClick={onClick} marginLeft={4}>
      {children}
    </ChakraButton>
  );
};

ButtonComponent.propTypes = {
  icon: PropTypes.element,
  onClick: PropTypes.func.isRequired,
  colorScheme: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default ButtonComponent;
