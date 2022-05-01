<template>
  <div>
    <v-app>
      <v-row class="mx-3 mt-5" justify="start">
        <v-col cols="12" sm="4">
          <v-select
            v-model="selectedFeelingItems"
            :items="feelingItems.map((item) => item.feeling)"
            :menu-props="{ offsetY: true }"
            label="あなたはどんなデートにしたいですか？"
            multiple
            hint="複数選択することもできます"
            persistent-hint
            chips
            outlined
          ></v-select>
          <p>{{ selectedFeelingItems }}</p>
        </v-col>
        <v-col cols="12" sm="12" md="4" lg="4" xl="3">
          <v-text-field
            label="デートエリア"
            outlined
            v-model="destination"
            hint="エリア名を入力してください 例:横浜"
            chips
            persistent-hint
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          sm="12"
          md="12"
          lg="4"
          xl="3"
          class="d-flex lg-justify-center"
        >
          <v-btn class="green white--text" @click="searchDatespot" x-large
            >検索</v-btn
          >
          <v-btn class="blue white--text ml-5" @click="autoForm" x-large
            >開発用:自動入力</v-btn
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
              v-for="marker in markers"
              :key="marker.id"
              :position="marker.position"
              :clickable="true"
              :draggable="false"
              @click="selectDateSpot(marker.id, marker.title)"
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
      <v-list flat class="mx-sm-15">
        <v-list-item-group v-model="selectedItem" color="primary">
          <v-list-item
            :key="dateSpot.id"
            v-for="dateSpot in dateSpotsItems"
            @click="selectDateSpot(dateSpot.id, dateSpot.name)"
          >
            <v-list-item-avatar>
              <v-img :src="dateSpot.icon"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ dateSpot.name }}</v-list-item-title>
              <v-list-item-subtitle>
                <star-rating
                  v-model="dateSpot.rating"
                  active-color="#f00"
                  v-bind:star-size="10"
                >
                </star-rating>
                <p>タイプ:{{ dateSpot.types.join() }}</p>
              </v-list-item-subtitle>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
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
                <v-carousel-item v-for="(photoUrl, index) in selectedPlace.dateSpot.photos" :key="photoUrl">
                  <v-sheet height="100%" tile>
                    <v-row class="fill-height" justify="center">
                      <v-img
                        v-if="selectedPlace.dateSpot.photos[index]"
                        :lazy-src="selectedPlace.dateSpot.photos[index]"
                        :src="selectedPlace.dateSpot.photos[index]"
                        aspect-ratio="1.7"
                        contain
                      ></v-img>
                    </v-row>
                  </v-sheet>
                </v-carousel-item>
              </v-carousel>

              <v-card-text class="text-check font-weight-bold mt-3" style="height: 500px"
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
                  :key="review.time"
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
import { defaultFeelingItems } from "../assets/js/feelingItems.js";

document.addEventListener("touchstart", function () {}, { passive: true });

