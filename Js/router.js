window.GameRouter = (() => {
  let current='menu';
  function set(route){current=route}
  function get(){return current}
  return {set,get};
})();
