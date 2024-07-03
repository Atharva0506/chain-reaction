
import './App.css'
import { BrowserRouter,Routes,Route } from "react-router-dom";

function App() {


  return (
    <>
     <BrowserRouter basename="/app">
      <Routes>
        <Route path="/"  /> 
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
