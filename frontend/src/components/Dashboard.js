import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  function navigation () {
    navigate('/contact-form')
  }

  return (
    <div className="login">
      <h1>Here is your dashboard</h1>
      <button type="submit" onClick={() => {navigation()}}>Next Screen</button>
    </div>
  );
}

export default Dashboard;
