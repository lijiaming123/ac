const App = () => import("./app.vue");

import("commonRemote/lib/create").then(({createApp}) => {
  createApp({
    el: "#app",
    path: "ac/commodityMaintenance",
    render(h) {
      return h(App);
    }
  });
});
