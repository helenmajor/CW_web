<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="shop-modal-content">
      <div class="modal-header">
        <span><i class="fas fa-gift"></i> Loot Exchange Center</span>
      </div>

      <div class="shop-topbar">
        <div>
          <h2>Trade your effort for lovely rewards!</h2>
          <p>Year 2 and Year 3 share one Coin balance.</p>
        </div>
        <div class="shop-balance">Current Balance: {{ balance }} {{ currencyLabel }}</div>
      </div>

      <div class="shop-grid">
        <div v-for="item in prizes" :key="item.id" class="prize-card">
          <div class="prize-emoji">{{ item.emoji }}</div>
          <div class="prize-title">{{ item.name }}</div>
          <div class="prize-desc">{{ item.desc }}</div>
          <div class="prize-cost">Cost {{ item.cost }} {{ currencyLabel }}</div>
          <button class="prize-btn" :disabled="balance < item.cost" @click="$emit('redeem', item)">
            {{ balance >= item.cost ? 'Redeem' : 'Not Enough' }}
          </button>
        </div>
      </div>

      <div v-if="redeemMessage" class="redeem-log" v-html="redeemMessage"></div>
      <div class="shop-note">Treat this as a gamified feedback loop. Returning here after clearing nodes brings a huge sense of achievement.</div>

      <button class="btn-exit" @click="$emit('close')">Exit Shop</button>
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
  { id: 'bear', name: 'XJTLU Bear', emoji: '\u{1F9F8}', cost: 40, desc: 'A super cute popular reward, perfect as a souvenir for minor milestones.' },
  { id: 'movie', name: 'Movie Ticket', emoji: '\u{1F3AC}', cost: 60, desc: 'Reward your hardworking self with a relaxing movie night. It is okay to pause.' },
  { id: 'hotpot', name: 'Hotpot Voucher', emoji: '\u{1F372}', cost: 80, desc: 'You worked hard. Reward yourself with a steaming hot pot of joy.' },
  { id: 'course', name: 'VIP Express Course', emoji: '\u{1F393}', cost: 100, desc: 'A functional grand prize. Perfect for unlocking after saving up resources.' },
  { id: 'vocab', name: 'Vocabulary Book', emoji: '\u{1F4D8}', cost: 30, desc: 'Practical and cute. A low-threshold reward to build positive feedback.' },
]

const currencyLabel = computed(() => 'Coins')
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
