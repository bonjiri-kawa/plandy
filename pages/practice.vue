<template>
  <div>
    <v-app>
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
    <v-row>
      <div class="pa-1">
        <v-btn @click="clickDialog">ダイアログ</v-btn>
      </div>
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
      <div>
        <v-btn @click="backToBeforeMap">戻る</v-btn>
      </div>
    </v-row>
    <v-row>
      <div>
        {{ waypoints }}
      </div>
      <div>
        {{ waypointsName }}
      </div>
    </v-row>
    <v-row>
      <v-col md="9">
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
          <GmapInfoWindow>
            <p>hoge</p>
          </GmapInfoWindow>
          <GmapMarker
            v-for="(marker, index) in markers"
            v-bind:key="marker.id"
            :position="marker.position"
            :clickable="true"
            :draggable="false"
            @click="onClickMarker(index, marker)"
            :icon="{
              url: marker.icon.url,
              origin: marker.icon.origin,
              anchor: marker.icon.anchor,
              scaledSize: marker.icon.scaledSize
            }"
          />
        </GmapMap>
      </v-col>
      <v-col md="3" class="pl-0 pr-3">
        <div class="mb-4">
          <h4>デートルート</h4>
        </div>
        <draggable tag="ul">
          <li v-for="item, index in items" :key="item.no" class="date-item-one">
            <p class="date-item-one-name">
              {{item.name}}-(No.{{item.no}})
            </p>
            <!-- <div class="date-item-one-border" v-if="index != items.length - 1"> -->
            <div class="date-item-one-border">
              <div class="date-item-under"></div>
            </div>
          </li>
        </draggable>
        <div class="date-item-end">
          デート終了
        </div>
      </v-col>
    </v-row>
    <div>
      距離と時間
      {{directionsMsg}}
    </div>
    <div>
      デートスポット
      {{ dateSpots }}
    </div>
    <!-- vuetify ポップアップ -->
      <!-- <v-app id="inspire" v-show="dialogShow">
        <div class="text-center">
          <v-dialog
            v-model="dialog"
            width="500"
          >
            <v-card>
              <v-card-title class="headline grey lighten-2">
                詳細情報
              </v-card-title>
              <v-carousel v-model="model">
                <v-carousel-item
                  v-for="(color, i) in colors"
                  :key="color"
                >
                  <v-sheet
                    :color="color"
                    height="100%"
                    tile
                  >
                    <v-row
                      class="fill-height"
                      align="center"
                      justify="center"
                    >
                      <div class="text-h2">
                        Slide {{i + 1}}
                      </div>
                    </v-row>
                  </v-sheet>
                </v-carousel-item>
              </v-carousel>
              <!-- <v-card-text>{{selectedPlace.title}}</v-card-text>
              <v-img
                v-if="selectedPlace.photo"
                :lazy-src="selectedPlace.photo"
                max-height="300"
                max-width="422"
                :src="selectedPlace.photo"
              ></v-img>
              <v-card-text v-if="!selectedPlace.photo">画像はありません</v-card-text>
              
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
              </v-card-actions> -->
            <!-- </v-card>
          </v-dialog>
        </div>
      </v-app> -->
    </v-app>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
declare let google: any;
import draggable from 'vuedraggable';

document.addEventListener('touchstart', function() {}, {passive: true});

const defaultIcon = require('../assets/icon/places_21753.png');


