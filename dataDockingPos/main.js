const App = () => import("./app.vue");

import("commonRemote/lib/create").then(({createApp}) => {
  createApp({
    el: "#app",
    path: "ac/dataDockingPos",
    render(h) {
      return h(App);
    }
  });
});
