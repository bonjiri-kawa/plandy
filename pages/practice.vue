<template>
  <div>
    <v-row>
      <v-col>
        <v-text-field
          label="目的地"
          outlined
          v-model="destination"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="キーワード"
          outlined
          v-model="keyword"
        ></v-text-field>
      </v-col>
    </v-row>
    <div class="pa-1">
      <v-btn @click="getZahyo">座標取得</v-btn>
    </div>
    <div class="pa-1">
      <v-btn @click="initMap">initMap</v-btn>
    </div>
    <v-col>
      <v-row justify="end">
          <v-btn @click="backToBeforeMap">戻る</v-btn>
      </v-row>
    </v-col>
    {{ waypoints }}
    <GmapMap
      :center="maplocation"
      ref="mapRef"
      map-type-id="roadmap"
      :zoom="zoom"
      :style="styleMap"
      :options="mapOptions"
      id="map"
      @click="mapClick"
    >
      <GmapInfoWindow
        :position="infoWindowPos"
        :opened="infoWinOpen"
        @closeclick="infoWinOpen = false"
      >
        <p>hoge</p>
        <!-- <p style ="color: #000">
          {{ marker.title }}
          hogehoge
        </p> -->
      </GmapInfoWindow>
      <GmapMarker
        v-for="(marker, index) in markers"
        v-bind:key="marker.id"
        :position="marker.position"
        :clickable="true"
        :draggable="true"
        @click="onClickMarker(index, marker)"
      />
    </GmapMap>
    <div>
      距離と時間
      {{directionsMsg}}
    </div>
    <div>
      デートスポット
      {{ dateSpots }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
declare let google: any;

interface Data {
  maplocation: {lng: number, lat: number}
  zoom: number
  styleMap: {width: string, height: string}
  mapOptions: {
    streetViewControl: boolean
    styles: string[]
  }
  markers: {id: number | string, title: string, position: {lat: number, lng: number}}[]
  markersSub: []
  infoOptions: {
    // minWidth: number,
    pixelOffset: {
      width: number, 
      height: number
    }
  }
  infoWindowPos: any
  infoWinOpen: boolean
  marker: {}
  geocoder: {}
  address: string
  latitude: number
  longitude: number
  search: string
  searchKeyword: string
  placesList: string[]
  map: any
  dateSpots: string[],
  lat: any,
  lng: any,
  balloon: {position: number},
  id: number,
  directionsMsg: string,
  destination: string,
  keyword: string,
  DS: any,
  DR: any,
  waypoints: {location: {lat: void, lng: void}}[]
}

export default Vue.extend({
  data(): Data {
    return {
      maplocation: {lng: 0, lat: 0},
      zoom: 15,
      styleMap: {
        width: '100%',
        height: '600px',
      },
      mapOptions: {
        streetViewControl: false,
        styles: []
      },
      markers: [
        {id: 'hoge', title: 'hoge1', position: {lat: 35.7, lng: 139.42}},
        {id: 2, title: 'hoge2', position: {lat: 35.69, lng: 139.41}},
        {id: 3, title: 'hoge3', position: {lat: 35.68, lng: 139.40}},
      ],
      markersSub: [],
      infoOptions: {
        // minWidth: 200,
        pixelOffset: {
          width: 0,
          height: -35,
        }
      },
      infoWindowPos: null,
      infoWinOpen: false,
      marker: {},
      geocoder: {},
      address: '',

      latitude: 0,
      longitude: 0,

      dateSpots: [],
      search: '',
      searchKeyword: '',
      placesList: [],
      map: null,
      lat: '',
      lng: '',
      balloon: {position: 100},
      id: 4,
      directionsMsg: '',
      destination: '',
      keyword: '',
      DS: '',
      DR: '',
      waypoints: []
    }
  },
  created() {
    // document.addEventListener('touchstart', function() {}, {passive: true});
  },
  mounted() {
    if(navigator.geolocation) {
      // let _this = this
      navigator.geolocation.getCurrentPosition(
        function(this: any, position :any) {
console.log('position', position)
          let coords = position.coords;
          //経度緯度を取得
          this.maplocation.lat = coords.latitude;
          this.maplocation.lng = coords.longitude;
          //地図読み込み完了時のイベント
          this.$gmapApiPromiseLazy().then(() => {
            google.maps.event.addListenerOnce(this.$refs.mapRef.$mapObject, 'idle',
            function(this: any) { this.setPlaceMakers()}.bind(this)
          );
          })
        }.bind(this),
        function(this:any, error: any) {
console.log('error', error);
          //エラーの場合は東京駅周辺に移動
          this.maplocation.lat = 35.6813092;
          this.maplocation.lng = 139.7677269;
        }.bind(this)
      );
    } else {
console.log('???')
      //現在地取得負荷の場合は東京駅周辺に移動
      this.maplocation.lat = 35.6813092;
      this.maplocation.lng = 139.7677269;
    }
  },
  methods: {
    closeFnc() {
console.log('hogehoge')
    },
    setPlaceMakers() {
      let map = (this as any).$refs.mapRef.$mapObject;
      let placeService = new google.maps.places.PlacesService(map);

      this.DS = new google.maps.DirectionsService();
      this.DR = new google.maps.DirectionsRenderer();
      //Places APIのnearbySearchを使用する
      placeService.nearbySearch(
        {
          location: new google.maps.LatLng(this.maplocation.lat, this.maplocation.lng),
          radius: '1000',
          type: ['restaurant'],
          keyword: '寿司'
        },
        function(this: any, results: any, status: any) {
console.log('Status', google.maps.places.PlacesServiceStatus);
          if(status === google.maps.places.PlacesServiceStatus.OK) {
            console.log('this', this)
console.log('results', results);
            results.forEach((place: any) => {
              // デフォルトのアイコンが大きめなので縮小
              let icon = {
                url: place.icon, // url
                scaledSize: new google.maps.Size(30, 30), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
              };
              let maker = {
                position: place.geometry.location,
                icon: icon,
                id: place.place_id,
                title: place.name
              };
              this.markers.push(maker);
            });
          }
        }.bind(this)
      );
    },
    getZahyo() {
      let geocoder = new google.maps.Geocoder();
      let _this = this;
      geocoder.geocode({'address': this.destination, 'language': 'ja'}, function(this: any, results: any, status: any) {
console.log('geocoder', geocoder);
        if(status === google.maps.GeocoderStatus.OK) {
          let latLngArr = results[0].geometry.location.toUrlValue();
          let Arrayltlg = latLngArr.split(",");
          _this.lat = Number(Arrayltlg[0]);
          _this.lng = Number(Arrayltlg[1]);
          var opts = {
              center: new google.maps.LatLng(Arrayltlg[0], Arrayltlg[1]),
              zoom: 13
          };
          // let map = new google.maps.Map(document.getElementById("map"), opts);
          _this.maplocation.lat = _this.lat;
          _this.maplocation.lng = _this.lng;
          let maps = (_this as any).$refs.mapRef.$mapObject;

          let placeService = new google.maps.places.PlacesService(maps);
          placeService.nearbySearch(
            {
              location: new google.maps.LatLng(_this.lat, _this.lng),
              radius: '500',
              type: ['restaurant'],
              keyword: _this.keyword
            },
            function(this: any, results: any, status: any) {
              if(status == google.maps.places.PlacesServiceStatus.OK) {
                results.forEach((place: any) => {
                  // デフォルトのアイコンが大きめなので縮小
                  let icon = {
                    url: place.icon, // url
                    scaledSize: new google.maps.Size(30, 30), // scaled size
                    origin: new google.maps.Point(0,0), // origin
                    anchor: new google.maps.Point(0, 0) // anchor
                  };
                  let maker = {
                    position: place.geometry.location,
                    icon: icon,
                    id: place.place_id,
                    title: place.name
                  };
                  _this.markers.push(maker);
                  console.log('markers', _this.markers);
                });
              }
            }.bind(_this)
          )
        }
      }.bind(_this)
      );
    },
    pushArea() {
      let area = {id: 8, title: 'hoge4', position: {lat: 35.67, lng: 139.39}}
      this.markers.push(area);
    },
    initMap() {
      // this.DS = new google.maps.DirectionsService();
      // this.DR = new google.maps.DirectionsRenderer();

      let defaultPosition = new google.maps.LatLng({
        lat: 34.366,
        lng: 132.471
      });
      const _this = this
      let map = (this as any).$refs.mapRef.$mapObject;

      // Locations of landmarks
      const dakota = {lat: 40.7767644, lng: -73.9761399};
      const frick = {lat: 40.771209, lng: -73.9673991};
      // The markers for The Dakota and The Frick Collection
      // var mk1 = new google.maps.Marker({position: dakota, map: map});
      // var mk2 = new google.maps.Marker({position: frick, map: map});

      this.DR.setMap(map);
      const route = {
        origin: dakota,
        destination: frick,
        travelMode: 'DRIVING'
      }
      this.DS.route(route,
        function(response: any, status: any) {
          if(status !== 'OK') {
            window.alert('Directions request failed due to ' + status);
            return
          } else {
            _this.DR.setDirections(response);
            let directionsData = response.routes[0].legs[0];
          //Get data about the mapped route
            if(!directionsData) {
              window.alert('Directions request failed');
              return;
            } else {
console.log(directionsData);
              _this.directionsMsg = directionsData.distance.text + directionsData.duration.text + '.'
            }
          }
        }
      );
    },
    onClickMarker(index: number, m: {title: string, position: {lat: () => void, lng: () => void}}): void {
      let _this = this
      if(m) {
        this.dateSpots.push(m.title);
        this.DS = new google.maps.DirectionsService();
        this.DR = new google.maps.DirectionsRenderer();
        // const _this = this
        let map = (_this as any).$refs.mapRef.$mapObject;
        const center = {lat: _this.maplocation.lat, lng: _this.maplocation.lng}
        const dakota = {lat: m.position.lat(), lng: m.position.lng()};
        this.DR.setMap(map);
        const route = {
          origin: center,
          destination: dakota,
          // waypoints: _this.waypoints,
          waypoints: _this.waypoints,
          travelMode: 'DRIVING'
        }
console.log('route', route);
        this.DS.route(route,
          function(response: any, status: any) {
            if(status !== 'OK') {
              window.alert('Directions request failed due to ' + status);
              return
            } else {
              // _this.waypoints.push({location: dakota});
              _this.DR.setDirections(response);
              let directionsData = response.routes[0].legs[0];
            //Get data about the mapped route
              if(!directionsData) {
                window.alert('Directions request failed');
                return;
              } else {
  console.log(directionsData);
                _this.directionsMsg = directionsData.distance.text + directionsData.duration.text + '.'
              }
            }
          }
        );
      }
    },
    mapClick ($event: any) {
    //$event.latLngにクリック地点が入っている
      console.log('event', $event);
    },
    backToBeforeMap() {
      console.log('backTo')
      // this.markers = [];
      let map = (this as any).$refs.mapRef.$mapObject;
      if (this.DR != null) {
        this.DR.setMap(null);
        this.DR = null;
      }
      // this.getZahyo();
    }
  }
})
</script>