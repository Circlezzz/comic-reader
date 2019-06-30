<template>
  <router-view></router-view>
</template>

<script>
// import ComicSlide from "./components/ComicSlide";
const ipc = require("electron").ipcRenderer;

export default {
  data() {
    return {
      // comic_img:[]
    };
  },
  methods: {},
  mounted() {
    ipc.on("redirectToHome", () => {
      this.$router.push("/index");
    });
    this.$router.push("/index");
  }
};
</script>

<style>
::-webkit-scrollbar {
  width: 0px;
}
</style>


