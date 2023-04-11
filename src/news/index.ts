import dayjs from 'dayjs'
import { Context } from 'koishi'
import Config from '../config'

export const applyNewsMiddleware = (ctx: Context, config: Config) => {
  ctx.command('news', '每日新闻').action(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const vendor = new URL(config.news.vendor)
    // prevent cache
    vendor.searchParams.append('d', today)
    return `<image url="${vendor.toString()}" timeout="10000"></image>`
  })
}
