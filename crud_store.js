

import {get, put, post, del, moduleOptions as apiOptions} from './api'

let defaultOptions = {
  errorMessageCallback: m => { console.log(m) }
} 

let defaultUiState = {
  state: {
    id_key: 'id'
  },
  getters: {
    endpoint: (state, getters, rootState) => (id) => {
      if (!id)
        return 'http://collection'
      return 'http://collection/' + id
    }
  }
}

export const createCrudStore = (ui_state = defaultUiState, opt = {}) => {
  // Assign API options
  Object.assign(apiOptions, defaultOptions, opt)

  const state = {
    collection: [] 
  }

  const mutations = {
    RECEIVE_RESOURCE(state, {resource}) {
      let idAttr = state.ui_state.id_key
      let old_resource = state.collection.find(item => item[idAttr] == resource[idAttr])
      if (!old_resource)
        return state.collection.push(resource)
      state.collection = state.collection.map(item => {
        if (item[idAttr] == resource[idAttr])
          return resource
        return item
      })
    },
    RECEIVE_COLLECTION(state, {resources}) {
      state.collection = resources
    },
    DELETE_RESOURCE(state, {id}) {
      let idAttr = state.ui_state.id_key
      state.collection = state.collection.filter(item => {
        return item[idAttr] != id
      })
    }
  }

  const actions = {
    create({state, commit, getters}, {resource}) {
      console.log('CREATE')
      let endpoint = getters.endpoint()
      let json = JSON.stringify(resource)
      return post(endpoint, {
        body: json
      })
        .then(resource => {
          commit('RECEIVE_RESOURCE', {resource})
          return resource
        })
    },
    read({state, commit, getters}, {id = null} = {}) {
      console.log('READ')
      let endpoint = getters.endpoint(id)
      return get(endpoint)
        .then(resource => {
          if (resource.resources)
            commit('RECEIVE_COLLECTION', {resources: resource.resources})
          else
            commit('RECEIVE_RESOURCE', {resource})
        })
    },
    update({state, commit, getters}, {resource}) {
      console.log('UPDATE')
      let id = resource[state.ui_state.id_key]
      let endpoint = getters.endpoint(id)
      let json = JSON.stringify(resource)
      return put(endpoint, {
        body: json
      })
        .then(resource => {
          commit('RECEIVE_RESOURCE', {resource})
        })
    },
    del({state, commit, getters}, {resource}) {
      console.log('DEL')
      let id = resource[state.ui_state.id_key]
      let endpoint = getters.endpoint(id)
      return del(endpoint)
        .then(result => {
          commit('DELETE_RESOURCE', {id})
        })
    }
  }

  return {
    namespaced: true,
    state,
    mutations,
    actions,
    modules: {
      ui_state
    }
  }


}
