import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import ComicSlide from './components/ComicSlide.vue'
import Index from './components/Index.vue'


export default new Router({
  routes: [
    { path: '/slide', component: ComicSlide},
    { path: '/index', component: Index},
  ]
})
