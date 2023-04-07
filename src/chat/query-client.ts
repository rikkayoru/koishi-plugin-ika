import { Configuration, OpenAIApi } from 'openai'
import { SocksProxyAgent } from 'socks-proxy-agent'

export const getOpenAIClient = (options: {
  apiKey: string
  basePath?: string
  proxy?: string
}) => {
  const { apiKey, proxy } = options
  const baseOptions = {}

  if (apiKey === '') {
    throw new Error(`Open ai key missed`)
  }

  if (proxy !== '') {
    const httpsAgent = new SocksProxyAgent(proxy)
    baseOptions[`httpAgent`] = httpsAgent
    baseOptions[`httpsAgent`] = httpsAgent
  }

  const basePath = options.basePath.replace(/\/+$/, '')

  const configuration = new Configuration({
    apiKey,
    basePath,
    baseOptions,
  })

  return new OpenAIApi(configuration)
}