interface Data {
  maplocation: {lng: number, lat: number}
  zoom: number
  styleMap: {width: string, height: string}
  mapOptions: {
    streetViewControl: boolean
    styles: string[]
  }
  markers: {
    id: number | string,
    title: string,
    position: {
      lat: () => number,
      lng: () => number
    },
    icon: {url: string},
    destination: boolean
  }[]
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
  waypoints: {location: {lat: number, lng: number}}[],
  circleInstance: {},
  dialog: boolean,
  selectedPlace:{id: string, title: string, photo: string},
  iconArrayNumber: string[],
  iconDefault: string,
  iconNum: number,
  model: number,
  colors: string[],
  dialogShow: boolean,
  lastDestination: string,
  waypointsName: string[],
  items: {}[]
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
      markers: [],
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
      dialog: true,
      selectedPlace:{
        id: '', title: '', photo: ''
        },
      //selectedPlace:{title: string, position: {lat: () => void, lng: () => void}}
      iconArrayNumber: [
        'http://maps.google.com/mapfiles/kml/pal3/icon0.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon1.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon2.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon3.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon4.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon5.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon6.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon7.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon16.png',
        'http://maps.google.com/mapfiles/kml/pal3/icon17.png',
      ],
      iconDefault: defaultIcon,
      iconNum: 0,
      model: 0,
      colors: [
        'primary',
        'secondary',
        'yellow darken-2',
        'red',
        'orange',
      ],
      dialogShow: false,
      lastDestination: '',
      waypointsName: [],
      items:[
        {no:1, name:'キャベツ', categoryNo:'1'},
        {no:2, name:'ステーキ', categoryNo:'2'},
        {no:3, name:'リンゴ', categoryNo:'3'}
      ]
    }
  },
  components: {
    draggable
  },
  async created() {
  },
  async mounted() {
    // let localMapMarkers = localStorage.getItem('mapMarkers');
    // let localRoute = localStorage.getItem('route'); 
    // let _this = this;
    // let respond = new Promise(function() {
    //   console.log('Promise1')
    //   if(localMapMarkers && localRoute) {
    //     console.log('Promise')
    //     localMapMarkers = JSON.parse(localMapMarkers);
    //     localRoute = JSON.parse(localRoute);
    //     let map = (_this as any).$refs.mapRef.$mapObject;
    //     _this.DS = new google.maps.DirectionsService();
    //     _this.DR = new google.maps.DirectionsRenderer();
    //     _this.DR.setMap(map);
    //   }
    // })
  let lastDestination = localStorage.getItem('lastDestination');
  if(lastDestination) {
    this.lastDestination = JSON.parse(lastDestination);
  }
  let iconNumLocal = localStorage.getItem('iconNum');
  if(iconNumLocal) {
    this.iconNum = JSON.parse(iconNumLocal);
  };
    if(navigator.geolocation) {
      // let _this = this
      navigator.geolocation.getCurrentPosition(
        function(this: any, position :any) {
          console.log('position', position);
          let coords = position.coords;
          //経度緯度を取得
          this.maplocation.lat = coords.latitude;
          this.maplocation.lng = coords.longitude;
console.log('lat, lng', this.maplocation.lat, this.maplocation.lng);
          //地図読み込み完了時のイベント
          this.$gmapApiPromiseLazy().then(() => {
            google.maps.event.addListenerOnce(this.$refs.mapRef.$mapObject, 'idle',
              function(this: any) { this.setPlaceMarkers()}.bind(this)
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
    clickDialog() {
      console.log(this.dialog);
      this.dialog = !this.dialog;
    },
    setPlaceMarkers() {
      let map = (this as any).$refs.mapRef.$mapObject;
      let placeService = new google.maps.places.PlacesService(map);
      let _this = this;
      this.DS = new google.maps.DirectionsService();
      this.DR = new google.maps.DirectionsRenderer();
      let localMapMarkersLocal = localStorage.getItem('mapMarkers');
      let localRoute = localStorage.getItem('route'); 
      if(localMapMarkersLocal && localRoute) {
        console.log('Promise')
        let localMapMarkers: {
          id: number | string,
          title: string,
          position: {
            lat: () => number,
            lng: () => number
          },
          icon: {url: string},
          destination: boolean
        }[] = JSON.parse(localMapMarkersLocal);
        let localRouteMap: {
          destination: {
            lat: number,
            lng: number
          },
          origin: {
            lat: number,
            lng: number
          },
          travelMode: string,
          waypoints: {
            location: {
              lat: number,
              lng: number
            }
          }[]
        } = JSON.parse(localRoute);
        this.waypoints = localRouteMap.waypoints;
        let map = (_this as any).$refs.mapRef.$mapObject;
        this.DR.setMap(map);
        this.DS.route(localRouteMap, function(response: any, status: any){
          if(status !== 'OK') {
            window.alert('Directions request failed due to ' + status);
            return
          } else {
            if(_this.iconNum < 10) {
              _this.waypoints.push({location: localRouteMap.destination})
            }
            _this.DR.setDirections(response);
          }
        });
        _this.markers = localMapMarkers;
      } else {
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
              console.log('this', this)
              console.log('results', results);
              console.log('hamada photo', results[0].photos[0].getUrl({maxWidth: 640}));
              
              results.forEach((place: any) => {
                // デフォルトのアイコンが大きめなので縮小
                let icon = {
                  // url: place.icon, // url
                  url: this.iconDefault,
                  scaledSize: new google.maps.Size(30, 30), // scaled size
                  origin: new google.maps.Point(0,0), // origin
                  anchor: new google.maps.Point(0, 0) // anchor
                };
                let maker = {
                  position: place.geometry.location,
                  icon: icon,
                  id: place.place_id,
                  title: place.name,
                  photo: ("photos" in place) ? place.photos[0].getUrl({maxWidth: 640}) : '',
                  destination: false,
                };
                this.markers.push(maker);
              });
              _this.setCircle();
            }
          }.bind(this)
        );
      }
    },
    getZahyo() {
      let geocoder = new google.maps.Geocoder();
      let _this = this;
      geocoder.geocode({'address': this.destination, 'language': 'ja'}, function(this: any, results: any, status: any) {
        if(status === google.maps.GeocoderStatus.OK) {
          let latLngArr = results[0].geometry.location.toUrlValue();
          let Arrayltlg = latLngArr.split(",");
          this.lat = Number(Arrayltlg[0]);
          this.lng = Number(Arrayltlg[1]);
          // var opts = {
          //     center: new google.maps.LatLng(Arrayltlg[0], Arrayltlg[1]),
          //     zoom: 13
          // };
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
              keyword: _this.keyword
            },
            function(this: any, results: any, status: any) {
              if(status == google.maps.places.PlacesServiceStatus.OK) {
                console.log('getZahyou result', results);
                results.forEach((place: any) => {
                  let icon = {
                    // url: place.icon, // url
                    url: this.iconDefault,
                    scaledSize: new google.maps.Size(30, 30), // scaled size
                    origin: new google.maps.Point(0,0), // origin
                    anchor: new google.maps.Point(0, 0) // anchor
                  };
                  let maker = {
                    position: place.geometry.location,
                    icon: icon,
                    id: place.place_id,
                    title: place.name,
                    photo: ("photos" in place) ? place.photos[0].getUrl({maxWidth: 640}) : '',
                    destination: false
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
    onClickMarker(index: number, m: {id:string, title: string, position: {lat: () => number, lng: () => number}, photo: string}): void {
console.log('m', m);
      if(this.iconNum >= 10) {
        console.log('10個以上はだめ！！')
        return undefined;
      } 
      let _this = this
      this.dialog = true;
      this.dialogShow = true;
      if(this.DR === null) {
        this.DR = new google.maps.DirectionsRenderer();
      }
      //m取れてるか確認
      if(m) {
        this.selectedPlace.id = m.id;
        this.selectedPlace.title = m.title;
        this.selectedPlace.photo = m.photo;
      　
        let map = (_this as any).$refs.mapRef.$mapObject;
        const center = {lat: _this.maplocation.lat, lng: _this.maplocation.lng}
        let destination: any;
        if(typeof m.position.lat === 'function' && typeof m.position.lng === 'function') {
          console.log('funciton??')
          destination = {lat: m.position.lat(), lng: m.position.lng()};
        } else {
          destination = {lat: m.position.lat, lng: m.position.lng};
        }
        //クリックしたところがすでに押されてるか確認
        let trueOrfalse: boolean = false;
        for(let i = 0; i < _this.waypoints.length; i++) {
          let latBoolean = this.waypoints[i].location.lat === destination.lat;
          let lngBoolean = this.waypoints[i].location.lng === destination.lng;
          if(latBoolean === true && lngBoolean === true) {
            trueOrfalse = true;
          }
        }
        //クリックした場所がwaypointsにあったら別処理
        if(trueOrfalse) {
          //waypointsからクリックした場所消し
          _this.waypoints = _this.waypoints.filter(el => el.location.lat !== destination.lat && el.location.lng !== destination.lng);
console.log('waypointsName', this.waypointsName);
console.log('m.title', m.title);
          _this.waypointsName = _this.waypointsName.filter(el => {
            console.log('el', el);
            return el !== m.title;
          });
console.log('waypointsName', _this.waypointsName);
          //クリックしたアイコン元に戻す
          _this.iconNum = _this.iconNum - 1;
          for(let i = 0; i < _this.markers.length; i++) {
            if(_this.markers[i].title === m.title) {
              _this.markers[i].icon.url = _this.iconDefault;
            }
          }
          //waypointsのアイコン整地
          for(let i = 0; i < _this.waypointsName.length; i++) {
            for(let j = 0; j < _this.markers.length; j++) {
              if(_this.waypointsName[i] === _this.markers[j].title) {
                _this.markers[j].icon.url = _this.iconArrayNumber[i];
              }
            }
          }
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
                // _this.waypointsName.push(m.title);
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
localStorage.setItem('route', JSON.stringify(route));
localStorage.setItem('lastDestination', JSON.stringify(m.title));
          _this.DS.route(route,
            function(response: any, status: any) {
              if(status !== 'OK') {
                window.alert('Directions request failed due to ' + status);
                return
              } else {
console.log('waypoints placeTitle', m.title);
                _this.waypoints.push({location: destination});
                _this.waypointsName.push(m.title);
                // _this.markers = _this.markers.filter(function(marker) {
                //   let latBoolean = marker.position.lat() === destination.lat
                //   let lngBoolean = marker.position.lng() === destination.lng
                //   return (latBoolean === true && lngBoolean === true) || marker.destination === true;
                // })
                // for(let i = 0; i < _this.markers.length; i++) {
                //   _this.markers[i].destination = true;
                //   _this.markers[i].icon.url = _this.iconArray[i];
                // }
                let latBoolean: boolean;
                let lngBoolean: boolean;
                for(let i = 0; i < _this.markers.length; i++) {
                  if(typeof _this.markers[i].position.lat === 'function' && typeof _this.markers[i].position.lng === 'function') {
                    latBoolean = _this.markers[i].position.lat() === destination.lat;
                    lngBoolean = _this.markers[i].position.lng() === destination.lng;
                    if(latBoolean === true && lngBoolean === true) {
                      _this.markers[i].icon.url = _this.iconArrayNumber[_this.iconNum++];
                    }
                  } else {
                    latBoolean = _this.markers[i].position.lat === destination.lat;
                    lngBoolean = _this.markers[i].position.lng === destination.lng;
                    if(latBoolean === true && lngBoolean === true) {
                      _this.markers[i].icon.url = _this.iconArrayNumber[_this.iconNum++];
                    }
                  }
                }
localStorage.setItem('mapMarkers', JSON.stringify(_this.markers));
localStorage.setItem('iconNum', JSON.stringify(_this.iconNum));
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

ul {
  list-style-type: none;
  padding-left: 0px !important;
}
li {
  cursor: pointer;
  padding-top: 10px;
  border: solid #ddd 1px;

}
.date {
  &-item {
    &-one {
      margin-bottom: 40px;
      &-border {
        // border-top: solid #ddd 1px;
        margin-top: 5px;
        position: relative;
      }
      &-name {
        padding-left: 5px;
        margin-bottom: 0px !important;
      }
    }
    &-under {
      width: 30px;
      height: 30px;
      border: 5px solid;
      border-color:  transparent transparent #565656 #565656;
      transform: rotate(-45deg);
      position: absolute;
      margin-left: 45%;
    }
    &-end {
      padding-left: 38%;
    }
    // &-under:last-child {
    //   display: none;
    // }
  }
}
</style>
