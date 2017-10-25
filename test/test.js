
import {get,put,post,del, moduleOptions} from '../api'
import {createCrudStore} from '../crud_store'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)


// Testing imports
import  'source-map-support/register'
import assert from 'assert';
const fetchMock = require('fetch-mock')


fetchMock.mock('http://success', { custommessage: 'customvalue' })
fetchMock.mock('http://notfound', { status: 404, body: { message: 'Response message' } })

describe('Api', function() {
  it('should reject non-200 return codes with code and json', (done) => {
    get('http://notfound')
      .then(() => { assert.fail('Non-200 return code has succeeded') })
      .catch((o) => {
        assert.notStrictEqual(o.code, undefined, 'code missing from promise payload')
        assert.notStrictEqual(o.json, undefined, 'json response missing from promise payload')
      })
      .then(done, done)
  })

  it('should accept 200 return codes and pass along json response', (done) => {
    get('http://success')
      .catch(() => { assert.fail('200 return code has failed') })
      .then((o) => {
        assert.strictEqual(o.custommessage, 'customvalue', 'Json response is not the main promise payload')
      })
      .then(done, done)
  })

  it('Should optionally hide error message', (done) => {
    let errorCalled = false
    moduleOptions.errorMessageCallback = () => { errorCalled = true }
    get('http://notfound', { showMsg: false })
      .catch(() => {
        assert.notEqual(errorCalled, true, 'Error message shown')
      })
      .then(done, done)
  })
});


import books from './books.json'
fetchMock.get('http://books', { resources: books.booksCollection })
fetchMock.post('http://books', (url, opt) => {
  return JSON.parse(opt.body)
})
fetchMock.get(/http:\/\/books\/(\d+)/, (url, opts) => {
  let id = url.split('/').reverse()[0]
  return books.booksCollection.find(book => book.id == id)
})
fetchMock.put(/http:\/\/books\/(\d+)/, (url, opts) => {
  return JSON.parse(opts.body)
})
fetchMock.delete(/http:\/\/books\/(\d+)/, { message: "deleted resource" })

describe('Crud Store', function() {
  const booksStore = { 
    state: { id_key: 'id' },
    getters: {
      endpoint: (state, getters, rootState) => (id) => {
        if (!id)
          return 'http://books'
        return 'http://books/' + id
      }
    }
  }
  const store = new Vuex.Store({
    modules: {
      books: createCrudStore(booksStore)
    }
  })

  it('can read a resource', (done) => {
    store.dispatch('books/read', {id:2}).then(() => {
      assert.deepEqual(store.state.books.collection, [books.booksCollection.find(book => book.id == 2)])
    }).then(() => {
      books.booksCollection.find(book => book.id == 2).author = 'New Auth'
      assert.notDeepEqual(store.state.books.collection, [books.booksCollection.find(book => book.id == 2)])
      return store.dispatch('books/read', {id:2})
    }).then(() => {
      assert.deepEqual(store.state.books.collection, [books.booksCollection.find(book => book.id == 2)])
    }).then(done, done)
  })
  
  it('can read a collection', (done) => {
    store.dispatch('books/read').then(() => {
      assert.deepEqual(store.state.books.collection, books.booksCollection)
    }).then(() => {
      books.booksCollection.find(book => book.id == 2).author = 'Another Auth'
      assert.notDeepEqual(store.state.books.collection, books.booksCollection)
      return store.dispatch('books/read')
    }).then(() => {
      assert.deepEqual(store.state.books.collection, books.booksCollection)
    }).then(done, done)
  })

  it('can create a resource', (done) => {
    store.dispatch('books/create', { resource: books.newBook }).then(() => {
      //console.log(store.state.books.collection)
      //console.log(books.booksCollection)
      assert.deepEqual(store.state.books.collection, books.booksCollection.concat([books.newBook]))
    }).then(done, done)
  })

  it('can update a resource', (done) => {
    store.dispatch('books/update', { resource: {id: 2, title: "Brand new title"} }).then(() => {
      assert.equal(store.state.books.collection.find(book => book.id == 2).title, "Brand new title")
    }).then(done, done)
  })
  
  it('can delete a resource', (done) => {
    store.dispatch('books/del', { resource: {id: 1} }).then(() => {
      assert.equal(store.state.books.collection.find(book => book.id == 1), null)
    }).then(done, done)
  })
});
