import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import timelinePlugin from '@fullcalendar/timeline'
import interactionPlugin from '@fullcalendar/interaction'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import 'bootstrap-icons/font/bootstrap-icons.css'
import EventList from './components/EventList'
import EventDetail from './components/EventDetail'
import { Submit } from '../_common/FormElements'
import useEventService from '../../api/useEventService'
import { useQuery } from 'react-query'
import { Spinner } from 'react-bootstrap'
import './style.scss'

function EventCalendar() {
  let navigate = useNavigate()
  const { id } = useParams()
  const calendarRef = useRef(null)
  const [eventDetail, setEventDetail] = useState(false)
  const [openList, setOpenList] = useState(false)
  const [, getEvents] = useEventService()
  const { isLoading: eventsLoading, data: eventData } = useQuery(['get-events'], () => getEvents({
    'limit': 10, 'offset': 0, 'date':'01-05-2022', 'range': '12 month', 'user': null
  }))

  // use this in the FullCalendar eventContent={renderEventContent}
  // const renderEventContent = eventInfo => {
  //   return (
  //     <>
  //       <b>{eventInfo.timeText}</b>
  //       <i>{eventInfo.event.title}</i>
  //     </>
  //   )
  // }

  // @TODO REMOVE We can hook into the calendar API.
  // const someMethod = () => {
  //   let calendarApi = calendarRef.current.getApi()
  //   calendarApi.next()
  // }

  const handleDateClick = arg => {
    console.log(arg)
  }

  const handleEventClick = arg => {
    setEventDetail(arg.event.id)
  }

  const handleEventDetailClose = () => {
    setEventDetail(false)
    // We want to remove the id
    // from the URL.
    if (id) navigate('/event-calendar')
  }

  useEffect(() => {
    if (id && !isNaN(id)) {
      setOpenList(false)
      setEventDetail(id)
    }
  }, [id])

  return (
    <div className="event-calendar">
      {eventDetail &&
        <EventDetail
          id={eventDetail}
          onHide={() => handleEventDetailClose()}
        />
      }
      {openList &&
        <EventList
          onHide={() => setOpenList(false)}
        />
      }
      {eventData && !eventsLoading && eventData.errors === undefined &&
        <>
          <div className="mb-3 mt-3">
            <p><strong>View your current list of events you volunteered for.</strong></p>
            <Submit onClick={() => setOpenList(true)} value="Volunteer List" />
          </div>
          <FullCalendar
            ref={calendarRef}
            plugins={[ dayGridPlugin, interactionPlugin, bootstrap5Plugin, timeGridPlugin, timelinePlugin ]}
            initialView="dayGridMonth"
            events={eventData.events.items}
            dateClick={handleDateClick}
            themeSystem="bootstrap5"
            eventClick={handleEventClick}
          />
          {/* @TODO REMOVE THIS EVENTUALLY. JUST TESTING*/}
          {/*<Button variant="primary" type="submit" onClick={someMethod}>Next Page</Button>*/}
        </>
      }
      {eventsLoading &&
        <Spinner animation="border" role="status" size="lg" >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      }
      {!eventsLoading && eventData && eventData.errors !== undefined &&
        <h1>{eventData.errors[0].message ?? 'Sorry there was an issue loading the events.'}</h1>
      }
    </div>
  )
}

export default EventCalendar
