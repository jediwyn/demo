// 阿里云百炼平台 API 配置
const CONFIG = {
  apiKey: 'sk-dcf88774281e4f788237d5952a992854',
  appId: '486eb86f977b47d8b0e293e05b09671a',
  baseURL: 'https://dashscope.aliyuncs.com/api/v1/apps'
}

/**
 * 调用阿里云百炼智能体API生成回复
 * @param {Object} params - 请求参数
 * @param {string} params.brandName - 品牌名称
 * @param {string} params.category - 经营品类
 * @param {string} params.features - 品牌特色
 * @param {string} params.review - 用户评论
 * @param {string} params.tone - 回复语气 (活泼/专业/幽默)
 * @param {number} params.wordCount - 字数档位 (100/200/300/400)
 * @returns {Promise<string>} - 生成的回复内容
 */
export async function generateReply(params) {
  const { brandName, category, features, review, tone, wordCount } = params

  // 构建系统提示词
  const systemPrompt = `你是一位专业的商家评论回复专家。请根据以下信息生成一条高质量的评论回复：

【商家信息】
- 品牌名称：${brandName}
- 经营品类：${category}
- 品牌特色：${features}

【用户评论】
${review}

【回复要求】
- 语气风格：${tone}
- 字数要求：约${wordCount}字
- 结合品牌特色和用户评论内容
- 语气真诚友好，体现商家专业度
- 回复要有针对性，不要套话模板
- 如用户提出问题或不满，要给出积极回应和解决方案

请直接输出回复内容，不要包含任何前缀或说明文字。`

  try {
    const response = await fetch(`${CONFIG.baseURL}/${CONFIG.appId}/completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          prompt: systemPrompt,
          parameters: {
            max_tokens: wordCount * 2,
            temperature: 0.8
          }
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API 请求失败: ${response.status}`)
    }

    const data = await response.json()

    // 解析返回结果
    if (data.output && data.output.text) {
      return data.output.text.trim()
    }

    // 备用解析路径
    if (data.result) {
      return data.result.trim()
    }

    throw new Error('API 返回数据格式异常')
  } catch (error) {
    console.error('AI 生成失败:', error)
    throw error
  }
}

/**
 * 验证经营信息是否完整
 */
export function validateBusinessInfo(info) {
  const errors = []

  if (!info.brandName || info.brandName.trim().length < 2) {
    errors.push('品牌名称至少需要2个字符')
  } else if (info.brandName.length > 30) {
    errors.push('品牌名称不能超过30个字符')
  }

  if (!info.category || info.category.trim().length < 5) {
    errors.push('经营品类至少需要5个字符')
  } else if (info.category.length > 50) {
    errors.push('经营品类不能超过50个字符')
  }

  if (!info.features || info.features.trim().length < 10) {
    errors.push('品牌特色至少需要10个字符')
  } else if (info.features.length > 100) {
    errors.push('品牌特色不能超过100个字符')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证评论内容
 */
export function validateReview(review) {
  if (!review || review.trim().length === 0) {
    return { valid: false, error: '请输入有效评论' }
  }
  if (review.length > 800) {
    return { valid: false, error: '请精简至800字内' }
  }
  return { valid: true, error: null }
}
