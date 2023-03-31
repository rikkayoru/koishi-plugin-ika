import { Context } from 'koishi'
import Config from '../config'

export const applyNewsMiddleware = (ctx: Context, config: Config) => {
  ctx.command('news').action(() => {
    return `<image url="${config.news.vendor}"></image>`
  })
}
