import { BrowserRouter as Router } from 'react-router-dom'
import Path from './components/Path'
import Nav from './components/Nav/Nav'
import { MyProvider } from './components/Context'

function App () {
  return (
    <MyProvider>
      <Router>
        <Nav />
        <Path />
      </Router>
    </MyProvider>
  )
}

export default App
