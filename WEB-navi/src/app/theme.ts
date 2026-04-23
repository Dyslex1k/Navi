import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0B5D7A' },
        secondary: { main: '#5A7D3A' },
        background: { default: '#F7F8F4', paper: '#FFFFFF' },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Roboto Flex", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8DA',
          boxShadow: '0 4px 20px rgba(18, 37, 23, 0.06)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
})
