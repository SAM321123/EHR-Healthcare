const Callbacks = {};
const Events = {
  on: (at, id, callback) => { Events.listen(at, id, callback); },
  listen: (at, id, callback) => {
    if (at === '') { return false; }
    if (at in Callbacks) {
      Callbacks[at][id] = callback;
    } else {
      Callbacks[at] = {};
      Callbacks[at][id] = callback;
    }
    return id;
  },
  t: (at, data) => Events.trigger(at, data),
  trigger: (at, data) => {
    const copyData = data || '';
    const obj = Callbacks[at];
    Object.keys(obj || {}).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) obj[key](copyData);
    });
  },
  rm: (at, id) => Events.remove(at, id),
  remove: (at, id) => { if (Callbacks[at] && Callbacks[at][id]) delete Callbacks[at][id]; },
  removeAll: (at) => { delete Callbacks[at]; },
};

module.exports = Events;
