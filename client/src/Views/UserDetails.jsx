import { useState, useEffect } from 'react'
import { Stack, Card, Typography, Button } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { Tooltip, BarChart, XAxis, YAxis, Legend, CartesianGrid, Bar } from "recharts";
import { URL } from '../config'

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function UserDetails () {
  const location = useLocation()
  const [shifts, setShifts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [chartData, setChartData] = useState([]);

  async function getShifts () {
    try {
      const response = await fetch(`${URL}?action=getShifts`, {
        method: 'POST',
        body: JSON.stringify({
          email: location.state.email
        })
      })

      if (response.status == 200) {
        const data = await response.json()
        setShifts(data.shifts)
      }
    } catch (error) {
      console.log(error)
    }
  }

  function getHourDifference (date1, date2) {
    const millisecondsPerHour = 1000 * 60 * 60;

    const differenceMs = Math.abs(date1 - date2);

    const differenceHours = Math.floor(differenceMs / millisecondsPerHour);

    return differenceHours;
  }

  function createGraphData () {
    const data = [
      { name: 'Domingo', hours: 0 },
      { name: 'Lunes', hours: 0 },
      { name: 'Martes', hours: 0 },
      { name: 'Miércoles', hours: 0 },
      { name: 'Jueves', hours: 0 },
      { name: 'Viernes', hours: 0 },
      { name: 'Sábado', hours: 0 }
    ]

    shifts.forEach(shift => {
      if (!shift?.clock_out) return
      const creation = new Date(shift.date)
      const start = new Date(shift.clock_in)
      const end = new Date(shift.clock_out)
      const day = dayNames[creation.getDay()]
      const difference = getHourDifference(start, end)
      console.log(difference)
      const index = data.findIndex(item => item.name === day)
      data[index].hours += difference
    })
    setChartData(data)
  }

  useEffect(() => {
    getShifts()
  }, [refresh]);

  useEffect(() => {
    createGraphData()
  }, [shifts]);

  return (
    <Stack justifyContent='center' spacing={1}>
      <Typography variant='h4'>{location.state.name}</Typography>
      <BarChart
        width={800}
        height={200}
        data={chartData}
        barSize={20}
      >
        <XAxis
          dataKey="name"
          scale="point"
          padding={{ left: 15, right: 10 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="hours" fill="#8884d8" background={{ fill: "#eee" }} />
      </BarChart>
      <Button variant='contained' onClick={() => setRefresh(!refresh)}>Recargar</Button>
      {
        shifts.map(item => {
          const creation = new Date(item.date)
          const clockin = new Date(item.clock_in)
          const clockout = new Date(item.clock_out)

          const inString = `${clockin.getHours()}:${clockin.getMinutes()}`
          const outString = item.clock_out ? `${clockout.getHours()}:${clockout.getMinutes()}` : '-'
          return (
            <Card key={item.isLast} sx={{ margin: 1, backgroundColor: '#4f8ec2aa' }}>
              <Stack direction='row' justifyContent='space-evenly' alignItems='center'>
                <Typography>{creation.toDateString()}</Typography>
                <Stack direction='row' spacing={5}>
                  <Stack spacing={1}>
                    <Typography>Entrada</Typography>
                    <Typography>{inString}</Typography>
                  </Stack>
                  <Stack spacing={1}>
                    <Typography>Salida</Typography>
                    <Typography>{outString}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          )
        }
        )
      }
    </Stack>
  )
}