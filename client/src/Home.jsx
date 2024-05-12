import { useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import throttle from 'lodash.throttle';
import  Cursor  from './components/Cursor';

const renderCursors = users => {
  return Object.keys(users).map(uuid => {
    const user = users[uuid];

    return (
      <Cursor key={uuid} point={[user.state.x, user.state.y]} />
    )
  })
}

const renderUserList = users => {
  return (
    <ul>
      {Object.keys(users).map(uuid => {
        return <li key={uuid}>{JSON.stringify(users[uuid])}</li>
      })}
    </ul>
  )
}

// eslint-disable-next-line react/prop-types
export function Home({ username }) {

  const WS_URL = 'ws://localhost:8000';
  const { sendJsonMessage, lastJsonMessage }= useWebSocket(WS_URL, {
    queryParams: { username }
  });

  const THROTTLE = 50;
  const sendJsonMessageThrottle = useRef(throttle(sendJsonMessage, THROTTLE));

  useEffect(() => {
    // pregunta al servidor para enviar los estados a todos en el segundo donde carga el componente
    sendJsonMessage({
      x: 0,
      y: 0
    })
    window.addEventListener('mousemove', e => {
      sendJsonMessageThrottle.current({
        x: e.clientX,
        y: e.clientY
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (lastJsonMessage) {
    return (
      <>
        {renderCursors(lastJsonMessage)}
        {renderUserList(lastJsonMessage)}
      </>
    )
  }


  return (
    <h1>Hello, {username} </h1>
  )
}