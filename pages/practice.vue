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
    <div class="pa-1">
      <v-btn @click="setCircle">半径セット</v-btn>
    </div>
    <div>
      <v-btn @click="deleteOutOfCirclePin">範囲外のピン消し</v-btn>
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
        :draggable="false"
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
    <!-- vuetify ポップアップ -->
      <v-app id="inspire">
        <div class="text-center">
          <v-dialog
            v-model="dialog"
            width="500"
          >
            <v-card>
              <v-card-title class="headline grey lighten-2">
                詳細情報
              </v-card-title>
      
              <v-card-text>{{selectedPlace.title}}</v-card-text>
              <span>値段:</span>
              <span v-if="selectedPlace.priceLevel == undefined">不明</span>
              <v-icon v-for="n in selectedPlace.priceLevel" :key="n">mdi-currency-jpy</v-icon>
              <!-- <v-icon>mdi-currency-jpy</v-icon> -->
              <p>評価:{{selectedPlace.rating}}</p>
              <span v-if="selectedPlace.rating == undefined">不明</span>
              
              <!-- TODO v-modelで制御されているコンポーネント中のカルーセルが効かないのでteratailで質問中。笑  -->
              <!-- <v-carousel>
                <v-carousel-item
                  v-for="(item,i) in items"
                  :key="i"
                  :src="item.src"
                ></v-carousel-item>
              </v-carousel> -->
              <v-img
                v-if="selectedPlace.photos[0]"
                :lazy-src="selectedPlace.photos[0]"
                max-height="300"
                max-width="422"
                :src="selectedPlace.photos[0]"
              ></v-img>
              <v-card-text v-if="!selectedPlace.photos[0]">画像はありません</v-card-text>
              
              <v-divider></v-divider>
      
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  text
                  @click="addDateSpots({
                    id: selectedPlace.id,
                    title: selectedPlace.title,
                  })"
                >
                  デートに追加する
                </v-btn>
                <v-btn
                  color="primary"
                  text
                  @click="dialog = false"
                >
                  閉じる
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-app>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
declare let google: any;

