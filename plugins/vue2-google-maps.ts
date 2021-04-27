import Vue from 'vue'
import * as VueGoogleMaps from '~/node_modules/vue2-google-maps'

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDVsndM5LyMAb5If-6D9T2rw0myLdlC1Vk',
    // key: 'AIzaSyBR6O9Q-ZQscuvqVz1xaYeDKXg1z17CG-g',
    libraries: 'places',
  },
})
