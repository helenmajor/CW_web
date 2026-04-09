<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="shop-modal-content">
      <div class="modal-header">
        <span><i class="fas fa-gift"></i> 奖励兑换站 / Reward Exchange</span>
      </div>

      <div class="shop-topbar">
        <div>
          <h2>把学习进度换成温和的正反馈。/ Turn progress into gentle positive reinforcement.</h2>
          <p>这里不是主线玩法，而是给长期申请规划一点可见成就感。/ This is a support loop for long-term planning, not the main learning task.</p>
        </div>
        <div class="shop-balance">当前余额 / Current Balance: {{ balance }} {{ currencyLabel }}</div>
      </div>

      <div class="shop-learning-note">
        <strong>系统说明 / Why this exists</strong>
        <span>完成节点得到货币，兑换奖励是为了强化持续规划的节奏感。/ Currency rewards are here to reinforce consistent progress through the application-learning journey.</span>
      </div>

      <div class="shop-grid">
        <div v-for="item in prizes" :key="item.id" class="prize-card">
          <div class="prize-emoji">{{ item.emoji }}</div>
          <div class="prize-title">{{ item.nameZh }} / {{ item.name }}</div>
          <div class="prize-desc">{{ item.descZh }} / {{ item.desc }}</div>
          <div class="prize-cost">价格 / Cost {{ item.cost }} {{ currencyLabel }}</div>
          <button class="prize-btn" :disabled="balance < item.cost" @click="$emit('redeem', item)">
            {{ balance >= item.cost ? '兑换 / Redeem' : '余额不足 / Not Enough' }}
          </button>
        </div>
      </div>

      <div v-if="redeemMessage" class="redeem-log" v-html="redeemMessage"></div>
      <div class="shop-note">把它当作阶段奖励而不是目标本身。/ Treat the shop as milestone feedback, not the goal itself.</div>

      <button class="btn-exit" @click="$emit('close')">离开兑换站 / Exit Shop</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['close', 'redeem'])

const props = defineProps({
  activeYear: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  redeemMessage: {
    type: String,
    default: '',
  },
})

const prizes = [
  { id: 'bear', name: 'XJTLU Bear', nameZh: '西浦小熊', emoji: '\u{1F9F8}', cost: 40, desc: 'A cute milestone souvenir.', descZh: '适合作为小阶段完成后的纪念奖励。' },
  { id: 'movie', name: 'Movie Ticket', nameZh: '电影票', emoji: '\u{1F3AC}', cost: 60, desc: 'A reminder that rest is part of strategy.', descZh: '提醒你休息也是长期规划的一部分。' },
  { id: 'hotpot', name: 'Hotpot Voucher', nameZh: '火锅券', emoji: '\u{1F372}', cost: 80, desc: 'Celebrate a heavy week of progress.', descZh: '适合在高强度推进后给自己一个阶段庆祝。' },
  { id: 'course', name: 'VIP Express Course', nameZh: '进阶课程券', emoji: '\u{1F393}', cost: 100, desc: 'A functional grand prize after sustained saving.', descZh: '更偏实用型的大额奖励，适合长期积累后兑换。' },
  { id: 'vocab', name: 'Vocabulary Book', nameZh: '词汇书', emoji: '\u{1F4D8}', cost: 30, desc: 'A practical low-threshold study reward.', descZh: '门槛较低、也更贴近学习的实用奖励。' },
]

const currencyLabel = computed(() => (props.activeYear === 'y2' ? 'Coins / 金币' : 'Gems / 宝石'))
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 30, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.shop-modal-content {
  background: #fffcf4;
  width: 90%;
  max-width: 680px;
  border-radius: 24px;
  padding: 25px;
  border: 3px solid #e2bc7c;
  box-shadow: 0 20px 32px rgba(0, 0, 0, 0.28);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  font-size: 1.5rem;
  color: #5d4037;
  font-weight: 900;
  font-family: Georgia, serif;
  margin-bottom: 18px;
}

.shop-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.shop-topbar h2 {
  font-size: 1.2rem;
  margin: 0 0 5px;
  color: #5d4037;
  font-family: Georgia, serif;
}

.shop-topbar p {
  margin: 0;
  font-size: 0.85rem;
  color: #8d6e63;
  font-style: italic;
}

.shop-balance {
  background: #2c5a6e;
  color: #ffdf99;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 1.05rem;
  border: 2px solid #ffcd7e;
  box-shadow: 0 3px 0 #163a48;
}

.shop-learning-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(32, 52, 62, 0.08);
  border: 1px solid rgba(44, 90, 110, 0.15);
  color: #51646e;
  line-height: 1.55;
}

.shop-learning-note strong {
  color: #2c5a6e;
  white-space: nowrap;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.prize-card {
  background: #fff6e8;
  border: 2px solid #e6cf9f;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prize-emoji {
  font-size: 2rem;
  line-height: 1;
}

.prize-title {
  font-size: 1.05rem;
  font-weight: 900;
  color: #2c5a6e;
}

.prize-desc {
  font-size: 0.85rem;
  color: #5b6d75;
  line-height: 1.4;
}

.prize-cost {
  display: inline-block;
  width: fit-content;
  background: #fff0c9;
  color: #8c5d16;
  border: 2px solid #f1c36b;
  border-radius: 999px;
  padding: 4px 12px;
  font-weight: 900;
  font-size: 0.85rem;
}

.prize-btn {
  margin-top: auto;
  border: none;
  border-radius: 999px;
  padding: 10px 15px;
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  background: #4f7d32;
  color: #fff;
  box-shadow: 0 4px 0 #2c5a1a;
  transition: 0.2s;
}

.prize-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #659b42;
}

.prize-btn:disabled {
  background: #a8b0b4;
  box-shadow: 0 4px 0 #768087;
  cursor: not-allowed;
}

.redeem-log {
  margin-top: 15px;
  background: #20343e;
  color: #ffeaa8;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e5b76e;
  line-height: 1.5;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
}

.shop-note {
  margin-top: 15px;
  text-align: center;
  color: #7a6a54;
  font-size: 0.85rem;
  font-style: italic;
}

.btn-exit {
  display: block;
  width: 100%;
  margin-top: 20px;
  background: #e74c3c;
  color: white;
  border: 2px solid #c0392b;
  padding: 12px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #922b21;
  transition: 0.2s;
}

.btn-exit:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

@media (max-width: 720px) {
  .shop-grid {
    grid-template-columns: 1fr;
  }
}
</style>
