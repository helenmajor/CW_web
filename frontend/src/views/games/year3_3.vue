<template>
  <div class="clinic-room">
    <!-- 头部标题 -->
    <div class="header">
      <h2>
        <i class="fas fa-microscope" style="color: #f9d976"></i>
        真理鉴定局：文书急诊室 (10防版)
      </h2>
      <p>新生递交了一份充满“炸锅陷阱”的简历卷轴。拿起【真理放大镜】，揪出所有 6 处致命主线 Bug！</p>
    </div>

    <!-- 主工作区 -->
    <div class="workspace">
      <!-- 左侧简历羊皮纸 -->
      <div class="parchment-cv">
        <div
          class="cv-filename"
          :class="{ 'bug-text': true, fixed: completedBugs.includes('filename') }"
          @click="findBug('filename')"
        >
          📄 简历_最终版_真的很最终了.pdf
        </div>

        <div class="cv-body">
          <div class="cv-header">
            <h1>张三 (San Zhang)</h1>
            <p>
              邮箱:
              <span
                class="bug-text"
                :class="{ fixed: completedBugs.includes('email') }"
                @click="findBug('email')"
              >
                dark_dragon_99@qq.com
              </span>
              | 电话: +86-138xxxx
            </p>
          </div>

          <div class="cv-section">
            <h3><i class="fas fa-graduation-cap"></i> Education</h3>
            <div class="cv-item">
              <strong>XX University</strong>
              | B.S. in Computer Science
              <span style="float: right">2023 - 2027</span>
              <br />
              GPA:
              <span
                class="bug-text"
                :class="{ fixed: completedBugs.includes('gpa') }"
                @click="findBug('gpa')"
              >
                班级前三，成绩优异
              </span>
              <div style="font-size: 0.8rem; margin-top: 5px">
                <span
                  class="bug-text"
                  :class="{ fixed: completedBugs.includes('hs') }"
                  @click="findBug('hs')"
                >
                  曾获 XX 中学乒乓球赛亚军
                </span>
              </div>
            </div>
          </div>

          <div class="cv-section">
            <h3><i class="fas fa-briefcase"></i> Experience</h3>
            <div class="cv-item">
              <strong>Research Intern</strong>
              | Magical Lab
              <span style="float: right">Summer 2025</span>
              <ul class="cv-bullet">
                <li>
                  <span
                    class="bug-text"
                    :class="{ fixed: completedBugs.includes('vague') }"
                    @click="findBug('vague')"
                  >
                    协助导师完成了数据分析工作，修复了一些Bug，得到了表扬，学到了很多新知识。
                  </span>
                </li>
                <li>
                  <span
                    class="bug-text"
                    :class="{ fixed: completedBugs.includes('passive') }"
                    @click="findBug('passive')"
                  >
                    Learned how to use Python and scikit-learn for modeling.
                  </span>
                </li>
              </ul>
            </div>
            <div
              class="cv-item"
              :class="{ 'bug-text': true, fixed: completedBugs.includes('order') }"
              style="opacity: 0.6"
              @click="findBug('order')"
            >
              <strong>Voluntary Work</strong>
              | 2023 - 2024 (更老的经历)
            </div>
          </div>

          <div class="cv-section">
            <h3><i class="fas fa-tools"></i> Additional</h3>
            <ul class="cv-bullet">
              <li>
                Python:
                <span
                  class="bug-text"
                  :class="{ fixed: completedBugs.includes('score') }"
                  @click="findBug('score')"
                >
                  ⭐⭐⭐⭐⭐ (精通)
                </span>
              </li>
              <li>
                <span
                  class="bug-text"
                  :class="{ fixed: completedBugs.includes('hobby') }"
                  @click="findBug('hobby')"
                >
                  Hobbies: 精通《英雄联盟》，最强王者段位，善于团队指挥。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 右侧诊断面板 -->
      <div class="diagnostic-panel">
        <div class="panel-title">
          <i class="fas fa-clipboard-list"></i>
          主线 6 味核心药材
        </div>

        <ul class="checklist">
          <li
            class="check-item"
            :class="{ completed: completedBugs.includes('filename') }"
          >
            <i :class="completedBugs.includes('filename') ? 'fas fa-check-square' : 'far fa-square'"></i>
            <span>找出“Chaos 的文件命名”</span>
          </li>
          <li
            class="check-item"
            :class="{ completed: completedBugs.includes('email') }"
          >
            <i :class="completedBugs.includes('email') ? 'fas fa-check-square' : 'far fa-square'"></i>
            <span>找出“非主流不专业邮箱”</span>
          </li>
          <li
            class="check-item"
            :class="{ completed: completedBugs.includes('gpa') }"
          >
            <i :class="completedBugs.includes('gpa') ? 'fas fa-check-square' : 'far fa-square'"></i>
            <span>找出“模糊的学术指标描述”</span>
          </li>
          <li
            class="check-item"
            :class="{ completed: completedBugs.includes('vague') }"
          >
            <i :class="completedBugs.includes('vague') ? 'fas fa-check-square' : 'far fa-square'"></i>
            <span>找出“无数据的口水话描述”</span>
          </li>
          <li
            class="check-item"
            :class="{ completed: completedBugs.includes('hobby') }"
          >
            <i :class="completedBugs.includes('hobby') ? 'fas fa-check-square' : 'far fa-square'"></i>
            <span>找出“无关联的冗余爱好”</span>
          </li>
          <li
            class="check-item"
            :class="{ completed: completedBugs.includes('font') }"
          >
            <i :class="completedBugs.includes('font') ? 'fas fa-check-square' : 'far fa-square'"></i>
            <span>(点击反馈框) 诊断“致命的魔幻字体设计”</span>
          </li>
        </ul>

        <!-- 反馈框 -->
        <div class="feedback-box" v-show="feedback.show">
          <div class="feedback-title">{{ feedback.title }}</div>
          <div class="feedback-desc" v-html="feedback.desc"></div>
        </div>
      </div>
    </div>

    <!-- 成功弹窗 -->
    <div class="success-modal" v-show="showSuccess">
      <div class="modal-card">
        <h2><i class="fas fa-check-circle"></i> 诊断大满贯！</h2>
        <p style="color: #bcaaa4; margin-bottom: 20px">
          专业的邮箱、量化的 DDL、切题的背景、整洁的字体、正确的文件命名，才是拿下魔导师 Offer 的通途！
        </p>
        <div style="font-size: 3rem; margin: 10px 0">📜✨</div>
        <button class="btn-claim" @click="closeModal">
          领取【履历魔术师】徽章 (+60金币)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 错误数据库 (完全保留原逻辑)
