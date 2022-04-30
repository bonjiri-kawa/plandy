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
        <v-col cols="12" sm="12" md="12" lg="4" xl="3"  class="d-flex lg-justify-center">
            <v-btn class="green white--text" @click="searchDatespot" x-large
              >検索</v-btn
            >
        </v-col>
      </v-row>
      <v-row>
        <v-col class="">
          <GmapMap
            :center="maplocation"
            ref="mapRef"
            map-type-id="roadmap"
            :zoom="zoom"
            :style="styleMap"
            :options="mapOptions"
            id="map"
          >
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
                scaledSize: marker.icon.scaledSize,
              }"
            />
          </GmapMap>
        </v-col>

      </v-row>
            
        <!-- 検索結果 -->
        <v-list three-line>
      <template v-for="(dateSpots, index) in dateSpotsItems"> -->
        <v-subheader
          v-if="dateSpots.header"
          :key="dateSpots.header"
          v-text="dateSpots.header"
        ></v-subheader>
        <v-divider :inset="true" :key="index"> </v-divider>

        <v-list-item
          :key="index"
        >
          <v-list-item-avatar>
            <v-img :src="dateSpots.avatar"></v-img> -->
          </v-list-item-avatar>

          <v-list-item-content :key="index">
            <v-list-item-title v-html="dateSpots.name"></v-list-item-title>
            <v-list-item-subtitle>
              <p>評価:{{dateSpots.rating}}, 住所:{{dateSpots.vicinity}}, タイプ:{{dateSpots.types}}</p>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
    
      <!-- ポップアップ -->
      <v-app id="inspire" v-show="dialogShow">
        <div class="text-center">
          <v-dialog v-model="dialog" width="800" scrollable>
            <v-card>
              <v-card-title class="headline grey lighten-2">
                {{ selectedPlace.dateSpot.title }}
              </v-card-title>

              <v-carousel v-model="dataspotCarruselModel">
                <v-carousel-item v-for="(color, i) in colors" :key="color">
                  <v-sheet height="100%" tile>
                    <v-row class="fill-height" align="center" justify="center">
                      <v-img
                        v-if="selectedPlace.dateSpot.photos[i]"
                        :lazy-src="selectedPlace.dateSpot.photos[i]"
                        :src="selectedPlace.dateSpot.photos[i]"
                        aspect-ratio="1.7"
                        contain
                      ></v-img>
                    </v-row>
                  </v-sheet>
                </v-carousel-item>
              </v-carousel>

              <v-card-text class="font-weight-bold mt-3" style="height: 500px"
                >価格
                <b
                  v-if="
                    selectedPlace.dateSpot.priceLevel == '' ||
                    selectedPlace.dateSpot.priceLevel == undefined
                  "
                  >データなし</b
                >
                <v-icon
                  v-for="n in selectedPlace.dateSpot.priceLevel"
                  :key="n"
                  large
                  color="green darken-2"
                  >mdi-currency-jpy</v-icon
                >
                <star-rating
                  v-model="selectedPlace.dateSpot.rating"
                  active-color="#f00"
                  v-bind:star-size="35"
                >
                </star-rating>
                <v-card
                  v-for="review in selectedPlace.dateSpot.reviews"
                  :key="review.text"
                  class="mx-auto"
                >
                  <v-card-text>
                    <p class="text--primary">
                      {{ review.author_name }}
                    </p>
                    <star-rating
                      v-model="review.rating"
                      active-color="#f00"
                      v-bind:star-size="20"
                    >
                    </star-rating>
                    <p>{{ review.relative_time_description }}</p>
                    <div class="text--primary">
                      {{ review.text }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-card-text>
              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="dialog = false">
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
import Vue from "vue";
declare let google: any;
import draggable from "vuedraggable";
import StarRating from "vue-star-rating";

document.addEventListener("touchstart", function () {}, { passive: true });

const defaultIcon = require("../assets/icon/places_21753.png");
const testIcon1 = require("../assets/img/testimonials-1.jpg");
const testIcon2 = require("../assets/img/testimonials-2.jpg");
const testIcon3 = require("../assets/img/testimonials-3.jpg");

interface Data {
  maplocation: { lng: number; lat: number };
  zoom: number;
  styleMap: { width: string; height: string };
  mapOptions: {
    streetViewControl: boolean;
    styles: string[];
  };
  markers: {
    id: number | string;
    title: string;
    position: {
      lat: () => number;
      lng: () => number;
    };
    icon: {
      url: string;
      scaledSize: any;
      anchor: any;
    };
    destination: boolean;
  }[];
  markersSub: [];
  infoOptions: {
    // minWidth: number,
    pixelOffset: {
      width: number;
      height: number;
    };
  };
  infoWindowPos: any;
  infoWinOpen: boolean;
  marker: {};
  geocoder: {};
  starrating: number;
  address: string;
  latitude: number;
  longitude: number;
  search: string;
  searchKeyword: string;
  placesList: string[];
  map: any;
  dateSpots: { id: string; title: string }[];
  lat: any;
  lng: any;
  balloon: { position: number };
  id: number;
  directionsMsg: string;
  destination: string;
  spotTypeList: { ja: string; en: string }[];
  dateSpotCategory: string;
  keyword: string;
  minPrice: string;
  maxPrice: string;
  priceItems: string[];
  DS: any;
  DR: any;
  waypoints: { location: { lat: number; lng: number } }[];
  circleInstance: {};
  dialog: boolean;
  //selectedPlace:{index:number, id: string, title: string, photos:string[], priceLevel:number ,rating:number},
  selectedPlace: {
    index: number;
    dateSpot: {
      id: string;
      title: string;
      position: { lat: () => number; lng: () => number };
      photos: string[];
      priceLevel: number;
      rating: number;
      reviews: {}[];
    };
  };
  selectedFlag: boolean; //選択したスポットがデートリストにあるか? true:ある false:ない
  iconArrayNumber: string[];
  iconDefault: string;
  iconNum: number;
  dataspotCarruselModel: number;
  colors: string[];
  dialogShow: boolean;
  lastDestination: string;
  waypointsName: string[];
  dateItems: { time: string; name: string }[];
  testPic: string[];
  multiLine: boolean;
  addDateSnackbar: boolean;
  removeDateSnackbar: boolean;
  snackbarText: object;
  dateSpotsItems:object[];
  circle: object;
}

export default Vue.extend({
  data(): Data {
    return {
      dateSpotsItems: [],
      maplocation: { lng: 0, lat: 0 },
      zoom: 15,
      styleMap: {
        width: "100%",
        height: "600px",
      },
      mapOptions: {
        streetViewControl: false,
        styles: [],
      },
      markers: [],
      starrating: 0,
      markersSub: [],
      infoOptions: {
        // minWidth: 200,
        pixelOffset: {
          width: 0,
          height: -35,
        },
      },
      infoWindowPos: null,
      infoWinOpen: false,
      marker: {},
      geocoder: {},
      address: "",

      latitude: 0,
      longitude: 0,

      dateSpots: [],
      search: "",
      searchKeyword: "",
      placesList: [],
      map: null,
      lat: "",
      lng: "",
      balloon: { position: 100 },
      id: 4,
      directionsMsg: "",
      destination: "",
      spotTypeList: [
        {
          ja: "飲食店",
          en: "restaurant",
        },
        {
          ja: "遊園地",
          en: "amusement_park",
        },
        {
          ja: "水族館",
          en: "aquarium",
        },
        {
          ja: "美術館",
          en: "museum",
        },
        {
          ja: "バー",
          en: "bar",
        },
        {
          ja: "カフェ",
          en: "cafe",
        },
        {
          ja: "宿泊",
          en: "lodging",
        },
        {
          ja: "映画館",
          en: "museum",
        },
        {
          ja: "公園",
          en: "park",
        },
        {
          ja: "ショッピングモール",
          en: "shopping_mall",
        },
        {
          ja: "動物園",
          en: "zoo",
        },
      ],
      dateSpotCategory: "",
      keyword: "",
      minPrice: "0", //hamada google側の料金は0~4段階で分けられているのでminの初期値は0, maxの初期値は4にしてユーザーが検索の際に料金指定をしなければ全ての料金の範囲の検索をリクエストできるようにする
      maxPrice: "4",
      priceItems: ["0", "1", "2", "3", "4"],
      DS: "",
      DR: "",
      waypoints: [],
      circleInstance: {},
      dialog: false,
      selectedPlace: {
        index: 0,
        dateSpot: {
          id: "",
          title: "",
          position: { lat: () => 0, lng: () => 0 },
          photos: [],
          priceLevel: 0,
          rating: 0,
          reviews: [],
        },
      },
      selectedFlag: false,
      iconArrayNumber: [
        "https://maps.google.com/mapfiles/kml/paddle/1.png",
        "https://maps.google.com/mapfiles/kml/paddle/2.png",
        "https://maps.google.com/mapfiles/kml/paddle/3.png",
        "https://maps.google.com/mapfiles/kml/paddle/4.png",
        "https://maps.google.com/mapfiles/kml/paddle/5.png",
        "https://maps.google.com/mapfiles/kml/paddle/6.png",
        "https://maps.google.com/mapfiles/kml/paddle/7.png",
        "https://maps.google.com/mapfiles/kml/paddle/8.png",
        "https://maps.google.com/mapfiles/kml/paddle/9.png",
        "https://maps.google.com/mapfiles/kml/paddle/10.png",
      ],
      iconDefault: defaultIcon,
      iconNum: 0,
      dataspotCarruselModel: 0,
      colors: ["primary", "secondary", "yellow darken-2", "red", "orange"],
      dialogShow: false,
      lastDestination: "",
      waypointsName: [],
      dateItems: [
        // {time: '10:00', name:'hogehoge', categoryNo:'1'},
        // {time: '11:00', name:'hogehoge', categoryNo:'2'},
        // {time: '12:00', name:'hogehoge', categoryNo:'3'}
      ],
      testPic: [testIcon1, testIcon2],
      multiLine: true,
      addDateSnackbar: false,
      removeDateSnackbar: false,
      snackbarText: {
        success: "デートを追加しました",
        remove: "デートを削除しました",
      },
      circle:{},
    };
    
  },
  components: {
    draggable,
    StarRating,
  },
  async created() {},
  async mounted() {
    if (navigator.geolocation) {
      // let _this = this
      navigator.geolocation.getCurrentPosition(
        function (this: any, position: any) {
          console.log("position", position);
          let coords = position.coords;
          //経度緯度を取得
          this.maplocation.lat = coords.latitude;
          this.maplocation.lng = coords.longitude;
          console.log("lat, lng", this.maplocation.lat, this.maplocation.lng);
        }.bind(this),
        function (this: any, error: any) {
          console.log("error", error);
          //エラーの場合は東京駅周辺に移動
          this.maplocation.lat = 35.6813092;
          this.maplocation.lng = 139.7677269;
        }.bind(this)
      );
    } else {
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
    searchDatespot() {
      let geocoder = new google.maps.Geocoder();
      let _this = this;
      geocoder.geocode(
        { address: this.destination, language: "ja" },
        function (this: any, results: any, status: any) {
          if (status === google.maps.GeocoderStatus.OK) {
            let latLngArr = results[0].geometry.location.toUrlValue();
            let Arrayltlg = latLngArr.split(",");
            this.lat = Number(Arrayltlg[0]);
            this.lng = Number(Arrayltlg[1]);
            this.maplocation.lat = this.lat;
            this.maplocation.lng = this.lng;
            let maps = (this as any).$refs.mapRef.$mapObject;

            let placeService = new google.maps.places.PlacesService(maps);
            console.log("hamda max price", _this.maxPrice);
            console.log("hamda min price", _this.minPrice);
            // hamada nearbySearch公式ドキュメント https://developers.google.com/maps/documentation/places/web-service/search-nearby#maps_http_places_nearbysearch-txt
            placeService.nearbySearch(
              {
                location: new google.maps.LatLng(this.lat, this.lng),
                radius: "550", // TODO radius:'1000'に設定すると想定する距離(半径1000m)よりも広い距離を対象に検索してしまう課題が未解決。'550'にすると想定する半径1000mに近しくなるので暫定的に対応。調べたけど不明。
                type: _this.dateSpotCategory,
                keyword: _this.keyword,
                // TODO maxpriceとminpriceをパラメーターにつけてリクエストしているけどフィルターされない。以下参考URL
                //https://developers.google.com/maps/documentation/places/web-service/search-nearby#maxprice
                //https://googlemaps.github.io/google-maps-services-js/modules/_places_placesnearby_.html
                maxprice: 3,
                minprice: 2,
              },
              function (this: any, results: any, status: any) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  console.log("searchDatespotu result", results);
                  this.markers = [];
                  results.forEach((place: any) => {
                    let icon = {
                      url: this.iconDefault,
                      scaledSize: new google.maps.Size(30, 30), // scaled size
                      origin: new google.maps.Point(0, 0), // origin
                      anchor: new google.maps.Point(15, 30),
                    };
                    // 画像が1つしかない
                    let urlArray = new Array();
                    place.photos.forEach(function (photoInfo: any) {
                      // console.log("photoInfo", photoInfo);
                      let imgUrl = photoInfo.getUrl({ maxWidth: 640 });
                      urlArray.push(imgUrl);
                      // console.log("urlArray", urlArray)
                    });
                    let maker = {
                      position: place.geometry.location,
                      icon: icon,
                      id: place.place_id,
                      title: place.name,
                      photos: urlArray,
                      destination: false,
                    };
                    this.markers.push(maker);
                  });
                  
                  this.setCircle();
                }
              }.bind(this)
            );
          }
        }.bind(this)
      );
    },
    setCircle(): void {
      
      let map = (this as any).$refs.mapRef.$mapObject;
      console.log("map", map)
      
      let googleCircleOptions = {
        center: { lat: this.maplocation.lat, lng: this.maplocation.lng }, // 中心点(google.maps.LatLng)
        fillColor: "#CCFFFF", // 塗りつぶし色
        fillOpacity: 0.5, // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
        map: map, // 表示させる地図（google.maps.Map）
        radius: 1000, // 半径（ｍ）
        strokeColor: "#00FFFF", // 外周色
        strokeOpacity: 1, // 外周透過度（0: 透明 ⇔ 1:不透明）
        strokeWeight: 1, // 外周太さ（ピクセル）
      };
      
      new google.maps.Circle(googleCircleOptions);
    },
    onClickMarker(
      index: number,
      m: {
        id: string;
        title: string;
        position: { lat: () => number; lng: () => number };
        photos: string[];
        priceLevel: number;
        rating: number;
      }
    ): void {
      console.log("m", m);

      if (this.iconNum >= 10) {
        console.log("10個以上はだめ！！");
        return undefined;
      }
      let _this = this;

      if (this.DR === null) {
        this.DR = new google.maps.DirectionsRenderer();
      }
      //m取れてるか確認
      if (m) {
        console.log("m.photos", m.photos);
        this.selectedPlace.dateSpot.id = m.id;
        this.selectedPlace.dateSpot.title = m.title;
        this.selectedPlace.dateSpot.photos = m.photos;
        // this.selectedPlace.dateSpot.priceLevel = m.priceLevel;
        // this.selectedPlace.dateSpot.rating = m.rating;
        this.selectedPlace.dateSpot.position.lat = m.position.lat;
        this.selectedPlace.dateSpot.position.lng = m.position.lng;
        console.log("this.photos", this.selectedPlace.dateSpot.photos);
        console.log("this.selectedPlace.dateSpot", this.selectedPlace.dateSpot);

        let destination: any;
        if (
          typeof m.position.lat === "function" &&
          typeof m.position.lng === "function"
        ) {
          console.log("funciton??");
          destination = { lat: m.position.lat(), lng: m.position.lng() };
        } else {
          destination = { lat: m.position.lat, lng: m.position.lng };
        }
        //クリックしたところがすでに押されてるか確認
        let trueOrfalse: boolean = false;
        for (let i = 0; i < _this.waypoints.length; i++) {
          let latBoolean = this.waypoints[i].location.lat === destination.lat;
          let lngBoolean = this.waypoints[i].location.lng === destination.lng;
          if (latBoolean === true && lngBoolean === true) {
            trueOrfalse = true;
          }
        }
        console.log("el.name", m.title);
        // hamada bak デートから削除
        // _this.dateItems = _this.dateItems.filter(el => el.name !== m.title)
        //クリックした場所がwaypointsにあったら別処理
        // hamada クリックした箇所が同じところか？ true:同じところ false:違うところ
        if (trueOrfalse) {
          //デートにあるところがクリックされた時
          this.selectedFlag = true; // デートスポットにある
        } else {
          this.selectedFlag = false; //デートスポットにない
        }
        this.dialog = true;
        this.dialogShow = true;

        // 場所の詳細情報を取得
        let map = (this as any).$refs.mapRef.$mapObject;
        let placeService = new google.maps.places.PlacesService(map);
        // インスタンスを作成してplace_detailsを呼び出してcallバックの中で写真をthis.selectedPlacePhotosの中に入れればOK
        var request = {
          placeId: this.selectedPlace.dateSpot.id,
          fields: [
            "name",
            "rating",
            "formatted_phone_number",
            "website",
            "photos",
            "reviews",
            "opening_hours",
            "price_level",
          ],
        };

        placeService.getDetails(
          request,
          function (this: any, results: any, status: any) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              console.log("place details results", results);
              let urlArray = new Array();
              results.photos.forEach(function (photoInfo: any) {
                // console.log(value);
                let imgUrl = photoInfo.getUrl({ maxWidth: 640 });
                urlArray.push(imgUrl);
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
          }.bind(this)
        );
      } else {
        console.log("値取れてないよ～");
      }
    },
  },
});
</script>

<style lang="scss">
.modal_wrap input {
  display: none;
}

.modal_overlay {
  display: flex;
  justify-content: center;
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.5s, transform 0s 0.5s;
  transform: scale(0);
}

.modal_trigger {
  position: absolute;
  width: 100%;
  height: 100%;
}

.modal_content {
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

.close_button {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 24px;
  cursor: pointer;
}

.modal_wrap input:checked ~ .modal_overlay {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.5s;
}

.modal_wrap input:checked ~ .modal_overlay .modal_content {
  transform: scale(1);
}

.open_button {
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
  font-family: "Montserrat", sans-serif;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
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
      height: 50px;
      margin-bottom: 40px;
      margin-right: 10px;
      padding-top: 0px !important;
      position: relative;
      &-icon {
        & img {
          width: 10%;
          height: 100%;
        }
      }
      &-border {
        // border-top: solid #ddd 1px;
        margin-top: 5px;
        position: relative;
      }
      &-name {
        padding-left: 5px;
        margin-bottom: 0px !important;
        width: 75%;
        position: absolute;
        padding-top: 10px;
      }
    }
    &-under {
      width: 30px;
      height: 30px;
      border: 5px solid;
      border-color: transparent transparent #565656 #565656;
      transform: rotate(-45deg);
      position: absolute;
      margin-left: 45%;
      margin-top: -20px;
    }
    &-time {
      position: absolute;
      margin-top: -10px;
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
