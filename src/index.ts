import { Context, Schema } from 'koishi'
import { getContext, pushContext } from './conversation'
import { getOpenAIClient } from './query-client'

export const name = 'Ika'

export const usage = 'Chat with openAi.'

export interface Config {
  system?: string
  proxy?: string
  apiKey: string
}

export const Config: Schema<Config> = Schema.object({
  system: Schema.string()
    .description('chat人设')
    .default(
      '现在你是一个叫乌贼酱的16岁美少女, 性格调皮, 说话跳脱, 请根据这个设定进行对话'
    ),
  proxy: Schema.string().description('Proxy addr').default(''),
  apiKey: Schema.string().description('openAi api key').default(''),
})

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('Ika')
  const botName = ctx.root.config.nickname || 'ika'

  const openAIClient = getOpenAIClient({
    apiKey: config.apiKey,
    proxy: config.proxy,
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
              content: config.system,
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
