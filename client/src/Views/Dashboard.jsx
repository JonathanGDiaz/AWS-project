import { Button, Stack, Typography, Card } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { URL } from '../config'

export default function Dashboard () {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  async function getWorkers () {
    try {
      const response = await fetch(`${URL}?action=getAll`, {
        method: 'POST'
      })

      if (response.status == 200) {
        const data = await response.json()
        setWorkers(data.workers)
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getWorkers()
  }, [refresh]);

  return (
    <Stack width={500}>
      <h1> Bienvenido </h1>
      <Stack direction='row' spacing={5} justifyContent='center'>
        <Button variant='contained' onClick={() => navigate('/create')}>Crear usuario</Button>
        <Button variant='contained' onClick={() => setRefresh(!refresh)}>Recargar</Button>
      </Stack>
      {
        workers.map(item => (
          <Card key={item.email} sx={{ margin: 1, backgroundColor: '#4f8ec2aa' }}
            onClick={() => navigate('/user', {
              state: {
                email: item.email,
                name: `${item.first_name} ${item.first_last_name} ${item.second_last_name ?? ''}`
              }
            })}>
            <Stack key={item.email} direction='row' justifyContent='space-between' sx={{ padding: 1 }}>
              <Typography variant='body1'>{`${item.first_name} ${item.first_last_name} ${item.second_last_name ?? ''}`}</Typography>
              <Typography variant='body1' color={item?.working ? 'green' : 'red'}>{item?.working ? 'Trabajando' : 'Ausente'}</Typography>
            </Stack>
          </Card>
        ))
      }

    </Stack >
  )
}