const App = () => import("./app.vue");

import("commonRemote/lib/create").then(({createApp}) => {
  createApp({
    el: "#app",
    path: "ac/editShiftRules",
    render(h) {
      return h(App);
    }
  });
});
