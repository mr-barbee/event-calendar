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
