<template>
  <GameLevelScaffold
    title="推荐信沟通室 / Recommendation Dialogue"
    subtitle="这关不是在玩好感度，而是在练习：怎样礼貌、明确、专业地推进推荐信请求。/ The dialogue tree maps to real recommendation-letter communication etiquette."
    :guide="guide"
    tone="amber"
    :tags="['推荐信沟通 / RL communication', '材料准备 / Info package']"
    status-label="导师好感度 / Mentor Favorability"
    :status-text="currentNode.hearts"
  >
    <section v-if="!completed" class="simulator">
      <div class="status-bar">
        <div><strong>Mentor Mood / 导师状态</strong><span>{{ moodLabel }}</span></div>
        <div class="hearts">{{ currentNode.hearts }}</div>
      </div>

      <div class="character-stage">
        <div class="cat-avatar" :class="currentNode.mood">{{ currentNode.emoji }}</div>
      </div>

      <div class="dialogue-box">
        <div class="speaker">Prof. Wildcat / 猫猫导师</div>
        <div class="dialogue-text" v-html="currentNode.text"></div>
        <div class="choices">
          <button
            v-for="choice in currentNode.choices"
            :key="choice.text"
            type="button"
            class="choice-btn"
            @click="selectChoice(choice.nextId)"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
    </section>

    <section v-else class="clear-card">
      <h2>推荐信沟通模板已掌握 / RL request flow mastered</h2>
      <p>你成功让“傲娇导师”进入合作状态。本关真正教的是：提前沟通、明确项目与 deadline、并给推荐人准备好信息包，能显著减少摩擦并提升推荐质量。</p>
      <div class="actions">
        <button class="secondary" @click="restart">重玩对话 / Replay Conversation</button>
        <button class="primary" @click="completeLevel">保存沟通心得 / Save RL Takeaway</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y3', 5)

const storyTree = {
  start: {
    text: '(你敲开导师办公室的门)<br>😼 Meow? 又是申请季？你想说什么，先讲重点。',
    emoji: '😼',
    mood: 'normal',
    hearts: '❤️❤️🤍🤍🤍',
    choices: [
      { text: 'Professor! I need a recommendation letter right now! / 老师快帮我写推荐信！', nextId: 'bad_start' },
      { text: '老师您好，我是上学期上过您课的 XXX，想和您咨询推荐信事宜。', nextId: 'good_start' },
    ],
  },
  bad_start: {
    text: '😾 一上来就命令式开口？连自我介绍都没有，我怎么知道你是谁？',
    emoji: '😾',
    mood: 'angry',
    hearts: '❤️🤍🤍🤍🤍',
    choices: [
      { text: '抱歉老师，我是上学期坐前排的那位……', nextId: 'recover' },
      { text: '就随便写几句吧，应该很快。', nextId: 'reset_rude' },
    ],
  },
  recover: {
    text: '😼 这样至少像个正式请求了。那你申请什么项目？什么时候截止？',
    emoji: '😼',
    mood: 'normal',
    hearts: '❤️❤️🤍🤍🤍',
    choices: [
      { text: '项目还没定，您先写一封通用版吧。', nextId: 'reset_vague' },
      { text: '目标是 XX 项目，截止在下个月月底，所以我提前一个月来征求您的意愿。', nextId: 'good_timing' },
    ],
  },
  good_start: {
    text: '😸 嗯，至少你知道先说明身份。你申请什么项目？什么时候需要？',
    emoji: '😸',
    mood: 'happy',
    hearts: '❤️❤️❤️🤍🤍',
    choices: [
      { text: '明天晚上截止，老师救命！', nextId: 'reset_rush' },
      { text: '我想申请 XX 项目，截止在下个月底，所以提前一个月来询问您是否方便。', nextId: 'good_timing' },
    ],
  },
  good_timing: {
    text: '😼 提前一个月，这就对了。但我很忙，你准备了什么材料来帮我快速回忆你的亮点？',
    emoji: '😼',
    mood: 'normal',
    hearts: '❤️❤️❤️🤍🤍',
    choices: [
      { text: '只有成绩单，其他您就凭印象自由发挥吧。', nextId: 'reset_lazy' },
      { text: '我准备了 CV、成绩单、项目列表、目标项目清单和课程亮点 summary。', nextId: 'perfect' },
    ],
  },
  reset_rude: {
    text: '😾 “随便写几句”不是推荐信沟通。<br><span style="color:#fca5a5">现实后果：导师会觉得你不尊重时间与学术信誉。</span>',
    emoji: '🙀',
    mood: 'angry',
    hearts: '🖤🖤🖤🖤🖤',
    choices: [{ text: '重来并学习基本礼仪 / Retry with better etiquette', nextId: 'start' }],
  },
  reset_vague: {
    text: '😾 目标项目都没定，就很难写出有针对性的推荐信。<br><span style="color:#fca5a5">现实后果：内容会泛泛而谈，匹配度很低。</span>',
    emoji: '😾',
    mood: 'angry',
    hearts: '❤️🤍🤍🤍🤍',
    choices: [{ text: '回去先做好项目调研 / Go decide the targets first', nextId: 'start' }],
  },
  reset_rush: {
    text: '😾 明天就截止才来找导师，是最容易翻车的高风险动作。<br><span style="color:#fca5a5">现实后果：导师没时间写，或者内容仓促质量差。</span>',
    emoji: '😾',
    mood: 'angry',
    hearts: '🖤🖤🖤🖤🖤',
    choices: [{ text: '记住至少提前数周沟通 / Retry with better timing', nextId: 'start' }],
  },
  reset_lazy: {
    text: '😾 推荐人不是读心术大师。没有信息包，导师很难高质量回忆你的亮点。<br><span style="color:#fca5a5">现实后果：推荐信会非常空泛。</span>',
    emoji: '😾',
    mood: 'angry',
    hearts: '🤍🤍🤍🤍🤍',
    choices: [{ text: '重来并准备材料包 / Retry with an info package', nextId: 'start' }],
  },
  perfect: {
    text: '😻 这就对了。你已经把“礼貌开口 + 提前沟通 + 明确目标 + 准备信息包”都做对了。<br><span style="color:#86efac">这就是更专业的推荐信请求流程。</span>',
    emoji: '😻',
    mood: 'happy',
    hearts: '❤️❤️❤️❤️❤️',
    choices: [{ text: '领取推荐信沟通总结 / Save this RL communication pattern', nextId: 'exit' }],
  },
}