document.addEventListener('touchstart', function() {}, {passive: true});


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
  dateSpots: {id:string, title:string}[],
  lat: any,
  lng: any,
  balloon: {position: number},
  id: number,
  directionsMsg: string,
  destination: string,
  keyword: string,
  DS: any,
  DR: any,
  waypoints: {location: {lat: void, lng: void}}[],
  circleInstance: {},
  dialog: boolean,
  selectedPlace:{id: string, title: string, photos: string[], priceLevel: number, rating: number},
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
      waypoints: [],
      circleInstance: {},
      dialog:false,
      selectedPlace:{
        id: '', title: '', photos: [], priceLevel: 0, rating: 0
        },
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
          console.log('position', position);
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
      console.log('hogehoge');
    },
    setPlaceMakers() {
      let map = (this as any).$refs.mapRef.$mapObject;
      let placeService = new google.maps.places.PlacesService(map);
      let _this = this;
      this.DS = new google.maps.DirectionsService();
      this.DR = new google.maps.DirectionsRenderer();
      //Places APIのnearbySearchを使用する
      placeService.nearbySearch(
        {
          location: new google.maps.LatLng(this.maplocation.lat, this.maplocation.lng),
          radius: '1000',
          type: ['restaurant'],
          keyword: ''
        },
        function(this: any, results: any, status: any) {
          console.log('Status', google.maps.places.PlacesServiceStatus);
          if(status === google.maps.places.PlacesServiceStatus.OK) {
            
            results.forEach((place: any) => {
              // デフォルトのアイコンが大きめなので縮小
              let icon = {
                url: place.icon, // url
                scaledSize: new google.maps.Size(30, 30), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
              };
              
              // デートスポットの写真用
              let tmpPhotosArray: string[] = new Array();
              if ("photos" in place) {
                place.photos.forEach( (photo:any) => {
                  tmpPhotosArray.push(photo.getUrl({maxWidth: 640}));
                });
              }
              else {
                tmpPhotosArray.push('');
              }
                  
              let maker = {
                position: place.geometry.location,
                icon: icon,
                id: place.place_id,
                title: place.name,
                photos: tmpPhotosArray,
                priceLevel: place.price_level,
                rating: place.rating
              };
              this.markers.push(maker);
            });
            _this.setCircle();
          }
        }.bind(this)
      );
    },
    getZahyo() {
      let geocoder = new google.maps.Geocoder();
      // let _this = this;
      geocoder.geocode({'address': this.destination, 'language': 'ja'}, function(this: any, results: any, status: any) {
        if(status === google.maps.GeocoderStatus.OK) {
          let latLngArr = results[0].geometry.location.toUrlValue();
          let Arrayltlg = latLngArr.split(",");
          this.lat = Number(Arrayltlg[0]);
          this.lng = Number(Arrayltlg[1]);
          var opts = {
              center: new google.maps.LatLng(Arrayltlg[0], Arrayltlg[1]),
              zoom: 13
          };
          // let map = new google.maps.Map(document.getElementById("map"), opts);
          this.maplocation.lat = this.lat;
          this.maplocation.lng = this.lng;
          let maps = (this as any).$refs.mapRef.$mapObject;

          let placeService = new google.maps.places.PlacesService(maps);
          placeService.nearbySearch(
            {
              location: new google.maps.LatLng(this.lat, this.lng),
              radius: '550', // TODO radius:'1000'に設定すると想定する距離(半径1000m)よりも広い距離を対象に検索してしまう課題が未解決。'550'にすると想定する半径1000mに近しくなるので暫定的に対応。調べたけど不明。
              type: ['restaurant'],
              keyword: this.keyword
            },
            function(this: any, results: any, status: any) {
              if(status == google.maps.places.PlacesServiceStatus.OK) {
                this.markers = []; // 複数回検索した時に、前回のピンを削除する
                console.log('getZahyou result', results);
                results.forEach((place: any) => {
                  let icon = {
                    url: place.icon, // url
                    scaledSize: new google.maps.Size(30, 30), // scaled size
                    origin: new google.maps.Point(0,0), // origin
                    anchor: new google.maps.Point(0, 0) // anchor
                  };
                  
                  let tmpPhotosArray: string[] = new Array();
                  if ("photos" in place) {
                    place.photos.forEach( (photo:any) => {
                      tmpPhotosArray.push(photo.getUrl({maxWidth: 640}));
                    });
                  }
                  else {
                    tmpPhotosArray.push('');
                  }
                  
                  
                  let maker = {
                    position: place.geometry.location,
                    icon: icon,
                    id: place.place_id,
                    title: place.name,
                    photos: tmpPhotosArray,
                    priceLevel: place.price_level,
                    rating: place.rating
                  };
                  this.markers.push(maker);
                  // console.log('markers', this.markers);
                });
                this.setCircle();
              }
            }.bind(this)
          )
        }
      }.bind(this)
      );
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
    setCircle(): void {
      let map = (this as any).$refs.mapRef.$mapObject;
      new google.maps.Circle({
        center: {lat: this.maplocation.lat, lng: this.maplocation.lng},// 中心点(google.maps.LatLng)
        fillColor: '#CCFFFF', // 塗りつぶし色
        fillOpacity: 0.5,// 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
        map: map,// 表示させる地図（google.maps.Map）
        radius: 1000,// 半径（ｍ）
        strokeColor: '#00FFFF',// 外周色
        strokeOpacity: 1, // 外周透過度（0: 透明 ⇔ 1:不透明）
        strokeWeight: 1// 外周太さ（ピクセル）
      });
    },
    onClickMarker(index: number, m: {id:string, title: string, position: {lat: () => void, lng: () => void}, photos: string[], priceLevel: number, rating: number}): void {
      let _this = this
      this.dialog = true;
      if(this.DR === null) {
        this.DR = new google.maps.DirectionsRenderer();
      }
      //m取れてるか確認
      if(m) {
        this.selectedPlace.id = m.id;
        this.selectedPlace.title = m.title;
        this.selectedPlace.photos = m.photos;
        this.selectedPlace.priceLevel = m.priceLevel;
        this.selectedPlace.rating = m.rating;
      　
        let map = (_this as any).$refs.mapRef.$mapObject;
        const center = {lat: _this.maplocation.lat, lng: _this.maplocation.lng}
        let destination = {lat: m.position.lat(), lng: m.position.lng()};
        //クリックしたところがすでに押されてるか確認
        let trueOrfalse = false
        for(let i = 0; i < _this.waypoints.length; i++) {
          let latBoolean = this.waypoints[i].location.lat === destination.lat;
          let lngBoolean = this.waypoints[i].location.lng === destination.lng;
          if(latBoolean === true && lngBoolean === true) {
            trueOrfalse = true
          }
        }
        //クリックした場所がwaypointsにあったら別処理
        if(trueOrfalse) {
          //waypointsからクリックした場所消し
          _this.waypoints = _this.waypoints.filter(el => el.location.lat !== destination.lat && el.location.lng !== destination.lng);
          //filterでwaypointsなくなったらルート消し
          if(_this.waypoints.length === 0) {
            this.DR.setMap(null);
            return
          }
          //waypointsの最後の場所を目的地に
          destination = {lat: _this.waypoints[_this.waypoints.length - 1].location.lat, lng: _this.waypoints[_this.waypoints.length - 1].location.lng}
          //waypointsからdestination消し
          _this.waypoints.pop();
          _this.DR.setMap(map);
          const route = {
            origin: center,
            destination: destination,
            waypoints: _this.waypoints,
            travelMode: 'DRIVING'
          }
          _this.DS.route(route,
            function(response: any, status: any) {
              if(status !== 'OK') {
                window.alert('Directions request failed due to ' + status);
                return
              } else {
                _this.waypoints.push({location: destination});
                _this.DR.setDirections(response);
                let directionsData = response.routes[0].legs[0];
                if(!directionsData) {
                  window.alert('Directions request failed');
                  return;
                } else {
                  _this.directionsMsg = directionsData.distance.text + directionsData.duration.text + '.'
                }
              }
            }
          );
          return
        } else {
          _this.DR.setMap(map);
          const route = {
            origin: center,
            destination: destination,
            waypoints: _this.waypoints,
            travelMode: 'DRIVING'
          }
          _this.DS.route(route,
            function(response: any, status: any) {
              if(status !== 'OK') {
                window.alert('Directions request failed due to ' + status);
                return
              } else {
                _this.waypoints.push({location: destination});
                _this.DR.setDirections(response);
                let directionsData = response.routes[0].legs[0];
                if(!directionsData) {
                  window.alert('Directions request failed');
                  return;
                } else {
                  _this.directionsMsg = directionsData.distance.text + directionsData.duration.text + '.'
                }
              }
            }
          );
          return
        }
//         this.DR.setMap(map);
//         const route = {
//           origin: center,
//           destination: dakota,
//           // waypoints: _this.waypoints,
//           waypoints: _this.waypoints,
//           travelMode: 'DRIVING'
//         }
//         console.log('route', route);
//         this.DS.route(route,
//           function(response, status) {
//             if(status !== 'OK') {
//               window.alert('Directions request failed due to ' + status);
//               return
//             } else {
//               // _this.waypoints.push({location: dakota});
//               _this.DR.setDirections(response);
//               let directionsData = response.routes[0].legs[0];
//             //Get data about the mapped route
//               if(!directionsData) {
//                 window.alert('Directions request failed');
//                 return;
//               } else {
//                 console.log(directionsData);
//                 _this.directionsMsg = directionsData.distance.text + directionsData.duration.text + '.'
//               }
//             }
//           }
//         );
      } else {
        console.log('値取れてないよ～')
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
    },
    deleteOutOfCirclePin() {
      let center = ''
    },
    addDateSpots(data : {id: string, title: string}) {
      this.dateSpots.push({
        id: data.id,
        title: data.title
      })
      alert("デートに追加しました。")
      this.dialog = false;

    }
  }
})
</script>

<style lang="scss">
.modal_wrap input{
  display: none;
}

.modal_overlay{
  display: flex;
  justify-content: center;
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  opacity: 0;
  transition: opacity 0.5s, transform 0s 0.5s;
  transform: scale(0);
}

.modal_trigger{
  position: absolute;
  width: 100%;
  height: 100%;
}

.modal_content{
  align-self: center;
  width: 60%;
  max-width: 800px;
  padding: 30px 30px 15px;
  box-sizing: border-box;
  background: #fff;
  line-height: 1.4em;
  transform: scale(0.3);
  transition: 0.5s;
}

.close_button{
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 24px;
  cursor: pointer;
}

.modal_wrap input:checked ~ .modal_overlay{
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.5s;
}

.modal_wrap input:checked ~ .modal_overlay .modal_content{
  transform: scale(1);
}

.open_button{
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 30px;
  margin: auto;
  padding: 8px 16px;
  color: #444;
  font-weight: bold;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 1px 3px rgba(0,0,0,0.6);
  border-radius: 16px;
  cursor: pointer;
}
</style>
