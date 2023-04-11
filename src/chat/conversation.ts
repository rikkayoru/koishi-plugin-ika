const MAX_CONTEXT = 8

interface Context {
  q: string
  a: string
}

interface Conversations {
  [uid: string]: Context[]
}

const conversations: Conversations = {}

export const pushContext = (uid: string, context: Context) => {
  const conversation = conversations[uid]

  if (!conversation) {
    conversations[uid] = [context]
  } else {
    // with bot's return
    if (conversation.length >= MAX_CONTEXT) {
      conversation.splice(0, 1)
    }
    conversation.push(context)
  }
}

export const getContext = (uid: string) => {
  const conversation = conversations[uid]

  return conversation ?? []
}

export const clearContext = (uid: string) => {
  delete conversations[uid]
}
