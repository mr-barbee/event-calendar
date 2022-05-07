import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import timelinePlugin from '@fullcalendar/timeline'
import interactionPlugin from '@fullcalendar/interaction'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import 'bootstrap-icons/font/bootstrap-icons.css'
import EventDetail from './EventDetail'
import EventService from '../../api/EventService'
import { useQuery } from 'react-query'
import { Spinner, Button } from 'react-bootstrap'

function EventCalendar() {
  const calendarRef = useRef(null)
  const [eventDetail, setEventDetail] = useState(false)
  const { isLoading: eventsLoading, data: eventData } = useQuery(['get-events'], () => EventService.getEvents({'limit': 10, 'offset': 0, 'date':'01-05-2022', 'range': '12 month', 'user': null}))


  const renderEventContent = eventInfo => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    )
  }

  // @TODO REMOVE We can hook into the calendar API.
  const someMethod = () => {
    let calendarApi = calendarRef.current.getApi()
    calendarApi.next()
  }

  const handleDateClick = arg => {
    console.log(arg)
  }

  const handleEventClick = arg => {
    setEventDetail(arg.event.id)
  }

  return (
    <div className="contact-form">
      {eventDetail &&
        <EventDetail
          id={eventDetail}
          onHide={() => setEventDetail(false)}
        />
      }
      {eventData && !eventsLoading && eventData.errors === undefined &&
        <>
          <FullCalendar
            ref={calendarRef}
            plugins={[ dayGridPlugin, interactionPlugin, bootstrap5Plugin, timeGridPlugin, timelinePlugin ]}
            initialView="dayGridMonth"
            events={eventData.events.items}
            dateClick={handleDateClick}
            // eventContent={renderEventContent}
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
