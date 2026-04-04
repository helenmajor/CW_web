<template>
  <div class="room">
    <div class="header">
      <h2><i class="fas fa-folder-open"></i> 绝密档案馆：命运重演</h2>
      <p>翻开前人的档案，猜测他们的结局，寻找破局的关键。</p>
    </div>
    
    <div class="archives">
      <!-- 案例1 -->
      <div class="case-file" :class="{ revealed: isRevealed[0] }">
        <div style="font-size:3rem; margin-bottom:10px;">🧑‍💻</div>
        <div class="profile-data">
          <div>专业：信计 (ICS)</div>
          <div>GPA：<span style="color:#e74c3c;">80/100 (危险)</span></div>
          <div>核心：<span style="color:#f9d976;">SAP研发实习 + Github高星</span></div>
        </div>
        <div v-show="!isRevealed[0]">
          <button class="btn-guess" @click="reveal(1)">A. 全聚德</button>
          <button class="btn-guess" @click="reveal(1)">B. 逆袭 Top 50</button>
        </div>
        <div class="truth" v-show="isRevealed[0]">
          <b>真相：逆袭 Top 50！</b><br>
          顶级名企研发实习和实战代码能力，弥补了 GPA 的不足。
        </div>
      </div>

      <!-- 案例2 -->
      <div class="case-file" :class="{ revealed: isRevealed[1] }">
        <div style="font-size:3rem; margin-bottom:10px;">👩‍🎓</div>
        <div class="profile-data">
          <div>专业：数据科学 (DS)</div>
          <div>GPA：<span style="color:#f9d976;">91/100 (极高)</span></div>
          <div>核心：<span style="color:#e74c3c;">零实习、零科研</span></div>
        </div>
        <div v-show="!isRevealed[1]">
          <button class="btn-guess" @click="reveal(2)">A. 乱杀 Top 30</button>
          <button class="btn-guess" @click="reveal(2)">B. 申请严重受挫</button>
        </div>
        <div class="truth" v-show="isRevealed[1]">
          <b>真相：申请受挫！</b><br>
          “空心学霸”陷阱。理工科/商科没有实战经历，高分也难救主。
        </div>
      </div>
    </div>

    <button 
      class="btn-complete" 
      v-show="showFinishBtn" 
      @click="finishNode"
    >
      吸收经验，返回地图 (+30金币)
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式状态：控制两个档案是否解锁
const isRevealed = ref([false, false])
// 控制完成按钮显示
const showFinishBtn = ref(false)
// 解锁计数
let count = 0

// 解锁档案真相
const reveal = (id) => {
  isRevealed.value[id - 1] = true
  count++
  // 两个档案都解锁后显示完成按钮
  if (count === 2) {
    showFinishBtn.value = true
  }
}

// 完成节点，返回地图
const finishNode = () => {
  alert("已返回地图！请前往 Y2-7 节点进行最终测试。")
}
</script>

<style scoped>
/* 完全复刻原版CSS样式 */
body { 
  background: radial-gradient(circle at center, #1e2022 0%, #000 100%); 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh; 
  margin: 0; 
  color: #e8e6e3; 
  font-family: 'Segoe UI', sans-serif;
}
.room { 
  width: 100%; 
  max-width: 900px; 
  background: rgba(20, 22, 24, 0.85); 
  border: 2px solid #c8a165; 
  border-radius: 20px; 
  padding: 40px; 
  text-align: center; 
}
.header h2 { 
  color: #f9d976; 
  margin-bottom: 30px; 
  font-size: 2rem;
}
.archives { 
  display: flex; 
  gap: 20px; 
  justify-content: center; 
}
.case-file { 
  background: linear-gradient(135deg, #2a2d34, #1b1c20); 
  border: 1px solid #4a4d55; 
  border-radius: 12px; 
  width: 320px; 
  padding: 20px; 
  box-shadow: 0 10px 20px rgba(0,0,0,0.5); 
  position: relative; 
}
.case-file.revealed { 
  border-color: #2ecc71; 
  background: linear-gradient(135deg, #1b2a22, #101a15); 
}
.profile-data { 
  text-align: left; 
  border-top: 1px dashed #4a4d55; 
  padding-top: 15px; 
  margin: 15px 0; 
  font-size: 0.9rem;
}
.btn-guess { 
  background: #c8a165; 
  border: none; 
  padding: 8px; 
  width: 100%; 
  margin-bottom: 8px; 
  border-radius: 5px; 
  font-weight: bold; 
  cursor: pointer; 
}
.btn-guess:hover { 
  background: #f9d976; 
}
.truth { 
  display: none; 
  color: #a8e6cf; 
  text-align: left; 
  font-size: 0.9rem; 
  border-top: 1px solid #2ecc71; 
  padding-top: 10px;
}
/* Vue 适配：v-show 会接管 display，这里保留基础样式 */
.truth[v-show] {
  display: block !important;
}
.btn-complete { 
  margin-top: 30px; 
  padding: 12px 30px; 
  background: #2ecc71; 
  color: #000; 
  border: none; 
  border-radius: 20px; 
  font-weight: bold; 
  cursor: pointer; 
  display: none;
}
/* Vue 适配：v-show 接管显示隐藏 */
.btn-complete[v-show] {
  display: inline-block !important;
}
</style>