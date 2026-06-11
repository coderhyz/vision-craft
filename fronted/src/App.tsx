
// import './App.css'
import { router } from "./router";
import { RouterProvider } from "react-router-dom";
function App() {


  return (
    <>
      {/* 路由提供者 */}
      <RouterProvider router={router} />
    </>
  )
}

export default App
