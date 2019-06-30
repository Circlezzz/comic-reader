<template>
  <v-app :style="backgroundColor">
    <v-toolbar class="nav-toolbar" dark color="rgba(32, 171, 32, 0.7)" app>
      <v-avatar color="grey lighten-4">
        <v-img src="/favicon.ico" alt="avatar"></v-img>
      </v-avatar>

      <v-toolbar-title class="white--text">Comic Reader</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="importFiles">
            <v-icon dark v-on="on">input</v-icon>
          </v-btn>
        </template>
        <span>Import Comics</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="returnHome">
            <v-icon dark v-on="on">home</v-icon>
          </v-btn>
        </template>
        <span>Home</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="toggleNightMode">
            <v-icon dark v-on="on">brightness_medium</v-icon>
          </v-btn>
        </template>
        <span>Night Mode</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="toggleFullscreenMode">
            <v-icon dark v-on="on">fullscreen</v-icon>
          </v-btn>
        </template>
        <span>Fullscreen</span>
      </v-tooltip>
    </v-toolbar>

    <v-container pt-0 pb-0>
      <v-layout text-xs-center wrap>
        <v-flex xl12>
          <div class="swiper-container">
            <div class="swiper-wrapper">
              <!-- <div class="swiper-slide"  v-for="(slide,i) in slides"
              :key="i"><img :src="slide" alt=""></div>-->
            </div>
            <!-- Add Pagination -->
            <div class="swiper-pagination"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-scrollbar"></div>
          </div>
        </v-flex>
      </v-layout>
    </v-container>

    <v-layout row wrap class="float-block" @mousewheel="onScroll">
      <v-flex
        xs2
        md2
        sm2
        class="maxHeight left-page"
        :class="{'point-cursor':pointerLeft}"
        @click="slidePrev"
      ></v-flex>
      <v-flex xs8 md8 sm8 class="maxHeight"></v-flex>
      <v-flex
        xs2
        md2
        sm2
        class="maxHeight right-page"
        :class="{'point-cursor':pointerRight}"
        @click="slideNext"
      ></v-flex>
    </v-layout>

    <div class="text-xs-center">
      <v-dialog v-model="errDialog" width="500">
        <v-card>
          <v-card-title class="headline red white--text" primary-title>
            <strong>Error!</strong>
          </v-card-title>

          <v-card-text>Failed to load comic file!</v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-3" flat @click="returnHome">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-app>
</template>

<script>
// import ComicSlide from "./components/ComicSlide";
const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;
import Swiper from "swiper";
import "swiper/dist/css/swiper.min.css";

export default {
  data() {
    return {
      backgroundColor: {
        backgroundColor: "#FFFFFF"
      },
      errDialog: false,
      showToolbar: false,
      pointerLeft: false,
      pointerRight: false
    };
  },
  methods: {
    importFiles: function() {
      // remote.getCurrentWindow().setFullScreen(false);
      ipc.send("open-file-dialog", "ComicSlider.vue");
    },
    renderImage: function() {
      var slideList = this.$store.getters.getSlides();
      if (slideList.length) {
        if (slideList.length == 1) {
          this.pointerLeft = false;
          this.pointerRight = false;
        } else {
          this.pointerLeft = false;
          this.pointerRight = true;
        }
        this.swiper.appendSlide(slideList);
        this.swiper.update();
        this.swiper.slideTo(0,300,false);
      } else {
        this.errDialog = true;
      }
    },
    returnHome: function() {
      remote.getCurrentWindow().setFullScreen(false);
      ipc.send("returnHome");
    },
    toggleNightMode: function() {
      this.$store.commit("changeBackgroundColor");
      this.backgroundColor.backgroundColor = this.$store.state.backgroundColor;
    },
    slidePrev: function() {
      // console.log('prev')
      this.swiper.slidePrev();
    },
    slideNext: function() {
      // console.log('next')
      this.swiper.slideNext();
    },
    toggleFullscreenMode: function() {
      if (!remote.getCurrentWindow().isFullScreen()) {
        remote.getCurrentWindow().setFullScreen(true);
      } else {
        remote.getCurrentWindow().setFullScreen(false);
      }
    },
    onScroll: function(e) {
      //滚一下deltaY值是100，100向下滚动，-100向上滚动
      e.deltaY > 0 ? this.slideNext() : this.slidePrev();
    }
  },
  mounted() {
    this.backgroundColor.backgroundColor = this.$store.state.backgroundColor;
    var swiper = new Swiper(".swiper-container", {
      //autoHeight: true,
      // slidesPerGroup: 2,
      slidesPerView: 1,
      spaceBetween: 30,
      // mousewheel: true,
      keyboard: {
        enabled: true
      },
      pagination: {
        el: ".swiper-pagination",
        type: "fraction"
      },
      scrollbar: {
        el: ".swiper-scrollbar",
        // hide: true,
        draggable: true
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      }
    });
    this.swiper = swiper;
    var comicData = this.$store.state.comic_data;
    if (comicData.length) {
      this.renderImage();
      this.$store.commit("clearComicData");
    } else {
      this.errDialog = true;
    }
    ipc.on("new-image-buffer-comic", (event, buffer) => {
      // this.comic_img = buffer;
      // this.$store.commit("clearComicData");
      this.$store.commit("putComicData", buffer);
      this.swiper.removeAllSlides();
      this.renderImage();
      this.$store.commit("clearComicData");
    });

    this.swiper.on("slideChange", () => {
      if (this.swiper.isBeginning && swiper.isEnd) {
        this.pointerLeft = false;
        this.pointerRight = false;
      } else if (this.swiper.isBeginning && !swiper.isEnd) {
        this.pointerLeft = false;
        this.pointerRight = true;
      } else if (this.swiper.isEnd && !swiper.isBeginning) {
        this.pointerLeft = true;
        this.pointerRight = false;
      } else {
        this.pointerLeft = true;
        this.pointerRight = true;
      }
    });

    document.addEventListener("keydown", event => {
      switch (event.key) {
        case "Escape":
          if (remote.getCurrentWindow().isFullScreen()) {
            remote.getCurrentWindow().setFullScreen(false);
          }
          break;
      }
    });
  }
};
</script>

<style>
.swiper-container {
  width: 100%;
  height: 100vh;
}
.ComicImage {
  width: auto;
  height: 100vh;
}

::-webkit-scrollbar {
  width: 0px;
}

.nav-toolbar {
  position: fixed;
  transition: opacity 0.3s linear 0.1s !important;
}
.nav-toolbar {
  opacity: 0;
  z-index: 15;
  /* 需要大于float-block的z-index值否则会被遮住，无法检测到hover */
}
.nav-toolbar:hover {
  opacity: 1;
}
.float-block {
  position: absolute;
  height: calc(100vh - 14px);
  width: 100%;
  z-index: 10;
}
.maxHeight {
  height: 100%;
}
.point-cursor {
  cursor: pointer;
}
</style>


