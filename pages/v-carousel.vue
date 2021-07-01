<template>
  <div>
    <v-btn @click="showDialog">ダイアログ表示</v-btn>
    <v-app id="inspire" v-show="dialogShow">
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
          </v-card>
        </v-dialog>
      </div>
    </v-app>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogShow: false,
      dialog: true,
      model: 0,
      colors: [
        'primary',
        'secondary',
        'yellow darken-2',
        'red',
        'orange',
      ],
    }
  },
  methods: {
    showDialog() {
      this.dialogShow = true;
      this.dialog = true
    }
  }
}
</script>