import { Context } from 'koishi'
import Config from '../config'
import { getContext, pushContext } from './conversation'
import { getOpenAIClient } from './query-client'

export const applyChatMiddleware = (ctx: Context, config: Config) => {
  const logger = ctx.logger('Ika')
  // const botName = ctx.root.config.nickname || 'ika'

  const openAIClient = getOpenAIClient({
    apiKey: config.chat.apiKey,
    basePath: config.chat.basePath,
    proxy: config.chat.proxy,
  })

  const chatIt = async (userId: string, content: string) => {
    try {
      const chatContent = content.trim()
      const completion = await openAIClient.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: config.chat.system,
          },
          ...getContext(userId)
            .map((context) => {
              return [
                { role: 'user' as const, content: context.q },
                { role: 'assistant' as const, content: context.a },
              ]
            })
            .flat(),
          { role: 'user', content: chatContent },
        ],
        temperature: 0.8,
      })

      const respContent = completion.data.choices[0].message.content

      // save context for next chat
      pushContext(userId, {
        q: chatContent,
        a: respContent,
      })

      return respContent
    } catch (e) {
      logger.error(e.response ? e.response.data : e.message)
      return '?????'
    }
  }

  ctx.middleware(async (session, next) => {
    if (session.parsed.appel) {
      const content = session.parsed.content

      const respContent = await chatIt(session.userId, content)

      session.send(respContent)
    } else {
      return next()
    }
  })

  if (config.chat.useCommand) {
    ctx.command('chat').action(async ({ session }) => {
      const content = session.parsed.content

      const respContent = await chatIt(session.userId, content)

      return respContent
    })
  }
}
