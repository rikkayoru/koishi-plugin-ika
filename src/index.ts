import { Context, Schema } from 'koishi'
import { applyChatMiddleware } from './chat'
import { applyNewsMiddleware } from './news'

export const name = 'Ika'

export const usage = 'Chat & Something else.'

import Config from './config'
export * from './config'

export const Config: Schema<Config> = Schema.object({
  // chat
  chat: Schema.object({
    enable: Schema.boolean().default(true),
    system: Schema.string()
      .description('chat人设')
      .default(
        '现在你是一个叫乌贼酱的16岁美少女, 性格调皮, 说话跳脱, 请根据这个设定进行对话'
      ),
    proxy: Schema.string()
      .description('Proxy addr')
      .default('socks://127.0.0.1:1080'),
    apiKey: Schema.string().description('openAi api key').default(''),
  }),
  // news
  news: Schema.object({
    enable: Schema.boolean(),
    vendor: Schema.string().default('https://api.vvhan.com/api/60s'),
  }),
})

export function apply(ctx: Context, config: Config) {
  if (config.chat.enable) {
    applyChatMiddleware(ctx, config)
  }
  if (config.news.enable) {
    applyNewsMiddleware(ctx, config)
  }
}
