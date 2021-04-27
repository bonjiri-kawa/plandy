<template>
  <div>
    <!-- <input type="text" v-model="address">
    <button type="button" @click="mapSearch">検索</button> -->
    <div>
      <button @click="getLocation" class="button-color">現在地</button>
    </div>
    <div>
      <button @click="searchRoot" class="button-color-search">ルート検索</button>
    </div>
    <div>
      地名<input type="text" id="addressInput" v-model="search">
      キーワード<input type="text" id="keywordInput" v-model="searchKeyword">
      <button @click="searchCandidate">検索</button>
    </div>
    {{placesList}}
    <GmapMap
      ref="mapRef"
      map-type-id="roadmap"
      :center="maplocation"
      :zoom="zoom"
      :style="styleMap"
      :options="mapOptions"
      id="map"
    >
      <GmapMarker
        v-for="(m, index) in markers"
        :key ="index"
        :title ="m.title"
        :position="m.position"
        :clickable="true"
        :draggable="false"
        :icon="m.pinicon"
        @click="onClickMarker(index, m)"
      />
      <GmapInfoWindow
        :options="infoOptions"
        :position="infoWindowPos"
        :opened="infoWinOpen"
        @closeclick="infoWinOpen = false"
      >
        <p style ="color: #000">
          {{ marker.title }}
        </p>
      </GmapInfoWindow>
    </GmapMap>

    <div>
      <ul>
        <li v-for="(m, index) in dateSpots" :key="index">
          {{ m }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
declare var google: any;

interface Data {
  maplocation: {lng: number, lat: number}
  zoom: number
  styleMap: {width: string, height: string}
  mapOptions: {
    streetViewControl: boolean
    styles: string[]
  }
  markers: {title: string, position: {lat: number, lng: number}}[]
  infoOptions: {minWidth: number, pixelOffset: {width: number, height: number}}
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
  dateSpots: string[]
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
        {
          title: '佐鳴湖',
          position: { lat: 34.7054595, lng: 137.6852776 },
        },
        {
          title: '浜名湖ガーデンパーク',
          position: { lat: 34.7140247, lng: 137.6032967 },
        }
      ],
      infoOptions: {
        minWidth: 200,
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
    }
  },
  async mounted() {
    // const currentPosTmp: any = await this.getCurrentPosition();
    // const currentPos = {
    //   lat: currentPosTmp.coords.latitude,
    //   lng: currentPosTmp.coords.longitude,
    // }
    // this.maplocation = currentPos;
    // this.geocoder = new google.masp.Geocoder();
    //現在地の取得
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
        function(this:any, error) {
console.log('error');
          //エラーの場合は東京駅周辺に移動
          this.maplocation.lat = 35.6813092;
          this.maplocation.lng = 139.7677269;
        }
      );
    } else {
console.log('???')
      //現在地取得負荷の場合は東京駅周辺に移動
      this.maplocation.lat = 35.6813092;
      this.maplocation.lng = 139.7677269;
}
  },
  // computed: {
  //   returnPlaceList() {
  //     return this.placesList
  //   }
  // }
  methods: {
    getCurrentPosition() {
      return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
    },
    setPlaceMakers() {
console.log('setPlaceMarkers');
      let map = (this as any).$refs.mapRef.$mapObject;
console.log('map', map);
      let placeService = new google.maps.places.PlacesService(map);
console.log(placeService);
      //Places APIのnearbySearchを使用する
      placeService.nearbySearch(
        {
          location: new google.maps.LatLng(this.maplocation.lat, this.maplocation.lng),
          radius: 100,
          type: ['restaurant'],
          keyword: '寿司'
        },
        function(this: any, results: any, status: any) {
          if(status == google.maps.places.PlacesServiceStatus.OK) {
            let _this = this
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
                title: place.name,
                id: place.place_id
              };
              _this.markers.push(maker);
            });
          }
        }.bind(this)
      );
    },
    getLocation() {
      if(process.client) {
        if(!navigator.geolocation) {
          alert('現在地を取得できませんでした');
          return;
        }

        const options = {
          enableHighAccuracy: false,
          timeout: 5000,
          maxmimAge: 0
        }

        navigator.geolocation.getCurrentPosition(this.success, this.error, options)
      }
    },
    success(position: any) {
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      console.log(this.latitude, this.longitude);
    },
    error(error: any) {
      switch(error.code) {
        case 1:
          alert('位置情報の利用が許可されていません');
          break;
        case 2:
          alert('現在地が取得できませんでした');
          break;
        case 3:
          alert('タイムアウトになりました');
          break;
        default:
          alert('げんざいちがしゅとくできませんでした');
          break;
      }
    },
    onClickMarker(index: number, m: {title: string, position: {lat: number, lng: number}}): void {
      if(m) {
        this.dateSpots.push(m.title);
      }
    },
    searchRoot() {

      let requests = {
        origin: new google.maps.LatLng(35.681382,139.766084),
        destination: new google.maps.LatLng()
      }

      let DS = new google.maps.DirectionsService();
      let DR = new google.maps.DirectionsRenderer();

      let defaultPosition = new google.maps.LatLng({
        lat: 34.366,
        lng: 132.471
      });

      let map = new google.maps.Map(document.getElementById("map"), {
        // #sampleに地図を埋め込む
        center: defaultPosition, // 地図の中心を指定
        zoom: 18, // 地図のズームを指定
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      DR.setMap(map)

      let request = {
        origin: new google.maps.LatLng(34.364991, 132.470085),
        destination: new google.maps.LatLng(35.366, 133.471),
        waypoints: [
          {location: new google.maps.LatLng(34.365, 132.4708)}
        ],
        travelMode: google.maps.TravelMode.DRIVING
      }

      DS.route(request, function(result: any, status: any) {
        DR.setDirections(result);
      })
    },
    searchCandidate() {
      //結果表示クリア
      let addressInput = this.search;
      let _this = this
      console.log(addressInput)
      //入力した場所の位置情報を取得
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          address: addressInput
        },
        function(this: any, results: any, status: any) {
          if(status === google.maps.GeocoderStatus.OK) {
            let lat = results[0].geometry.location.lat();//緯度を取得
            let lng = results[0].geometry.location.lng();//経度を取得
            let mark = {
              lat: lat,
              lng: lng
            }
            // let defaultPosition = new google.maps.LatLng({
            //   lat: 34.366,
            //   lng: 132.471
            // });
// console.log('mark', mark);
            let map = new google.maps.Map(document.getElementById("map"), {
              // #sampleに地図を埋め込む
              center: mark, // 地図の中心を指定
              zoom: 18, // 地図のズームを指定
              mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            // let marker = new google.maps.Marker({
            //   position: mark,
            //   map: map
            // });
            map.setCenter(results[0].geometry.location);
            _this.startNearbySearch(results[0].geometry.location);
          }else{
            alert('位置情報が取得できないよ～')
          }
        }
      )
    },
    startNearbySearch(latLng: any) {
      //地図読み込み完了時のイベント
      console.log('latLng', latLng)
      let map = (this as any).$refs.mapRef.$mapObject;

      let service = new google.maps.places.PlacesService(map);
      let keywordInput = this.searchKeyword;
      console.log(keywordInput);
      let _this = this


      //周辺検索
      service.nearbySearch(
        {
          location: latLng,
          radius: 800,
          type: ['restaurant'],
          keyword: keywordInput,
          language: 'ja'
        },
        _this.displayResults
      )
    },
    displayResults(results: any, status: any, pagination: any) {
      console.log(status)
      if(status === google.maps.places.PlacesServiceStatus.OK) {
        //検索結果をplacesList配列に連結
        for(let i = 0; i < results.length; i++) {
console.log('results', results);
          this.placesList = this.placesList.concat(results[i].name);
        }
      }
    }
  }
})
</script>

<style lang="scss">
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
.button-color {
  background-color: aqua;
  &-search {
    background-color:brown;
  }
}
</style>
