import { useNavigate } from "react-router-dom"

const Landing = () => {
  const navigate =  useNavigate();
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center">
    <div className="max-w-4xl mx-auto px-4 py-8 flex items-center">
      <div className="w-1/2">
       
        <img src="https://play-lh.googleusercontent.com/2tF6m3v_8ZKE4mzfkYhsNrhgxaDfELL8QVDMirA3VCv0M6q67hBqRPPFw97oVnVI97o" alt="Game Preview" className="rounded-lg shadow-xl" />
      </div>
      <div className="w-1/2 px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Chain Reaction Game</h1>
        <p className="text-lg text-gray-700 mb-8">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex aperiam pariatur vitae eaque voluptatibus! Rerum, hic repellendus nisi, natus vero eveniet iste tenetur excepturi cupiditate adipisci asperiores unde blanditiis. Perferendis!
        </p>
        <div className="flex space-x-4">
          <button
            onClick={()=>navigate("/game")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
          >
            Play Now
          </button>
          <a
            href="/about"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Landing