const currentId = ref('start')
const completed = ref(false)

const currentNode = computed(() => storyTree[currentId.value])
const moodLabel = computed(() => {
  if (currentNode.value.mood === 'happy') return '配合意愿较高 / Cooperative'
  if (currentNode.value.mood === 'angry') return '被冒犯 / Irritated'
  return '可继续沟通 / Neutral'
})

function selectChoice(nextId) {
  if (nextId === 'exit') {
    completed.value = true
    return
  }

  currentId.value = nextId
}

function restart() {
  currentId.value = 'start'
  completed.value = false
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: '推荐信沟通的关键是：提前联系、明确项目与 deadline，并给推荐人准备好信息包。/ Strong RL communication depends on timing, clarity, and a good info package.',
    },
  })
}
</script>

<style scoped>
.simulator,
.clear-card {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(to bottom, #4a6984, #2a3b4c);
  border: 1px solid rgba(245, 179, 66, 0.24);
  color: #fff;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.32);
}

.status-bar strong {
  display: block;
}

.hearts {
  color: #fb7185;
  font-weight: 900;
  letter-spacing: 4px;
}

.character-stage {
  min-height: 260px;
  display: grid;
  place-items: center;
}

.cat-avatar {
  font-size: 8rem;
  filter: drop-shadow(0 15px 15px rgba(0, 0, 0, 0.35));
}

.cat-avatar.angry {
  animation: angry-shake 0.5s infinite;
}

.cat-avatar.happy {
  animation: happy-bounce 2s infinite ease-in-out;
}

@keyframes angry-shake {
  0% { transform: translateX(0) scale(1.05); }
  25% { transform: translateX(-8px) rotate(-4deg) scale(1.08); }
  50% { transform: translateX(8px) rotate(4deg) scale(1.08); }
  100% { transform: translateX(0) scale(1.05); }
}

@keyframes happy-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.dialogue-box {
  padding: 20px;
  background: rgba(20, 20, 20, 0.82);
  border-top: 2px solid rgba(245, 179, 66, 0.4);
}

.speaker {
  display: inline-block;
  margin-top: -34px;
  padding: 8px 16px;
  border-radius: 0 16px 16px 0;
  background: #f5b342;
  color: #1e1e1e;
  font-weight: 900;
}

.dialogue-text {
  margin-top: 14px;
  line-height: 1.8;
  font-size: 1.05rem;
}

.choices {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.choice-btn {
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  font-weight: 700;
}

.choice-btn:hover {
  background: rgba(245, 179, 66, 0.18);
}

.clear-card {
  padding: 24px;
}

.clear-card h2 {
  margin: 0;
  font-family: Georgia, serif;
}

.clear-card p {
  margin: 12px 0 0;
  line-height: 1.8;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.actions button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
</style>
