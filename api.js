

export const moduleOptions = {
  errorMessageCallback: m => { console.log(m) }
}


//API calls
const apiFetch = function(uri, opt) {
  opt.credentials = 'include';
  if (opt.showMsg == undefined)
    opt.showMsg = true;
  return fetch(uri, opt)
    .then(r => Promise.all([r.status, r.json()]))
    .then(([code, json]) => {
      if (code != 200)
        return Promise.reject({code, json});
      else
        return json;
    })
    .catch(obj => {
      let m = obj.message;
      if (obj.json) 
        m = obj.json.message;
      else
        m = `${opt.method} ${uri} failed`
      if (m && opt.showMsg) moduleOptions.errorMessageCallback(m);
      return Promise.reject(obj);
    });
}

export const get = function(uri, opt = {}) {
  opt.method = 'GET';
  return apiFetch(uri, opt);
}

export const put = function(uri, opt = {}) {
  opt.method = 'PUT';
  return apiFetch(uri, opt);
}

export const post = function(uri, opt = {}) {
  opt.method = 'POST';
  return apiFetch(uri, opt);
}

export const del = function(uri, opt = {}) {
  opt.method = 'DELETE';
  return apiFetch(uri, opt);
}
