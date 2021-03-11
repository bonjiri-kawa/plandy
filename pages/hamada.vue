<template lang="pug">
.hoge(v-cloak)
  p テスト
  button(@click="hogeFunc2('hogeFunc2')") {{ hogeStr }}
</template>

<script lang="ts">
import { defineComponent, onMounted } from "@vue/composition-api"

/**
 * ダッシュボード画面
 */
export default defineComponent({
  components: {},
  props: {},
  setup() {
    
    const hogeStr:string = "ボタンです";
    const hogeNum:number = 123
    
    const hogeFunc2 = (message: string) => {
      console.log(message);
    };
    
    onMounted(()=> {
    })
    
    return {
      hogeStr,
      hogeFunc2
    };
  }
});
</script>

<style lang="scss"></style>
