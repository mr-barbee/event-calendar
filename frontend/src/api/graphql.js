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
    verified
    never_verifed
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

export const UPDATEUSER = parameters => `mutation UpdateUser {
  updateUser(data: {
      name: ${parameters.name !== 'undefined' ? `"${parameters.name}"` : null},
      email: ${parameters.email !== 'undefined' ? `"${parameters.email}"` : null},
      pass: ${parameters.pass !== 'undefined' ? `"${parameters.pass}"` : null},
      currPass: ${parameters.currPass !== 'undefined' ? `"${parameters.currPass}"` : null},
      fullName: ${parameters.fullName !== 'undefined' ? `"${parameters.fullName}"` : null},
      phone: ${parameters.phone !== 'undefined' ? `"${parameters.phone}"` : null},
      primary: ${parameters.primary !== 'undefined' ? `"${parameters.primary}"` : null},
      contact: ${parameters.contact !== 'undefined' ? `${parameters.contact}` : null},
      categories: ${parameters.categories !== 'undefined' ? `[${parameters.categories}]` : null},
      experiences: ${parameters.experiences !== 'undefined' ? `[${parameters.experiences}]` : null},
      note: ${parameters.note !== 'undefined' ? `"${parameters.note}"` : null},
      needs_verification: ${parameters.needs_verification !== 'undefined' ? `${parameters.needs_verification}` : null},
    }) {
    ... on UserResponse {
      user {
        id
      }
      errors
    }
  }
}`
