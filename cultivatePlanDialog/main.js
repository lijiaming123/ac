import Vue from "vue";
import Vuex from "vuex";
import "./../scheduleComponents/icon/iconfont.css";

Vue.use(Vuex);

const App = () => import("./app.vue");

import("commonRemote/lib/create").then(({createApp}) => {
  createApp({
    el: "#app",
    path: "ac/autoTurnShiftDialog",
    wqLayoutProps: {
      showLeft: false
    },
    render(h) {
      return h(App);
    }
  });
});
