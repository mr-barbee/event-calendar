import { useState, useEffect } from 'react'
import { useQueryClient, useMutation } from 'react-query'
import useEventService from '../../../api/useEventService'

const useRemoveVolunteer = () => {
  const queryClient = useQueryClient()
  const [,, updateEvent] = useEventService()
  const { isLoading: eventMutationLoading, data: mutationEventData, mutate: mutateEvent } = useMutation((values) => updateEvent(values))

  const [eventData, setEventData] = useState(() => {
    if (!mutationEventData) return null
    return mutationEventData
  })

  const removeVolunteer = id => {
    // Add the id to the values.
    const values = {
      id: id,
      categories:[],
      hours:0,
      note:'',
      remove: true
    }
    // Update the event with
    // the event volunteer data.
    mutateEvent(values, {
      onSuccess: () => {
        // refetch the event data
        queryClient.invalidateQueries([`get-event-${id}`])
        queryClient.invalidateQueries(['get-user-events'])
      }
   })
  }

  useEffect(() => {
    if (!mutationEventData) {
      setEventData(null)
    } else {
      setEventData(mutationEventData)
    }
  }, [mutationEventData])

  return [eventMutationLoading, eventData, removeVolunteer]
}

export default useRemoveVolunteer
