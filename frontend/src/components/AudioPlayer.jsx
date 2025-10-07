import { useState, useRef, useEffect } from 'react'
import { Box, Button, Alert, CircularProgress } from '@mui/material'
import { PlayArrow, Stop, VolumeUp, Error } from '@mui/icons-material'

const AudioPlayer = ({ number, speed, isPlaying, setIsPlaying }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  const getAudioUrl = () => {
    return `/api/audio/${speed}/${number}`
  }

  const playAudio = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsPlaying(true)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      const audio = new Audio(getAudioUrl())
      audioRef.current = audio

      audio.addEventListener('loadstart', () => {
        setLoading(true)
      })

      audio.addEventListener('canplaythrough', () => {
        setLoading(false)
      })

      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setLoading(false)
      })

      audio.addEventListener('error', (e) => {
        setError(`Failed to load audio file for number ${number}`)
        setIsPlaying(false)
        setLoading(false)
      })

      await audio.play()
    } catch (err) {
      setError(`Error playing audio: ${err.message}`)
      setIsPlaying(false)
      setLoading(false)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setLoading(false)
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    setError(null)
  }, [number, speed])

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : isPlaying ? (
              <Stop />
            ) : (
              <PlayArrow />
            )
          }
          onClick={isPlaying ? stopAudio : playAudio}
          disabled={loading}
          sx={{ minWidth: 140 }}
        >
          {loading ? 'Loading...' : isPlaying ? 'Stop' : 'Play Audio'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <VolumeUp color="action" />
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          Speed: {speed} | Number: #{number}
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          icon={<Error />}
          sx={{ mt: 2, textAlign: 'left' }}
        >
          {error}
          <Box sx={{ mt: 1, fontSize: '0.75rem' }}>
            Make sure the backend server is running on localhost:8000
          </Box>
        </Alert>
      )}
    </Box>
  )
}

export default AudioPlayer