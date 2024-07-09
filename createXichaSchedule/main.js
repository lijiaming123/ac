import Vue from "vue";
// import Vuex from "vuex";
// import store from "./../scheduleComponents/store.js";

import "./../scheduleComponents/icon/iconfont.css";
import {message} from "./../scheduleComponents/message.js";

const App = () => import("./app.vue");

// Vue.use(Vuex);

import("commonRemote/lib/create").then(({createApp}) => {
  Vue.use(message);
  // utils.getLanguageFile();

  createApp({
    el: "#app",
    path: "ac/xichaSchedule",
    specialPath: "/ac/schedule-components",
    // store,
    render(h) {
      return h(App);
    }
  });
});
