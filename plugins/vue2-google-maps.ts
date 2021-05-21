import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDVsndM5LyMAb5If-6D9T2rw0myLdlC1Vk',
    libraries: 'places',
  },
})
