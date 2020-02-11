<!--  eslint-disable vue/no-parsing-error -->
<template>
  <div class="container">
    <h2 class="text-center">
      Janda Home Server Status
    </h2>
    <b-button :variant="status === 'Online' ? 'success' : 'danger'" block size="lg" disabled>{{ status }}</b-button>
    <h6 class="text-center">
      <b>Last Check:</b>
      {{ last }}
    </h6>
    <h6 class="text-center">
      <b>Next Check:</b>
      {{ next }}
    </h6>
  </div>
</template>

<script>
/* eslint-disable arrow-parens */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-console */
import axios from 'axios'
export default {
  data() {
    return {
      status: 'loading..',
      last: '...',
      next: '...'
    }
  },
  mounted() {
    setTimeout(() => {
      this.status = this.status + '.'
    }, 750)
    setTimeout(() => {
      this.status = this.status + '.'
      this.checkStatus()
    }, 1500)
  },
  methods: {
    checkStatus() {
      console.log('checking status...')
      axios(`/.netlify/functions/home-status`)
      // axios(`http://localhost:9000/home-status`)
        .then(res => {
          console.log(res.data)
          this.status = res.data.online === true ? 'Online' : 'Offline'
          this.last = res.data.last_check
          this.next = res.data.next_check
        })
        .catch(err => {
          console.error(err)
        })
    }
  }
}
</script>
