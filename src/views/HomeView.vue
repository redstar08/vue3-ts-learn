<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import TheWelcome from '../components/TheWelcome.vue'
import AnimateView from './AnimateView.vue'
import DemoView from './DemoView.vue'

const count = ref(0)
</script>

<script lang="ts">
export default {
  beforeCreate() {
    console.log('App -> beforeCreate')
  },
  created() {
    console.log('App -> created')
  },
  beforeMount() {
    console.log('App -> beforeMount')
  },
  mounted() {
    console.log('App -> mounted')
  },
  beforeUpdate() {
    console.log('App -> beforeUpdate')
  },
  updated() {
    console.log('App -> updated')
  },
  beforeUnmounted() {
    console.log('App -> beforeUnmounted')
  },
  unmounted() {
    console.log('App -> unmounted')
  },
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/socket">Socket</RouterLink>
      </nav>
    </div>
  </header>
  <main>
    <el-button @click="() => count++">click me {{ count }}</el-button>
    <TheWelcome />
    <div class="w-full h-100px flex flex-col justify-center items-center fixed top-0 left-0">
      <AnimateView />
    </div>
    <DemoView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
