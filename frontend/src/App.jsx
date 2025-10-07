import { ThemeProvider, createTheme, CssBaseline, GlobalStyles } from '@mui/material'
import NumbersDictation from './components/NumbersDictation'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

const globalStyles = (
  <GlobalStyles
    styles={{
      html: {
        height: '100%',
        margin: 0,
        padding: 0,
      },
      body: {
        height: '100%',
        margin: 0,
        padding: 0,
      },
      '#root': {
        height: '100%',
        margin: 0,
        padding: 0,
      },
    }}
  />
)

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <NumbersDictation />
    </ThemeProvider>
  )
}

export default App
