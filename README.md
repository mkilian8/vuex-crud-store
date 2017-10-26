# vuex-crud-store
Vuex store to handle basic create, read, update, delete operations with server. It maintains a collection of objects
fetched from the server and keeps it synchronized when performing CRUD opertations. The store is namespaced and simple
to integrate with Vue components. An optional vuex module can be passed in to configure the store. This way, collection store
dependencies can be calculated based on the application state.


#### Vuex store
```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// Optional vuex module to configure the collection store
let booksStore = {
  state: {
    id_key: 'id'
  },
  getters: {
    endpoint: (state, getters, rootState) => (id) => {
      if (!id)
        return 'http://mydomain.com/books'
      return 'http://mydomain.com/books/' + id
    }
  }
}

export default new Vuex.Store({
  modules: {
    books: createCollectionStore(booksStore),
  }
})
```


#### Vue component
```javascript
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState({
      books: state.books.collection
    })
  }
  methods: {
    ...mapActions('books', [
      'create',
      'read',
      'update',
      'del'
    ])
  } 
}
```


#### Endpoint format requirements
`vuex-crud-store` requires the API to format responses as specified below  
POST `/collection`
```
Request
{Resource}

Respone
{Created resource}
```
GET `/collection`
```
Response
{ 
  "resources": [{Resource},...]
}
```
GET `/collection/{id}`
```
Response
{Resource}
```
PUT `/collection/{id}`
```
Request
{Resource}

Response
{Updated resource}
```
DELETE `/collection/{id}`
```
Response
{
  "status": "success",
  "message": "Successfully deleted resource"
}
```


### API Reference
Creates a collection store with a config module
```
createCollectionStore(configModule)

configModule = {
  state: { id_key: int },
  getters: {
    endpoint: function() { ... }
  }
}
```

Store actions
```
store.dispatch('collection/create', { resource: Resource })
store.dispatch('collection/read')
store.dispatch('collection/read', {id})
store.dispatch('collection/update', { resource: Resource })
store.dispatch('collection/del', { resource: Resource })
```
