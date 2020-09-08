import { baseURL, fetch } from '@/fetch'
import { createPage, createComponent } from '@/core/create'

App({
  fetch,
  baseURL,
  createPage,
  createComponent,
  onLaunch() {
    console.log('app launch')
  }
})
