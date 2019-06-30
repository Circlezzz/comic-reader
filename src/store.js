import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    comic_data:[],
    backgroundColor:"#FFFFFF",
  },
  mutations: {
    clearComicData (state) {
      state.comic_data=[];
    },
    putComicData (state, data ) {
      state.comic_data=data;
    },
    changeBackgroundColor (state) {
      if(state.backgroundColor==="#FFFFFF"){
        state.backgroundColor="#1E1E1E";
      }else{
        state.backgroundColor="#FFFFFF";
      }
    }

  },
  actions: {

  },
  getters: {
    getSlides(state){
      return function(){
        state.comic_data.sort(function(a,b){
          return a.name-b.name;
        })
        var slides=[];
        state.comic_data.forEach(function(data){
          var blob;
          if(data.ext==='.jpg'||data.ext==='.jpeg'){
            blob = new Blob([data.data],{type : 'image/jpeg'});
          }else if(data.ext==='.png'){
            blob = new Blob([data.data],{type : 'image/png'});
          }
          slides.push('<div class="swiper-slide"><img class="ComicImage" src="' +
          URL.createObjectURL(blob) +'" alt=""></div>')
        });
        return slides;
      };
    },
  }
})
