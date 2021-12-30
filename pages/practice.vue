<template>
  <div>
    <v-app>
    <v-row class="mx-3 mt-5" justify="start">
      <v-col cols="12" sm="12" md="4" lg="4" xl="3">
        
        <v-text-field
          label="目的地"
          outlined
          v-model="destination"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="12" md="4" lg="4" xl="3">
        <v-text-field
          label="キーワード"
          outlined
          v-model="keyword"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="12" md="4" lg="4" xl="2">
        <div class="">
          <v-btn class="green white--text" @click="searchDatespot" x-large>検索</v-btn>
        </div>
      </v-col>
    </v-row>
    
    <v-row class="ml-3" justify="start">
      <v-col cols="12" sm="12" md="4" lg="2" xl="2">
        <v-select
          :items="spotTypeList"
          item-text="ja"
          item-value="en"
          label="検索カテゴリー"
          v-model="dateSpotCategory"
          dense
        ></v-select>
      </v-col>
      <v-col cols="12" sm="12" md="4" lg="2" xl="2">
        <v-select
          :items="priceItems"
          label="最小料金ランク"
          dense
          v-model="minPrice"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="12" md="4" lg="2" xl="2">
        <v-select
          :items="priceItems"
          label="最大料金ランク"
          dense
          v-model="maxPrice"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="12" md="4" lg="2" xl="2">
        <v-select
          :items="priceItems"
          label="検索範囲(Km)"
          dense
        ></v-select>
      </v-col>
      <!-- <v-col cols="12" sm="12" md="4" lg="3" xl="2">
        <v-select
          :items="priceItems"
          label="評価ランク"
          dense
          v-model="maxPrice"
        ></v-select>
      </v-col> -->
    </v-row>
    <!-- <v-row class="mx-2 mt-4" justify="center">
      <v-col cols="12" sm="12" md="4" lg="3" xl="2">
        <v-btn class="green white--text" @click="searchDatespot">検索</v-btn>
      </v-col>
    </v-row> -->

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
          <!-- <GmapMarker
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
          /> -->
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
          <li v-for="item, index in dateItems" :key="item.no" class="date-item-one">
            <p class="date-item-one-name">
              time.{{item.time}}-{{item.name}}
            </p>
            <!-- <div class="date-item-one-border" v-if="index != dateItems.length - 1"> -->
            <div class="date-item-one-border">
              <div class="date-item-under"></div>
              <div class="date-item-time">所要時間〇〇分</div>
            </div>
          </li>
        </draggable>
        <div class="date-item-end" v-if="dateItems.length > 0">
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
        <v-row class="mt-5">
      <div class="pa-1">
        <v-btn @click="clickDialog">ダイアログ</v-btn>
      </div>
      <div class="pa-1">
        <v-btn class="green white--text" @click="searchDatespot">検索</v-btn>
      </div>
      <div class="pa-1">
        <v-btn @click="initMap">initMap</v-btn>
      </div>
      <div class="pa-1">
        <v-btn @click="setCircle">半径セット</v-btn>
      </div>
      <div class="pa-1">
        <v-btn @click="deleteOutOfCirclePin">範囲外のピン消し</v-btn>
      </div>
      <div class="pa-1">
        <v-btn @click="backToBeforeMap">戻る</v-btn>
      </div>
      <div class="pa-1">
        <v-btn @click="deleteAllLocalStrage">ローカルストレージ全部削除</v-btn>
      </div>
      <div>
          <v-snackbar
            v-model="addDateSnackbar"
            :timeout="3000"
            right
            top
            color="success"
          >
            {{ snackbarText.success }}
          </v-snackbar>
          <v-snackbar
            v-model="removeDateSnackbar"
            :timeout="3000"
            right
            top
            color="red"
          >
            {{ snackbarText.remove }}
          </v-snackbar>
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
    <!-- vuetify ポップアップ -->
      <v-app id="inspire" v-show="dialogShow">
        <div class="text-center">
          <v-dialog
            v-model="dialog"
            width="500"
          >
            <v-card>
              <v-card-title class="headline grey lighten-2">
                {{selectedPlace.dateSpot.title}}
              </v-card-title>
              <v-carousel v-model="dataspotCarruselModel">
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
                        {{i + 1}}
                        <v-img
                          v-if="selectedPlace.dateSpot.photos[i]"
                          :lazy-src="selectedPlace.dateSpot.photos[i]"
                          max-height="300"
                          max-width="422"
                          :src="selectedPlace.dateSpot.photos[i]"
                        ></v-img>
                      </div>
                    </v-row>
                  </v-sheet>
                </v-carousel-item>
              </v-carousel>
              <v-card-text class="font-weight-bold">{{selectedPlace.dateSpot.title}}</v-card-text>
              <v-card-text class="font-weight-bold">価格帯：{{selectedPlace.dateSpot.priceLevel}}</v-card-text>
                <v-card
                  v-for="(review, index) in selectedPlace.dateSpot.reviews"
                  :key="index"
                  class="mx-auto"
                  max-width="344"
                >
                  <v-card-text>
                    <p class="text--primary">
                      {{review.author_name}}
                    </p>
                    <p>評価:{{review.rating}}</p>
                    <star-rating 
                      v-model="review.rating"
                      active-color="#f00"
                      v-bind:star-size="20">
                    </star-rating>
                    <p>{{review.relative_time_description}}</p>
                    <div class="text--primary">
                      {{review.text}}
                    </div>
                  </v-card-text>
                </v-card>
              <!-- hamada bak phones[]にきちんと格納できていないかもしれないので -->
              <!-- <v-img
                v-if="selectedPlace.dateSpot.photos[0]"
                :lazy-src="selectedPlace.dateSpot.photos[0]"
                max-height="300"
                max-width="422"
                :src="selectedPlace.dateSpot.photos[0]"
              ></v-img> -->
              <!-- <v-card-text v-if="!selectedPlace.photos[0]">画像はありません</v-card-text> -->
              
              <v-divider></v-divider>
      
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="!selectedFlag"
                  color="error"
                  text
                  @click="addDateSpots()"
                >
                  デートに追加する
                </v-btn>
                <v-btn
                  v-if="selectedFlag"
                  color="error"
                  text
                  @click="removeDateSpots()"
                >
                  デートから削除する
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
    </v-app>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
