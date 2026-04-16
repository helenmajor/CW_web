import axios from 'axios'
import { ref, computed } from 'vue'

// 从环境变量读取 API 密钥
const envApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''

console.log('=== DeepSeek 初始化 ===')
console.log('环境变量中的API密钥:', envApiKey ? envApiKey.substring(0, 15) + '...' : '❌ 未找到')
console.log('完整密钥长度:', envApiKey.length)

export function useDeepSeekChat() {
  const apiKey = ref(envApiKey || '')
  const isConfigured = computed(() => apiKey.value.length > 0)
  const isLoading = ref(false)
  const error = ref(null)

  const setApiKey = (key) => {
    apiKey.value = key
    localStorage.setItem('deepseek_api_key', key)
  }

  const loadApiKey = () => {
    // 优先使用环境变量，然后尝试本地存储
    if (envApiKey) {
      apiKey.value = envApiKey
    } else {
      const savedKey = localStorage.getItem('deepseek_api_key')
      if (savedKey) {
        apiKey.value = savedKey
      }
    }
  }

  const sendMessage = async (message, conversationHistory = []) => {
    if (!isConfigured.value) {
      error.value = 'DeepSeek API key not configured'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      // 构建完整的消息历史
      const messages = [
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ]

      console.log('Sending to DeepSeek API:', {
        apiKey: apiKey.value.substring(0, 10) + '...',
        messages: messages
      })

      const response = await axios.post('https://api.deepseek.com/chat/completions', {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response from DeepSeek:', response.data)
      const reply = response.data.choices?.[0]?.message?.content || 'No response'
      return reply
    } catch (err) {
      console.error('Full error object:', err)
      console.error('Error response:', err.response)

      if (err.response?.status === 401) {
        error.value = '❌ API 密钥无效或已过期'
      } else if (err.response?.status === 429) {
        error.value = '⏱️ 请求过于频繁，请稍候'
      } else if (err.code === 'ERR_NETWORK') {
        error.value = '❌ 网络连接失败，请检查网络'
      } else {
        error.value = err.response?.data?.error?.message || err.message || 'Failed to get response'
      }

      console.error('DeepSeek API error:', error.value)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    apiKey,
    isConfigured,
    isLoading,
    error,
    setApiKey,
    loadApiKey,
    sendMessage
  }
}
