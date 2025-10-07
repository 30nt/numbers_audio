import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material'
import { PlayArrow, Settings, Stop } from '@mui/icons-material'

const NumbersDictation = () => {
  const [speed, setSpeed] = useState('normal')
  const [count, setCount] = useState(20)
  const [pauseDuration, setPauseDuration] = useState(1.5)
  const [dictationNumbers, setDictationNumbers] = useState([])
  const [currentPhase, setCurrentPhase] = useState('setup') // 'setup', 'playing', 'review'
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1)
  const [shouldStop, setShouldStop] = useState(false)
  const [currentAudio, setCurrentAudio] = useState(null)

  // Refs for current values in event handlers
  const currentPhaseRef = useRef(currentPhase)
  const currentAudioRef = useRef(currentAudio)

  // Update refs when state changes
  useEffect(() => {
    currentPhaseRef.current = currentPhase
  }, [currentPhase])

  useEffect(() => {
    currentAudioRef.current = currentAudio
  }, [currentAudio])

  const generateRandomNumbers = (count) => {
    const numbers = []
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * 100) + 1)
    }
    return numbers
  }

  const startDictation = async () => {
    // Stop any previous audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }

    const numbers = generateRandomNumbers(count)
    setDictationNumbers(numbers)
    setCurrentPhase('playing')
    setIsPlaying(true)
    setShouldStop(false)

    // Play all numbers sequentially
    await playAllNumbers(numbers)
  }

  const stopDictation = () => {
    setShouldStop(true)
    setIsPlaying(false)
    setCurrentPhase('review')
    setCurrentPlayingIndex(-1)

    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }
  }

  const playAllNumbers = async (numbers) => {
    for (let i = 0; i < numbers.length; i++) {
      if (shouldStop) break

      setCurrentPlayingIndex(i)
      await playNumber(numbers[i])

      if (shouldStop) break

      // Пауза между числами (настраиваемая)
      await new Promise(resolve => setTimeout(resolve, pauseDuration * 1000))
    }

    setCurrentPlayingIndex(-1)
    setIsPlaying(false)
    if (!shouldStop) {
      setCurrentPhase('review')
    }
  }

  const playNumber = (number) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(`/api/audio/${speed}/${number}`)
      setCurrentAudio(audio)

      audio.onended = () => {
        setCurrentAudio(null)
        resolve()
      }
      audio.onerror = () => {
        setCurrentAudio(null)
        reject(new Error(`Failed to play audio for number ${number}`))
      }

      audio.play().catch(reject)
    })
  }

  const resetSession = () => {
    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
    }

    setCurrentPhase('setup')
    setDictationNumbers([])
    setIsPlaying(false)
    setCurrentPlayingIndex(-1)
    setShouldStop(false)
  }

  // ESC key handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && currentPhaseRef.current === 'playing') {
        // Stop current audio immediately
        if (currentAudioRef.current) {
          currentAudioRef.current.pause()
          currentAudioRef.current.currentTime = 0
          setCurrentAudio(null)
        }

        // Update states
        setShouldStop(true)
        setIsPlaying(false)
        setCurrentPhase('review')
        setCurrentPlayingIndex(-1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Box sx={{ maxWidth: 800, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          German Numbers Dictation
        </Typography>

        <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
          Listen to all numbers, then check your answers
        </Typography>

      {currentPhase === 'setup' && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom startIcon={<Settings />}>
                Dictation Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Speed</InputLabel>
                    <Select
                      value={speed}
                      label="Speed"
                      onChange={(e) => setSpeed(e.target.value)}
                    >
                      <MenuItem value="slow">Slow</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="fast">Fast</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Number of Numbers"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Pause Duration (seconds)"
                    type="number"
                    value={pauseDuration}
                    onChange={(e) => setPauseDuration(Math.min(10, Math.max(0.5, parseFloat(e.target.value) || 1.5)))}
                    inputProps={{ min: 0.5, max: 10, step: 0.1 }}
                    helperText="Time between numbers"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Ready to start?
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              You will hear {count} numbers at {speed} speed with {pauseDuration}s pauses. Listen carefully!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={startDictation}
            >
              Start Dictation
            </Button>
          </Paper>
        </>
      )}

      {currentPhase === 'playing' && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Listen carefully...
          </Typography>
          <Typography variant="h4" sx={{ my: 3, color: 'primary.main' }}>
            {currentPlayingIndex + 1} / {dictationNumbers.length}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {currentPlayingIndex >= 0
              ? `Playing number ${currentPlayingIndex + 1}...`
              : 'Preparing to play numbers...'}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="large"
            startIcon={<Stop />}
            onClick={stopDictation}
          >
            Stop Dictation
          </Button>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Press ESC to stop
          </Typography>
        </Paper>
      )}

      {currentPhase === 'review' && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom align="center">
              Dictation Complete - Check Your Answers
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
              Here are all {dictationNumbers.length} numbers that were played:
            </Typography>

            <TableContainer>
              <Table sx={{ maxWidth: 600, mx: 'auto' }}>
                <TableBody>
                  {Array.from({ length: Math.ceil(dictationNumbers.length / 5) }, (_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 5 }, (_, colIndex) => {
                        const numberIndex = rowIndex * 5 + colIndex
                        const number = dictationNumbers[numberIndex]
                        return (
                          <TableCell
                            key={colIndex}
                            align="center"
                            sx={{
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              padding: 2,
                              border: '1px solid rgba(224, 224, 224, 1)',
                              backgroundColor: number ? 'background.paper' : 'transparent'
                            }}
                          >
                            {number || ''}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box textAlign="center">
            <Button
              variant="contained"
              onClick={resetSession}
              size="large"
            >
              New Dictation
            </Button>
          </Box>
        </>
      )}
      </Box>
    </Box>
  )
}

export default NumbersDictation