declare let google: any;
import draggable from 'vuedraggable';
import StarRating from 'vue-star-rating';

document.addEventListener('touchstart', function() {}, {passive: true});

const defaultIcon = require('../assets/icon/places_21753.png');
const testIcon1 = require('../assets/img/testimonials-1.jpg');
const testIcon2 = require('../assets/img/testimonials-2.jpg');
const testIcon3 = require('../assets/img/testimonials-3.jpg');


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
    icon: {
      url: string,
      scaledSize: any,
      anchor: any
      },
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
  geocoder: {},
  starrating: number
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
  spotTypeList: {ja:string, en:string}[],
  dateSpotCategory: string,
  keyword: string,
  minPrice: string,
  maxPrice: string,
  priceItems: string[]
  DS: any,
  DR: any,
  waypoints: {location: {lat: number, lng: number}}[],
  circleInstance: {},
  dialog: boolean,
  //selectedPlace:{index:number, id: string, title: string, photos:string[], priceLevel:number ,rating:number},
  selectedPlace:{
    index: number, dateSpot: {id:string, title: string, position: {lat: () => number, lng: () => number}, photos: string[], priceLevel:number, rating:number, reviews:{}[] }
  }
  selectedFlag:boolean, //選択したスポットがデートリストにあるか? true:ある false:ない
  iconArrayNumber: string[],
  iconDefault: string,
  iconNum: number,
  dataspotCarruselModel: number,
  colors: string[],
  dialogShow: boolean,
  lastDestination: string,
  waypointsName: string[],
  dateItems: {time: string, name: string}[],
  testPic: string[],
  multiLine: boolean,
  addDateSnackbar: boolean,
  removeDateSnackbar: boolean,
  snackbarText: object,
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
      starrating:0,
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
      spotTypeList: [
        {
          ja:"飲食店",
          en:"restaurant"
        },
        {
          ja:"遊園地",
          en:"amusement_park"
        },
        {
          ja:"水族館",
          en:"aquarium"
        },
        {
          ja:"美術館",
          en:"museum"
        },
        {
          ja:"バー",
          en:"bar"
        },
        {
          ja:"カフェ",
          en:"cafe"
        },
        {
          ja:"宿泊",
          en:"lodging"
        },
        {
          ja:"映画館",
          en:"museum"
        },
        {
          ja:"公園",
          en:"park"
        },
        {
          ja:"ショッピングモール",
          en:"shopping_mall"
        },
        {
          ja:"動物園",
          en:"zoo"
        }
      ],
      dateSpotCategory: '',
      keyword: '',
      minPrice: "0", //hamada google側の料金は0~4段階で分けられているのでminの初期値は0, maxの初期値は4にしてユーザーが検索の際に料金指定をしなければ全ての料金の範囲の検索をリクエストできるようにする
      maxPrice: "4",
      priceItems: ["0","1","2","3","4"],
      DS: '',
      DR: '',
      waypoints: [],
      circleInstance: {},
      dialog: false,
      // hamada bak
      // selectedPlace:{
      //   id: '', title: '', photos: [], priceLevel: 0, rating: 0
      //   },
      selectedPlace:{
        index: 0, dateSpot: {id:"", title: "", position: {lat: () => 0, lng: () => 0}, photos:[], priceLevel:0, rating:0, reviews:[] }
      },
      selectedFlag:false,
      iconArrayNumber: [
        'https://maps.google.com/mapfiles/kml/paddle/1.png',
        'https://maps.google.com/mapfiles/kml/paddle/2.png',
        'https://maps.google.com/mapfiles/kml/paddle/3.png',
        'https://maps.google.com/mapfiles/kml/paddle/4.png',
        'https://maps.google.com/mapfiles/kml/paddle/5.png',
        'https://maps.google.com/mapfiles/kml/paddle/6.png',
        'https://maps.google.com/mapfiles/kml/paddle/7.png',
        'https://maps.google.com/mapfiles/kml/paddle/8.png',
        'https://maps.google.com/mapfiles/kml/paddle/9.png',
        'https://maps.google.com/mapfiles/kml/paddle/10.png',
      ],
      iconDefault: defaultIcon,
      iconNum: 0,
      dataspotCarruselModel: 0,
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
      dateItems:[
        // {time: '10:00', name:'hogehoge', categoryNo:'1'},
        // {time: '11:00', name:'hogehoge', categoryNo:'2'},
        // {time: '12:00', name:'hogehoge', categoryNo:'3'}
      ],
      testPic:[testIcon1,testIcon2],
      multiLine: true,
      addDateSnackbar: false,
      removeDateSnackbar: false,
      snackbarText:{
        success: "デートを追加しました",
        remove: "デートを削除しました",
      }
    }
  },
  components: {
    draggable,StarRating
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
      // hamada オプションをセットしてみる
      // hamada おまえやん。。。。。
      this.DR.setOptions({
        markerOptions: {
            // hamada Directionsの公式ドキュメント(https://developers.google.com/maps/documentation/javascript/reference/directions)を参考にしたがDirectionsのデフォルトで表示される"A","B","C".....を数字に変える方法は不明。そのためDirectionsとして描画される時にアイコン(数字のアイコン)を設定するのではなく、Markerとして(?)クリックした時に数字のアイコンを設定することにする
            
            // icon:'https://maps.google.com/mapfiles/kml/paddle/1.png',
            visible:false,// hamada visible:falseでデフォルトの"A","B","C"は有効
          },
      
        });
      
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
          icon: {url: string, scaledSize: any, anchor: any},
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
                console.log("place", place)
                // デフォルトのアイコンが大きめなので縮小
                let icon = {
                  // url: place.icon, // url
                  url: this.iconDefault,
                  scaledSize: new google.maps.Size(30, 30), // scaled size
                  origin: new google.maps.Point(0,0), // origin
                  anchor: new google.maps.Point(15, 30) // hamada デフォルトだとtop-leftが基準点となっているのでアイコンのサイズに合わせてx軸y軸をずらして表示させる。ピンの下部の先っちょが刺さるように表示されるので地図を拡大縮小させてもズレない。
                };
                // 画像URLを取得
                // let urlArray = []; 
                let urlArray = new Array();
                place.photos.forEach(function (photoInfo:any) {
                    // console.log(value);
                    let imgUrl = photoInfo.getUrl({maxWidth: 640})
                    urlArray.push(imgUrl)
                    console.log("urlArray", urlArray)
                });
                // TODO 店舗の画像が今stringで格納されているが、これを配列で取扱したい
                let maker = {
                  position: place.geometry.location,
                  icon: icon,
                  id: place.place_id,
                  title: place.name,
                  // photo: ("photos" in place) ? place.photos[0].getUrl({maxWidth: 640}) : '',
                  photos: urlArray,
                  destination: false,
                };
                // place.photos.forEach(function (photoInfo:string) => {
                //   let imgUrl = photoInfo.getUrl({maxWidth: 640})
                //   maker.photos.push(imgUrl)
                // });
                // strKeyObject: { [s: string]: string };  
                
                
                
                this.markers.push(maker);
              });
              console.log("hamada this.markers.push(maker);")
              console.log(this.markers);
              _this.setCircle();
            }
          }.bind(this)
        );
      }
    },
    searchDatespot() {
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
          console.log('hamda max price', _this.maxPrice);
          console.log('hamda min price', _this.minPrice);
          // hamada nearbySearch公式ドキュメント https://developers.google.com/maps/documentation/places/web-service/search-nearby#maps_http_places_nearbysearch-txt
          placeService.nearbySearch(
            {
              location: new google.maps.LatLng(this.lat, this.lng),
              radius: '550', // TODO radius:'1000'に設定すると想定する距離(半径1000m)よりも広い距離を対象に検索してしまう課題が未解決。'550'にすると想定する半径1000mに近しくなるので暫定的に対応。調べたけど不明。
              type: _this.dateSpotCategory,
              keyword: _this.keyword,
              // TODO maxpriceとminpriceをパラメーターにつけてリクエストしているけどフィルターされない。以下参考URL
              //https://developers.google.com/maps/documentation/places/web-service/search-nearby#maxprice
              //https://googlemaps.github.io/google-maps-services-js/modules/_places_placesnearby_.html
              maxprice: 3,
              minprice: 2
            },
            function(this: any, results: any, status: any) {
              if(status == google.maps.places.PlacesServiceStatus.OK) {
                console.log('searchDatespotu result', results);
                results.forEach((place: any) => {
                  let icon = {
                    // url: place.icon, // url
                    url: this.iconDefault,
                    scaledSize: new google.maps.Size(30, 30), // scaled size
                    origin: new google.maps.Point(0, 0), // origin
                    anchor: new google.maps.Point(15, 30),
                  };
                  // 画像が1つしかない
                  let urlArray = new Array();
                  place.photos.forEach(function (photoInfo:any) {
                      // console.log("photoInfo", photoInfo);
                      let imgUrl = photoInfo.getUrl({maxWidth: 640})
                      urlArray.push(imgUrl)
                      // console.log("urlArray", urlArray)
                  });
                  let maker = {
                    position: place.geometry.location,
                    icon: icon,
                    id: place.place_id,
                    title: place.name,
                    // photo: ("photos" in place) ? place.photos[0].getUrl({maxWidth: 640}) : '',
                    photos: urlArray,
                    destination: false
                  };
                  this.markers.push(maker);
                  // console.log('markers', this.markers);
                });
                // console.log("hamada this.markers.push(maker);")
                // console.log(this.markers);
                
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
    onClickMarker(index: number, m: {id:string, title: string, position: {lat: () => number, lng: () => number}, photos: string[], priceLevel:number, rating:number }): void {
      console.log('m', m);
      
      if(this.iconNum >= 10) {
        console.log('10個以上はだめ！！')
        return undefined;
      } 
      let _this = this
      
      if(this.DR === null) {
        this.DR = new google.maps.DirectionsRenderer();
      }
      //m取れてるか確認
      if(m) {
        console.log("m.photos", m.photos)
        this.selectedPlace.dateSpot.id = m.id;
        this.selectedPlace.dateSpot.title = m.title;
        this.selectedPlace.dateSpot.photos = m.photos;
        // this.selectedPlace.dateSpot.priceLevel = m.priceLevel;
        // this.selectedPlace.dateSpot.rating = m.rating; 
        this.selectedPlace.dateSpot.position.lat = m.position.lat; 
        this.selectedPlace.dateSpot.position.lng = m.position.lng; 
        console.log("this.photos", this.selectedPlace.dateSpot.photos)
        console.log("this.selectedPlace.dateSpot", this.selectedPlace.dateSpot)

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
        console.log('el.name', m.title)
        // hamada bak デートから削除
        // _this.dateItems = _this.dateItems.filter(el => el.name !== m.title)
        //クリックした場所がwaypointsにあったら別処理
        // hamada クリックした箇所が同じところか？ true:同じところ false:違うところ
        if(trueOrfalse) {
          //デートにあるところがクリックされた時
          this.selectedFlag = true // デートスポットにある
        } else {
          this.selectedFlag = false //デートスポットにない
        }
        this.dialog = true;
        this.dialogShow = true;
        
        // 場所の詳細情報を取得
        let map = (this as any).$refs.mapRef.$mapObject;
        let placeService = new google.maps.places.PlacesService(map);
        // インスタンスを作成してplace_detailsを呼び出してcallバックの中で写真をthis.selectedPlacePhotosの中に入れればOK
        var request = {
        placeId: this.selectedPlace.dateSpot.id,
        fields: ['name', 'rating', 'formatted_phone_number', 'website', 'photos', 'reviews',"opening_hours", "price_level"]
        };

        placeService.getDetails(request, function(this: any, results: any, status: any) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log("place details results", results)
            let urlArray = new Array();
            results.photos.forEach(function (photoInfo:any) {
                // console.log(value);
                let imgUrl = photoInfo.getUrl({maxWidth: 640})
                urlArray.push(imgUrl)
                // console.log("urlArray", urlArray)
            });
            this.selectedPlace.dateSpot.photos = urlArray;
            this.selectedPlace.dateSpot.priceLevel = results.price_level;
            this.selectedPlace.dateSpot.rating = results.rating; 
            this.selectedPlace.dateSpot.reviews = results.reviews; 
            //sss
            //TODO shopDatailsの中からrating,website,reviewsを抽出してモーダルに出力する 
            // TODO selectedPlaceの処理に無駄があるので整理する
          }
        }.bind(this));
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
      // this.searchDatespot();
    },
    deleteOutOfCirclePin() {
      let center = ''
    },
    addDateSpots():void {
      
      let _this = this;
      let map = (_this as any).$refs.mapRef.$mapObject;
      const center = {lat: _this.maplocation.lat, lng: _this.maplocation.lng}
      let destination: any;
      if(typeof this.selectedPlace.dateSpot.position.lat === 'function' && typeof this.selectedPlace.dateSpot.position.lng === 'function') {
        console.log('funciton??')
        destination = {lat: this.selectedPlace.dateSpot.position.lat(), lng: this.selectedPlace.dateSpot.position.lng()};
      } else {
        destination = {lat: this.selectedPlace.dateSpot.position.lat, lng: this.selectedPlace.dateSpot.position.lng};
      }
      _this.DR.setMap(map);
      const route = {
        origin: center,
        destination: destination,
        waypoints: _this.waypoints,
        travelMode: 'DRIVING'
      }
      localStorage.setItem('route', JSON.stringify(route));
      localStorage.setItem('lastDestination', JSON.stringify(this.selectedPlace.dateSpot.title));
      _this.DS.route(route,
        function(response: any, status: any) {
          if(status !== 'OK') {
            window.alert('Directions request failed due to ' + status);
            return
          } else {
            console.log('waypoints placeTitle', _this.selectedPlace.dateSpot.title);
            _this.waypoints.push({location: destination});
            _this.waypointsName.push(_this.selectedPlace.dateSpot.title);
            
            _this.dateItems.push({time: '10:00', name: _this.selectedPlace.dateSpot.title});
            // hamada icon bak これなんだった？
            // _this.markers = _this.markers.filter(function(marker) {
            //   let latBoolean = marker.position.lat() === destination.lat
            //   let lngBoolean = marker.position.lng() === destination.lng
            //   return (latBoolean === true && lngBoolean === true) || marker.destination === true;
            // })
            let latBoolean: boolean;
            let lngBoolean: boolean;
            // hamada アイコンをクリックして順番アイコンを表示
            for(let i = 0; i < _this.markers.length; i++) {
              if(typeof _this.markers[i].position.lat === 'function' && typeof _this.markers[i].position.lng === 'function') {
                latBoolean = _this.markers[i].position.lat() === destination.lat;
                lngBoolean = _this.markers[i].position.lng() === destination.lng;
                if(latBoolean === true && lngBoolean === true) {
                  _this.markers[i].icon.url = _this.iconArrayNumber[_this.iconNum++];
                  _this.markers[i].icon.scaledSize = new google.maps.Size(30,30);// hamada 順番アイコンは少し大きく表示
                  _this.markers[i].icon.anchor = new google.maps.Point(15, 30); // hamada anchor場所を調整
                }
              } else {
                latBoolean = _this.markers[i].position.lat === destination.lat;
                lngBoolean = _this.markers[i].position.lng === destination.lng;
                if(latBoolean === true && lngBoolean === true) {
                  _this.markers[i].icon.url = _this.iconArrayNumber[_this.iconNum++];
                  _this.markers[i].icon.scaledSize = new google.maps.Size(30,30);// hamada 順番アイコンは少し大きく表示
                  _this.markers[i].icon.anchor = new google.maps.Point(15, 30); // hamada anchor場所を調整
                }
              }
            }
            // alert("ピンが押された2")
            localStorage.setItem('mapMarkers', JSON.stringify(_this.markers));
            localStorage.setItem('iconNum', JSON.stringify(_this.iconNum));
            // hamada ナンバーピンが立っていたのは↓のDRのせい
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
  
    // alert("デートに追加しました。")
    this.dateSpots.push({
      id: this.selectedPlace.dateSpot.id,
      title: this.selectedPlace.dateSpot.title
    })
    this.addDateSnackbar = true
    this.dialog = false;
    },
    removeDateSpots():void {
      // TODO 最後に削除しようとしたらできない
      let _this = this;
      // デートスポットから削除
      _this.dateItems = _this.dateItems.filter(el => el.name !== this.selectedPlace.dateSpot.title)
      
      let map = (_this as any).$refs.mapRef.$mapObject;
      const center = {lat: _this.maplocation.lat, lng: _this.maplocation.lng}
      let destination: any;
      if(typeof this.selectedPlace.dateSpot.position.lat === 'function' && typeof this.selectedPlace.dateSpot.position.lng === 'function') {
        console.log('funciton??')
        destination = {lat: this.selectedPlace.dateSpot.position.lat(), lng: this.selectedPlace.dateSpot.position.lng()};
      } else {
        destination = {lat: this.selectedPlace.dateSpot.position.lat, lng: this.selectedPlace.dateSpot.position.lng};
      }
      //waypointsからクリックした場所消し
      _this.waypoints = _this.waypoints.filter(el => el.location.lat !== destination.lat && el.location.lng !== destination.lng);
      console.log('waypointsName trueOrfalse', this.waypointsName);
      console.log('title', this.selectedPlace.dateSpot.title);
      _this.waypointsName = _this.waypointsName.filter(el => {
        console.log('el', el);
        return el !== this.selectedPlace.dateSpot.title;
      });
      console.log('waypointsName', _this.waypointsName);
      //クリックしたアイコン元に戻す
      _this.iconNum = _this.iconNum - 1;
      
      
      for(let i = 0; i < _this.markers.length; i++) {
        if(_this.markers[i].title === this.selectedPlace.dateSpot.title) {
          // hamada アイコンの表示を変える
          _this.markers[i].icon.url = _this.iconDefault;
          _this.markers[i].icon.scaledSize = new google.maps.Size(30, 30); // hamada クリックしたアイコン以外のアイコンのサイズは40のまま
            _this.markers[i].icon.anchor = new google.maps.Point(15, 30); // hamada anchor場所を調整
        }
      }
      //waypointsのアイコン整地
      for(let i = 0; i < _this.waypointsName.length; i++) {
        for(let j = 0; j < _this.markers.length; j++) {
          if(_this.waypointsName[i] === _this.markers[j].title) {
            _this.markers[j].icon.url = _this.iconArrayNumber[i];
            _this.markers[i].icon.scaledSize = new google.maps.Size(30, 30); // hamada クリックしたアイコン以外のアイコンのサイズは40のまま
            _this.markers[i].icon.anchor = new google.maps.Point(15, 30); // hamada anchor場所を調整
          }
        }
      }
      
      this.removeDateSnackbar = true
      this.dialog = false;
      
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
            console.log('oooooooooooooo')
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
      
    },
    deleteAllLocalStrage() {
      localStorage.clear(); // ストレージ全て消す
      location.reload(); // 地図に反映させる為にリロード
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
    &-time {
      position: absolute;
      margin-top: 10px;
      margin-left: 60%;
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