const defaultIcon = require("../assets/icon/places_21753.png");
// const defaultFeelingItems = require("../assets/js/feelingItems.js");

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
  marker: {};
  geocoder: {};
  address: string;
  latitude: number;
  longitude: number;
  search: string;
  map: any;
  dateSpots: { id: string; title: string }[];
  lat: any;
  lng: any;
  id: number;
  destination: string;
  searchDateSpotCategory: { feeling: string; searchCategory: string[] }[]; // TODO ここに気持ちに対応するカテゴリーを入れる
  keyword: string;
  DS: any;
  DR: any;
  waypoints: { location: { lat: number; lng: number } }[];
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
  iconDefault: string;
  iconNum: number;
  dataspotCarruselModel: number;
  colors: string[];
  dialogShow: boolean;
  dateSpotsItems: object[];
  selectedItem: number; // ??
  feelingItems: object[];
  selectedFeelingItems: string[];
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
      marker: {},
      geocoder: {},
      address: "",
      latitude: 0,
      longitude: 0,
      dateSpots: [],
      search: "",
      map: null,
      lat: "",
      lng: "",
      id: 4,
      destination: "",

      searchDateSpotCategory: [],
      keyword: "",
      DS: "",
      DR: "",
      waypoints: [],
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
      iconDefault: defaultIcon,
      iconNum: 0,
      dataspotCarruselModel: 0,
      colors: ["primary", "secondary", "yellow darken-2", "red", "orange"],
      dialogShow: false,
      selectedItem: 1,
      feelingItems: defaultFeelingItems,
      selectedFeelingItems: [],
    };
  },
  components: {
    draggable,
    StarRating,
  },
  async created() {},
  async mounted() {
    if (navigator.geolocation) {
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
  async updated() {
    //dialogの中のテキストを取得。
    const elements = document.getElementsByClassName('text-check font-weight-bold')
    if (!elements || !elements.length) {
    // 要素が取得できなかった場合は終了
      return;
    }
    //textがあれば開くたびにスクロールをトップにする
    elements[0].scrollTop = 0;
  },
  methods: {
    clickDialog() {
      console.log(this.dialog);
      this.dialog = !this.dialog;
    },
    scrollToResult() {
        window.scrollTo({
          top: 700,
          behavior: "smooth",
        });
    },
    autoForm() {
      this.destination = "大阪府";
      this.selectedFeelingItems = ["まったりしたい", "ワクワクしたい"];
      this.searchDatespot();
    },
    searchDatespot() {
      let geocoder = new google.maps.Geocoder();
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

            // 検索するタイプを選択
            let searchTypeList = this.feelingItems
              .filter((item: { feeling: string }) => {
                return this.selectedFeelingItems.some(
                  (selectedItemFeeling: string) => {
                    return selectedItemFeeling === item.feeling;
                  }
                );
              })
              .map((item: { keyword: string }) => item.keyword);

            // 重複を削除
            searchTypeList = searchTypeList
              .flat()
              .filter((x: any, i: any, self: string | any[]) => {
                return self.indexOf(x) === i;
              });

            console.log("検索タイプ: ", searchTypeList);

            // nearbySearch公式ドキュメント https://developers.google.com/maps/documentation/places/web-service/search-nearby#maps_http_places_nearbysearch-txt
            // TODO デート提案のうえで、リクエストの際に"keyword"をどう活用するか？
            placeService.nearbySearch(
              {
                location: new google.maps.LatLng(this.lat, this.lng),
                radius: "550",
                type: searchTypeList,
              },
              function (this: any, results: any, status: any) {
                console.log("searchDatespotu result", results);
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  // 前回の検索結果情報をクリア
                  this.markers = [];
                  this.dateSpotsItems = [];

                  // 検索結果のうち、必要な項目のみをデートスポットに追加 (error: open_now is deprecated 回避のため )
                  results.forEach((place: any) => {
                    this.dateSpotsItems.push({
                      id: place.place_id,
                      name: place.name,
                      rating: place.rating,
                      types: place.types,
                      icon: "photos" in place ? place.photos[0].getUrl({ maxWidth: 640 }) : require("../assets/img/noImage2.png"), // 写真がない場合
                    });
                  });

                  results.forEach((place: any) => {
                    let icon = {
                      url: this.iconDefault,
                      scaledSize: new google.maps.Size(30, 30), // scaled size
                      origin: new google.maps.Point(0, 0), // origin
                      anchor: new google.maps.Point(15, 30),
                    };
                    
                    let maker = {
                      position: place.geometry.location,
                      icon: icon,
                      id: place.place_id,
                      title: place.name,
                      destination: false,
                    };
                    this.markers.push(maker);
                  });
                  this.setCircle();
                  // TODO とりあえずスクロール DOMに反映されてからじゃないとスクロールできない とりあえずsetTimeoutで...。
                  setTimeout(e => {
                    this.scrollToResult();
                  },1000);

                }
              }.bind(this)
            );
          }
        }.bind(this)
      );
    },
    setCircle(): void {
      let map = (this as any).$refs.mapRef.$mapObject;
      console.log("map", map);

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
    selectDateSpot(placeId: number, placeName: string): void {
      
      
      
      
      this.dialog = true;
      this.dialogShow = true;
      
      // 前回の表示をリセット 
      this.selectedPlace.dateSpot.photos = []; //写真はスポットによって枚数が異なる

      // nearBySearchで取得できた情報は利用する (ポップアップ表示の際に店名などの崩れを防ぐため)
      this.selectedPlace.dateSpot.title = placeName;

      // 場所の詳細情報を取得
      let map = (this as any).$refs.mapRef.$mapObject;
      let placeService = new google.maps.places.PlacesService(map);
      
      // 詳細情報のリクエスト内容
      var request = {
        placeId: placeId,
        fields: [
          "name",
          "rating",
          "formatted_phone_number",
          "website",
          "photos",
          "reviews",
          "price_level",
        ],
      };

      placeService.getDetails(
        request,
        function (this: any, result: any, status: any) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log("place details results", result);
            
            // 画像があるかを確認
            let imgUrlArray = new Array();
            if ("photos" in result) {
              result.photos.forEach((photoInfo: any)  =>  {
                let imgUrl = photoInfo.getUrl({ maxWidth: 640 });
                imgUrlArray.push(imgUrl);
              });
            }
            else {
              // 画像がない場合は "No Image"を表示させる
              imgUrlArray.push(require("../assets/img/noImage.png"));
            }
            
            this.selectedPlace.dateSpot.title = result.name;
            this.selectedPlace.dateSpot.photos = imgUrlArray;
            console.log("写真の中身", this.selectedPlace.dateSpot.photos);
            // "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAap_uECTmWVqI2QKgilOKh0TazgFKxLVr118kv5XJ7wneMsJfstEjv3zh-mNTskH3LbhVEjj11ezI2HQogVdoREfXNjJm4IrcqJEdD3-8_mT-TQgfVsOX7e4xLz9PokWQ8cnGHJ_9EGN6mRytqTxB2WnUlpQI4BVkaO8FtraN_MwZy161Gk2&3u640&5m1&2e1&callback=none&key=AIzaSyDVsndM5LyMAb5If-6D9T2rw0myLdlC1Vk&token=39180"
            //"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAap_uECTmWVqI2QKgilOKh0TazgFKxLVr118kv5XJ7wneMsJfstEjv3zh-mNTskH3LbhVEjj11ezI2HQogVdoREfXNjJm4IrcqJEdD3-8_mT-TQgfVsOX7e4xLz9PokWQ8cnGHJ_9EGN6mRytqTxB2WnUlpQI4BVkaO8FtraN_MwZy161Gk2&3u640&5m1&2e1&callback=none&key=AIzaSyDVsndM5LyMAb5If-6D9T2rw0myLdlC1Vk&token=39180"
            // "https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sAap_uEB27XFrt3pgk3IvkIpp5gjgKYuOjfVU6EUHWfcYObXwxoLgJLyadtIWSYZlNWf0JuGBhmyqwatl0etW3SpsslYTuUqkYESG1YqOvU9T0E0GoK7l-P-9xLAME_uUkL0rlIHTw2CozVoOxXnvq4OK15rCoys00UOmYCA4AKkdM9ZPNIb-&3u640&5m1&2e1&callback=none&key=AIzaSyDVsndM5LyMAb5If-6D9T2rw0myLdlC1Vk&token=22972"
            this.selectedPlace.dateSpot.priceLevel = result.price_level;
            this.selectedPlace.dateSpot.rating = result.rating;
            this.selectedPlace.dateSpot.reviews = result.reviews;
          }
        }.bind(this)
      );
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