const bugDatabase = {
  // 主线6个任务
  filename: { checkId: 'filename', title: "❌ Chaos 的文件命名", desc: "导师可能同时收到几百封邮件！这种乱七八糟的文件名会被直接视为垃圾。完美模板：<b>[姓名]_[项目名]_CV.pdf</b>" },
  email: { checkId: 'email', title: "❌ 非主流邮箱 (暗黑狂龙)", desc: "学术圈极其看重礼仪。使用包含QQ数字、火星文的非主流邮箱，会让教授直接质疑你的专业度。建议注册 <b>姓名拼音@gmail/edu</b> 邮箱。" },
  gpa: { checkId: 'gpa', title: "❌ 模糊的主观学术描述", desc: "升学战场讲究数据。GPA 必须写明具体数字和总分（如：3.8/4.0）。“成绩优异”只是主观词汇，毫无说服力！" },
  vague: { checkId: 'vague', title: "❌ 毫无数据的口水话 (无 STAR 法则)", desc: "这写的是“流水账”。应该改成：<b>使用 [某种技术] 修复了 [X] 个Bug，使性能提升了 [Y]%</b>。没有数据支撑的经历，等同于没做过！" },
  hobby: { checkId: 'hobby', title: "❌ 无关联的冗余爱好", desc: "你是去申请计算机项目，不是去参加电子竞技。游戏段位高并不能代表你的学术和项目能力。除非是跟专业强相关的特长。" },
  font: { checkId: 'font', title: "💀 致命的魔幻字体设计", desc: "教授的眼睛也是雪亮的！使用“Papyrus”这种非正式、魔幻风的字体写严肃的简历，是一种亵渎。务必使用 <b>Times New Roman / Arial / Garamond</b> 这种标准字体。字体大小要统一，行距要适中！" },

  // 隐藏彩蛋
  passive: { title: "❌ 被动式句式 (Learned)", desc: "在英文 CV 里，要用主动动词（如: Implemented, Optimized）。“Learned how to use”显得你的工作极其被动。这是个隐藏陷阱，注意甄别哦！" },
  order: { title: "❌ 时间顺序颠倒", desc: "CV 必须严格按照时间倒序 (Newest to Oldest) 排列经历。请把 2023 年的老经历移到下面去！" },
  score: { title: "❌ 主观打分技能", desc: "“精通（5星）”是你的主观判断，毫无标准。请使用“熟练掌握（Proficient）”或明确的项目描述来体现你的技能等级。" },
  hs: { title: "❌ 冗余的中学经历", desc: "除了 GPA 满分或国际大奖，申请研究生时请尽量把篇幅留给大学的经历。中学拿亚军这种老黄历就不要写了。" }
}

// 响应式数据
const completedBugs = ref([]) // 已完成的主线BUG
const totalBugs = 6 // 总主线任务数
const showSuccess = ref(false) // 成功弹窗显示状态

// 反馈框响应式数据
const feedback = ref({
  show: false,
  title: '',
  desc: ''
})

// 查找BUG核心函数
const findBug = (bugType) => {
  // 重复点击不触发
  if (completedBugs.value.includes(bugType)) return

  const bugData = bugDatabase[bugType]
  
  // 更新反馈框
  feedback.value = {
    show: true,
    title: bugData.title,
    desc: bugData.desc
  }

  // 如果是主线任务，加入已完成列表
  if (bugData.checkId) {
    completedBugs.value.push(bugData.checkId)
    
    // 自动触发字体任务（还原原游戏逻辑）
    if (completedBugs.value.length === 5 && !completedBugs.value.includes('font')) {
      setTimeout(() => {
        completedBugs.value.push('font')
        checkAllComplete()
      }, 500)
    }
    
    checkAllComplete()
  }
}

