import { useState } from 'react';
import { Stack, TextField, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { URL } from '../config';

export default function CreateUser () {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [first_name, setFirst_name] = useState('');
  const [first_last_name, setFirst_last_name] = useState('');
  const [second_last_name, setSecond_last_name] = useState('');
  const [email, setEmail] = useState('');
  const [shift_duration, setShift_duration] = useState();
  const [startHour, setStartHour] = useState(0);
  const [startMinute, setStartMinute] = useState(0);
  const [endingHour, setendingHour] = useState(0);
  const [endingMinute, setendingMinute] = useState(0);

  const handleCreate = async () => {
    setLoading(true)
    const work_shift = [`${startHour}:${startMinute}`, `${endingHour}:${endingMinute}`]
    try {
      const response = await fetch(`${URL}?action=create`, {
        method: 'POST',
        body: JSON.stringify({
          first_name,
          first_last_name,
          second_last_name,
          email,
          shift_duration,
          work_shift
        })
      })
      if (response.status == 201) {
        alert('Usuario creado')
        navigate('/home')
      } else {
        alert('Ocurió un problema')
      }
    } catch (error) {
      alert('Courrió un problema')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant='h4' color={'#646cff'}>Ingrese la siguiente información</Typography>
      <TextField label='Nombre' onChange={e => setFirst_name(e.target.value)} />
      <TextField label='Apellido Paterno' onChange={e => setFirst_last_name(e.target.value)} />
      <TextField label='Apellido Materno' onChange={e => setSecond_last_name(e.target.value)} />
      <TextField label='Email' onChange={e => setEmail(e.target.value)} />
      <TextField label='Jornada' onChange={e => setShift_duration(e.target.value)} />
      <Typography color={'#646cff'}>Horario de entrada</Typography>
      <Stack direction='row' spacing={1} justifyContent='space-between'>
        <TextField label='Hora' onChange={e => setStartHour(e.target.value)} />
        <TextField label='Minuto' onChange={e => setStartMinute(e.target.value)} />
      </Stack>
      <Typography color={'#646cff'}>Horario de salida</Typography>
      <Stack direction='row' spacing={1} justifyContent='space-between'>
        <TextField label='Hora' onChange={e => setendingHour(e.target.value)} />
        <TextField label='Minuto' onChange={e => setendingMinute(e.target.value)} />
      </Stack >
      <Stack direction='row' justifyContent='center' spacing={5}>
        <Button variant='contained' disabled={loading} onClick={handleCreate}>Crear</Button>
        <Button variant='contained' disabled={loading} onClick={() => navigate('/home')}>Cancelar</Button>
      </Stack>
    </Stack>
  )
}