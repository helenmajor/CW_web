<template>
  <!-- 保留全部原有结构，替换为Vue语法 -->
  <div class="desk">
    <div class="header">
      <h2>魔法局：材料鉴定处</h2>
      <div class="progress-bar">
        <!-- 动态绑定进度条宽度 -->
        <div 
          class="progress-fill" 
          :style="{ width: `${(currentIndex / database.length) * 100}%` }"
        ></div>
      </div>
    </div>

    <div class="parchment-stage">
      <!-- DOM引用 + 动态绑定动画class -->
      <div 
        ref="parchmentRef"
        class="parchment"
        :class="{
          'slide-in': showSlideIn,
          'burn-away': showBurnAway,
          'shake-error': showShakeError
        }"
      >
        <span ref="textBodyRef">正在加载卷宗...</span>
        <div 
          ref="stampMarkRef"
          class="stamp-mark"
          :class="{ 'stamp-anim': showStampAnim }"
        ></div>
      </div>
    </div>

    <div class="seals-container">
      <!-- 替换onclick为@click事件 -->
      <div class="seal-btn seal-cv" @click="slamStamp('cv', '#38bdf8', 'CV 履历')">
        <div class="seal-name">CV</div>
        <div class="seal-desc">客观事实</div>
      </div>
      <div class="seal-btn seal-ps" @click="slamStamp('ps', '#fde047', 'PS 灵魂')">
        <div class="seal-name">PS</div>
        <div class="seal-desc">主观动机</div>
      </div>
      <div class="seal-btn seal-rl" @click="slamStamp('rl', '#d8b4fe', 'RL 背书')">
        <div class="seal-name">RL</div>
        <div class="seal-desc">他者视角</div>
      </div>
    </div>
  </div>

  <!-- 错误弹窗：v-show控制显示隐藏 -->
  <div class="modal" v-show="isModalOpen" ref="errorModalRef">
    <div class="modal-card">
      <div class="modal-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <div class="modal-title">驳回！材料错位</div>
      <div class="modal-desc" v-html="errorMsg"></div>
      <button class="modal-btn" @click="closeModal">撤销重盖</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// 核心题库数据（完全保留）
const database = [
  { 
    text: "我在 SAP 实习期间，通过重构后端代码使系统响应速度提升了 25%。", 
    target: "cv", 
    error: "<b>PS 嫌太干，RL 视角落空。</b><br>这种带有清晰『量化产出』的客观陈述，是 CV（简历）的最爱，用来快速展示你的硬核下限。" 
  },
  { 
    text: "一次大厂实习的挫折，让我深刻意识到自己在分布式系统底层架构上的知识瓶颈，从而萌生了深造的想法。", 
    target: "ps", 
    error: "<b>CV 极其排斥主观长句！</b><br>长篇大论的情感转折和动机，放在 CV 里不仅占地方还不专业。这必须放在 PS（个人陈述）里讲好你的英雄故事。" 
  },
  { 
    text: "该生在《高阶算法》小组项目中展现了卓越的领导力，总能在团队卡壳时指出核心 Bug 所在。", 
    target: "rl", 
    error: "<b>不要自卖自夸！</b><br>如果在 PS 里自己夸自己卓越，会显得非常自大。这种第三方视角的软实力评价，是 RL（推荐信）的核心功能！" 
  },
  { 
    text: "精通 Python, Java, C++ 等编程语言；熟练掌握 MySQL 数据库管理。", 
    target: "cv", 
    error: "<b>不要把 PS 写成技能清单！</b><br>毫无感情的技能罗列，属于 CV 的专属板块。招生官不想在读 PS 故事时突然看到报菜名。" 
  },
  { 
    text: "我的长远愿景是成为一名能够独立主导企业级云计算架构的顶尖工程师。", 
    target: "ps", 
    error: "<b>未来愿景属于个人心声。</b><br>简历只记录你的『过去』和『现在』，而你的『未来』属于 PS 的升华部分。" 
  },
  { 
    text: "令我印象最深的是她面对极限 DDL 时的抗压能力，情绪极其稳定且产出高效。", 
    target: "rl", 
    error: "<b>主观评价需要第三方背书。</b><br>你不能在 CV 里写『我情绪稳定』，你需要导师在 RL 中用具体的观察来佐证你的软素质。" 
  }
]