// 检查是否全部完成主线任务
const checkAllComplete = () => {
  if (completedBugs.value.length === totalBugs) {
    setTimeout(() => {
      showSuccess.value = true
    }, 800)
  }
}

// 关闭成功弹窗
const closeModal = () => {
  showSuccess.value = false
  alert("地图向导：诊断完成！你的 CV 已经去除了大部分炸锅杂质。接下来，我们要去【Y3-4故事拼接】节点，把这些正确的材料拼装成动人的 PS 故事！")
}
</script>

<style scoped>
/* 完全保留原样式，仅添加scoped作用域 */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: radial-gradient(circle at center, #2e1a10 0%, #0d0905 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  color: #e0d8ee;
}

.clinic-room {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 25px;
}

.header h2 {
  margin: 0;
  font-size: 2.5rem;
  color: #f9d976;
  text-shadow: 0 5px 15px rgba(249, 217, 118, 0.4);
  font-family: "Georgia", serif;
}

.header p {
  color: #a99bbd;
  font-size: 1.1rem;
  margin-top: 5px;
}

.workspace {
  display: flex;
  gap: 30px;
  width: 100%;
  align-items: flex-start;
}

/* 左侧：精美羊皮纸 CV */
.parchment-cv {
  background: linear-gradient(135deg, #fdf5e6, #ebd5ab);
  width: 60%;
  padding: 40px;
  border-radius: 5px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), inset 0 0 50px rgba(139, 69, 19, 0.2);
  color: #2c1e16;
  position: relative;
  cursor: crosshair;
  border: 2px solid #c8a165;
}

/* 文件名提示 */
.cv-filename {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: #82b1ff;
  padding: 2px 8px;
  border-radius: 4px;
}

/* CV 排版字体 */
.cv-body {
  font-family: "Papyrus", "Courier New", serif;
}

.cv-header {
  text-align: center;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.cv-header h1 {
  margin: 0;
  font-size: 1.8rem;
  text-transform: uppercase;
}

.cv-section {
  margin-bottom: 20px;
}

.cv-section h3 {
  font-size: 1.1rem;
  color: #5d4037;
  border-bottom: 1px dashed #a1887f;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.cv-item {
  margin-bottom: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.cv-bullet {
  list-style-type: square;
  margin-left: 18px;
  margin-top: 5px;
}

/* 找茬互动元素 */
.bug-text {
  cursor: pointer;
  position: relative;
  transition: 0.2s;
  border-bottom: 1px dotted rgba(200, 0, 0, 0.5);
}

.bug-text:hover {
  background: rgba(249, 217, 118, 0.6);
  border-radius: 3px;
}

/* 被选中的错误 */
.bug-text.fixed {
  color: #c0392b;
  text-decoration: line-through;
  border: none;
  background: rgba(231, 76, 60, 0.1);
  pointer-events: none;
}

.bug-text.fixed::after {
  content: 'REJECTED';
  position: absolute;
  top: -10px;
  right: -25px;
  color: #c0392b;
  font-weight: 900;
  font-size: 0.7rem;
  border: 2px solid #c0392b;
  padding: 2px 4px;
  border-radius: 4px;
  transform: rotate(-15deg);
  background: rgba(255, 255, 255, 0.8);
  z-index: 5;
}

/* 右侧：诊断面板 */
.diagnostic-panel {
  width: 40%;
  background: rgba(30, 20, 25, 0.85);
  border: 2px solid #8d6e63;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  position: sticky;
  top: 20px;
}

.panel-title {
  color: #f9d976;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 2px dashed #5d4037;
  padding-bottom: 10px;
}

/* 任务清单 */
.checklist {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.check-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a0aec0;
  transition: 0.3s;
  border: 1px solid #4e342e;
  font-size: 0.85rem;
}

.check-item i {
  font-size: 1.1rem;
  color: #5d4037;
}

.check-item.completed {
  background: rgba(72, 187, 120, 0.15);
  border-color: #2ecc71;
  color: #fff;
}

.check-item.completed i {
  color: #2ecc71;
}

.feedback-box {
  background: #2c1e16;
  border-left: 4px solid #f9d976;
  padding: 15px;
  border-radius: 4px;
  animation: fadeIn 0.3s ease;
}

.feedback-title {
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 5px;
  font-size: 1rem;
}

.feedback-desc {
  color: #d7ccc8;
  font-size: 0.9rem;
  line-height: 1.5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 成功弹窗 */
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-card {
  background: linear-gradient(135deg, #2e1a10, #3e2723);
  border: 3px solid #f9d976;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
}

.modal-card h2 {
  color: #2ecc71;
  margin-bottom: 15px;
}

.btn-claim {
  margin-top: 25px;
  background: #f9d976;
  color: #3e2723;
  border: none;
  padding: 12px 35px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-claim:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(249, 217, 118, 0.4);
}
</style>