export default interface Config {
  chat: {
    enable: boolean
    system?: string
    proxy?: string
    apiKey: string
  }
  news: {
    enable: boolean
    vendor: string
  }
}
