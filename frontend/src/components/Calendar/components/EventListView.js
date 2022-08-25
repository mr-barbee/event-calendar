import { Card } from 'react-bootstrap'
import Moment from 'moment'
import { Link } from 'react-router-dom'
import './../style.scss'

export default function EventListView({ events }) {
  function partition(array, isValid) {
    return array.reduce(([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    }, [[], []]);
  }
  // We want to seperate out the current and archive events.
  const [current, archive] = partition(events, (e) => Moment(e.end) > Moment.now());

  return (
    <>
      {current &&
        <div className="card-container">
          {current.map((value, index) => (
            <Link key={index} to={`/event-calendar/${value.id}`}>
              <Card className='current'>
                <Card.Title>{value.title}</Card.Title>
                <Card.Text className="small">{value.summary}</Card.Text>
                <Card.Text className="xsmall">
                  <strong>Start:</strong> {Moment(value.start).format('M/DD/YYYY - h:mma')}<br />
                  <strong>End:</strong> {Moment(value.end).format('M/DD/YYYY - h:mma')}
                </Card.Text>
                <div className="go-corner" href="#">
                  <div className="go-arrow">
                    →
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      }
      {archive &&
        <>
          <hr className="hr-text" data-content="ARCHIVES" />
          <div className="card-container">
            {archive.map((value, index) => (
              <Card key={index} className='archive'>
                <Card.Title>{value.title}</Card.Title>
                <Card.Text className="small">{value.summary}</Card.Text>
                <Card.Text className="xsmall">
                  <strong>Start:</strong> {Moment(value.start).format('M/DD/YYYY - h:mma')}<br />
                  <strong>End:</strong> {Moment(value.end).format('M/DD/YYYY - h:mma')}
                </Card.Text>
              </Card>
            ))}
          </div>
        </>
      }
    </>
  )
}
