const App = () => import("./app.vue");

import("commonRemote/lib/create").then(({createApp}) => {
  createApp({
    el: "#app",
    path: "ac/algModelMaintain",
    render(h) {
      return h(App);
    }
  });
});