// 响应式状态
const currentIndex = ref(0)
const isAnimating = ref(false)
const isModalOpen = ref(false)
const errorMsg = ref('')

// 动画控制状态
const showSlideIn = ref(false)
const showBurnAway = ref(false)
const showShakeError = ref(false)
const showStampAnim = ref(false)

// DOM 引用（替代原生getElementById）
const parchmentRef = ref(null)
const textBodyRef = ref(null)
const stampMarkRef = ref(null)

// 生命周期：页面挂载后启动游戏
onMounted(() => {
  setTimeout(loadParchment, 300)
})

// 加载卷宗
const loadParchment = () => {
  if (currentIndex.value >= database.length) {
    alert("🎉 鉴定完毕！你已完美掌握文书三结义的精髓，获得【首席鉴定官】徽章！\n即将前往 Y3-3：CV 门诊手术室。")
    return
  }

  // 重置所有动画
  showSlideIn.value = false
  showBurnAway.value = false
  showShakeError.value = false
  showStampAnim.value = false

  // 触发重绘（原生动画必备）
  nextTick(() => {
    textBodyRef.value.innerText = database[currentIndex.value].text
    stampMarkRef.value.style.opacity = '0'
    
    // 触发入场动画
    showSlideIn.value = true
    isAnimating.value = false
  })
}

// 盖章核心逻辑
const slamStamp = (type, color, label) => {
  if (isAnimating.value) return
  isAnimating.value = true

  const currentData = database[currentIndex.value]
  const stampEl = stampMarkRef.value

  // 设置印章样式
  stampEl.innerText = label
  stampEl.style.color = color
  stampEl.style.borderColor = color

  // 触发盖章动画
  showStampAnim.value = false
  void stampEl.offsetWidth
  showStampAnim.value = true

  setTimeout(() => {
    if (type === currentData.target) {
      // 盖章正确：燃烧动画
      showBurnAway.value = true
      setTimeout(() => {
        currentIndex.value++
        loadParchment()
      }, 600)
    } else {
      // 盖章错误：驳回+震动
      stampEl.innerText = "驳 回"
      stampEl.style.color = "#ef4444"
      stampEl.style.borderColor = "#ef4444"
      showShakeError.value = true

      setTimeout(() => {
        errorMsg.value = currentData.error
        isModalOpen.value = true
      }, 400)
    }
  }, 150)
}

// 关闭弹窗
const closeModal = () => {
  isModalOpen.value = false
  stampMarkRef.value.style.opacity = '0'
  showShakeError.value = false
  isAnimating.value = false
}
</script>

<style>
/* 完全保留原有CSS样式，无任何修改 */
* { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; user-select: none; }

