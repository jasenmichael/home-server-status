<template>
  <div class="container">
    <h2>Janda Home Server Status</h2>
    <b-button block size="lg" disabled>
      {{ status }}
    </b-button>
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
    console.log(
      'mounted',
      `https://happy-swartz-19c3c3.netlify.com/.netlify/functions/home-status/home-status`
    )
    setTimeout(() => {
      this.status = this.status + '.'
    }, 750)
    setTimeout(() => {
      this.status = this.status + '.'
      axios(`https://happy-swartz-19c3c3.netlify.com/.netlify/functions/home-status`)
        .then(res => {
          console.log(res.data)
          this.status = res.data.online === true ? 'Online' : 'Offline'
          this.last = res.data.last_check
          this.next = res.data.next_check
        })
        .catch(err => {
          console.error(err)
        })
    }, 1500)
  }
}
</script>
