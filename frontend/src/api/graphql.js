export const GETUSER = `query GetUser {
  currentUser {
    id
    name
    email
    fullName
    phone
    primary
    contact
    categories
    experiences
    note
  }
}`

export const GETTAXONOMY = taxonomy => `query GetTaxonomies {
  taxonomies(limit: 15, offset:0, vocabulary:"${taxonomy}", id:0) {
    total
    items {
      id
      name
    }
  }
}`

export const GETEVENT = id => `query GetEvent {
  event(id: ${id}) {
    id
    title
    body
    start
    end
    categories
    volunteers
  }
}`

export const GETEVENTS = parameters => `query GetEvents{
  events(limit:${parameters.limit}, offset:${parameters.offset}, date:"${parameters.date}", range:"${parameters.range}", user:${parameters.user}) {
    total
    items {
      id
      title
      start
      end
    }
  }
}`

export const UPDATEEVENT = parameters => `mutation UpdateEvent {
  updateEvent(data: { id:${parameters.id}, categories:[${parameters.categories}], hours:${parameters.hours}, note:"${parameters.note}", remove:${parameters.remove}}) {
    ... on EventResponse {
      event {
        id
      }
      errors
    }
  }
}`
