import { extendTheme } from "@chakra-ui/react";

// Configuração do tema
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Estenda o tema padrão com configurações personalizadas
const theme = extendTheme({ config });

export default theme;