body { 
    background: #0f0c20; 
    background-image: radial-gradient(circle at 50% 0%, #2e1a47 0%, transparent 60%);
    display: flex; justify-content: center; align-items: center; 
    min-height: 100vh; margin: 0; padding: 20px; color: #e2e8f0; overflow: hidden;
}

.desk {
    width: 100%; max-width: 600px; height: 85vh;
    display: flex; flex-direction: column; position: relative;
}

.header { text-align: center; margin-bottom: 20px; }
.header h2 { margin: 0; font-size: 1.8rem; color: #d8b4fe; letter-spacing: 2px; }
.progress-bar { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 15px; overflow: hidden; }
.progress-fill { width: 0%; height: 100%; background: linear-gradient(90deg, #fde047, #f59e0b); transition: width 0.3s; }

.parchment-stage {
    flex: 1; position: relative; display: flex; justify-content: center; align-items: center;
    perspective: 1000px;
}

.parchment {
    background: #fdf6e3; color: #2c1a0e; width: 90%; max-width: 400px; min-height: 250px;
    padding: 30px 25px; border-radius: 4px; box-shadow: 0 15px 35px rgba(0,0,0,0.5);
    font-size: 1.15rem; line-height: 1.6; font-weight: bold; text-align: left;
    position: absolute; border: 1px solid #d4c5b0;
    background-image: radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px);
    background-size: 10px 10px;
    transition: 0.3s;
}

.parchment::before {
    content: "“"; font-size: 4rem; color: rgba(0,0,0,0.1); position: absolute; top: 0px; left: 10px; font-family: serif;
}

.slide-in { animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes slideIn { 
    0% { transform: translateY(-100vh) rotate(-10deg); opacity: 0; } 
    100% { transform: translateY(0) rotate(2deg); opacity: 1; } 
}

.burn-away { animation: burn 0.6s forwards; }
@keyframes burn {
    0% { transform: scale(1) rotate(2deg); filter: brightness(1); opacity: 1; }
    40% { transform: scale(1.05) rotate(0deg); filter: brightness(1.5) sepia(1) hue-rotate(-50deg); opacity: 1; }
    100% { transform: scale(0.8) translateY(-50px); filter: brightness(2) sepia(1) hue-rotate(-50deg); opacity: 0; }
}

.shake-error { animation: shake 0.4s forwards; }
@keyframes shake {
    0%, 100% { transform: translateX(0) rotate(2deg); }
    25% { transform: translateX(-15px) rotate(-3deg); }
    75% { transform: translateX(15px) rotate(5deg); }
}

.stamp-mark {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(5);
    font-size: 4rem; font-weight: 900; border: 6px solid; border-radius: 10px; padding: 10px 20px;
    opacity: 0; pointer-events: none; z-index: 20; letter-spacing: 5px;
}
.stamp-anim { animation: smash 0.4s cubic-bezier(0.1, 2, 0.5, 1) forwards; }
@keyframes smash {
    0% { transform: translate(-50%, -50%) scale(5); opacity: 0; }
    40% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
    60% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1) rotate(-10deg); opacity: 0.9; }
}

.seals-container {
    display: flex; justify-content: space-around; padding: 20px 0; background: rgba(0,0,0,0.3); border-radius: 20px;
}

.seal-btn {
    background: linear-gradient(145deg, #1e1b4b, #0f0c20); border: 2px solid; border-radius: 50%;
    width: 90px; height: 90px; display: flex; flex-direction: column; justify-content: center; align-items: center;
    cursor: pointer; transition: 0.15s; box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.1);
}
.seal-btn:active { transform: scale(0.9) translateY(10px); box-shadow: 0 0px 5px rgba(0,0,0,0.5); }

.seal-cv { border-color: #38bdf8; color: #38bdf8; }
.seal-cv:hover { background: rgba(56, 189, 248, 0.1); box-shadow: 0 0 25px rgba(56, 189, 248, 0.4); }

.seal-ps { border-color: #fde047; color: #fde047; }
.seal-ps:hover { background: rgba(253, 224, 71, 0.1); box-shadow: 0 0 25px rgba(253, 224, 71, 0.4); }

.seal-rl { border-color: #d8b4fe; color: #d8b4fe; }
.seal-rl:hover { background: rgba(216, 180, 254, 0.1); box-shadow: 0 0 25px rgba(216, 180, 254, 0.4); }

.seal-name { font-size: 1.5rem; font-weight: 900; margin-bottom: 2px;}
.seal-desc { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;}

.modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
    display: none; justify-content: center; align-items: center; z-index: 50;
}
.modal-card {
    background: #1e1b4b; border: 2px solid #ef4444; border-radius: 16px; padding: 30px;
    width: 90%; max-width: 400px; text-align: center; box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-icon { font-size: 3.5rem; color: #ef4444; margin-bottom: 15px; }
.modal-title { font-size: 1.4rem; font-weight: bold; color: #fff; margin-bottom: 10px; }
.modal-desc { color: #cbd5e1; font-size: 1rem; line-height: 1.6; margin-bottom: 25px; text-align: left; }
.modal-btn { background: #ef4444; color: #fff; border: none; padding: 12px 30px; border-radius: 30px; font-size: 1.1rem; font-weight: bold; cursor: pointer; }

/* Vue弹窗显示控制 */
.modal[v-show] { display: flex; }
</style>
