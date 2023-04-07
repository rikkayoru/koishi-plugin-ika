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

  ctx.middleware(async (session, next) => {
    if (session.parsed.appel) {
      const content = session.parsed.content

      try {
        const chatContent = content.trim()
        const completion = await openAIClient.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: config.chat.system,
            },
            ...getContext(session.userId)
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
        pushContext(session.userId, {
          q: chatContent,
          a: respContent,
        })

        session.send(respContent)
      } catch (e) {
        logger.error(e.response ? e.response.data : e.message)
        session.send('?????')
      }
    } else {
      return next()
    }
  })
}
