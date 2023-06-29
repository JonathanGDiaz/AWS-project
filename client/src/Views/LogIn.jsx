import { useState } from 'react'
import { Stack, TextField, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { URL } from '../config'


export default function LogIn () {
  const navigate = useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${URL}?action=login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (response.status == 200) {
        navigate('/home')
      } else {
        const data = await response.json()
        setError(data.message)
      }
    } catch (error) {
      console.log(error)
      alert('Ocurrió un error con el servidor')
    }
  }

  return (
    <Stack spacing={2}>
      <h1> LogIn </h1>
      <TextField label='Email' type='email' onChange={e => setEmail(e.target.value)} />
      <TextField label='Password' type='password' onChange={e => setPassword(e.target.value)} />
      {error && <Typography color={'red'}>{error}</Typography>}
      <Button variant='contained' onClick={handleLogin}>Log In</Button>
    </Stack>
  )
}