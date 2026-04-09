<template>
  <GameLevelScaffold
    title="简历诊疗室 / CV Surgery"
    subtitle="点击简历里的问题点，不只是找错，而是理解一份 CV 应该怎样快速证明你的申请价值。/ Diagnose the CV by identifying issues and learning the underlying logic."
    :guide="guide"
    tone="amber"
    :tags="['CV 诊断 / CV diagnosis', '证据表达 / Evidence writing']"
    status-label="核心问题修复 / Core Bugs Fixed"
    :status-text="`${coreFixedCount} / ${coreBugs.length}`"
  >
    <section class="workspace">
      <article class="cv-paper">
        <div class="cv-filename bug-text" :class="{ fixed: isFixed('filename') }" @click="findBug('filename')">
          📄 Resume_Final_Actually_Final_v3.pdf
        </div>

        <div class="cv-body">
          <div class="cv-header">
            <h2 class="bug-text inline" :class="{ fixed: isFixed('font') }" @click="findBug('font')">Zhang San</h2>
            <p>
              Email:
              <span class="bug-text" :class="{ fixed: isFixed('email') }" @click="findBug('email')">dark_dragon_99@qq.com</span>
              | Tel: +86-138xxxx
            </p>
          </div>

          <section class="cv-section">
            <h3>Education</h3>
            <p>
              <strong>XX University</strong> | B.S. in Computer Science
              <span class="right">2023 - 2027</span>
            </p>
            <p>
              GPA:
              <span class="bug-text" :class="{ fixed: isFixed('gpa') }" @click="findBug('gpa')">Top 3 in class, excellent grades</span>
            </p>
            <p class="small bug-text" :class="{ fixed: isFixed('hs') }" @click="findBug('hs')">Runner-up in XX Middle School Ping-Pong Tournament</p>
          </section>

          <section class="cv-section">
            <h3>Experience</h3>
            <p><strong>Research Intern</strong> | Magical Lab <span class="right">Summer 2025</span></p>
            <ul>
              <li class="bug-text" :class="{ fixed: isFixed('vague') }" @click="findBug('vague')">Assisted the mentor with data analysis, fixed some bugs, was praised, and learned a lot.</li>
              <li class="bug-text" :class="{ fixed: isFixed('passive') }" @click="findBug('passive')">Learned how to use Python and scikit-learn for modeling.</li>
            </ul>
            <p class="bug-text" :class="{ fixed: isFixed('order') }" @click="findBug('order')"><strong>Voluntary Work</strong> | 2023 - 2024 (Older Experience)</p>
          </section>

          <section class="cv-section">
            <h3>Additional</h3>
            <ul>
              <li>Python: <span class="bug-text" :class="{ fixed: isFixed('score') }" @click="findBug('score')">⭐⭐⭐⭐⭐ (Master)</span></li>
              <li class="bug-text" :class="{ fixed: isFixed('hobby') }" @click="findBug('hobby')">Hobbies: Master tier in League of Legends, excellent team shotcaller.</li>
            </ul>
          </section>
        </div>
      </article>

      <aside class="diagnostic-panel">
        <h2>Core Surgery Checklist</h2>
        <ul class="checklist">
          <li v-for="bug in coreBugs" :key="bug.id" :class="{ completed: isFixed(bug.id) }">
            <i class="fas" :class="isFixed(bug.id) ? 'fa-check-square' : 'fa-square'"></i>
            <span>{{ bug.label }}</span>
          </li>
        </ul>

        <div v-if="feedback" class="feedback-box">
          <strong>{{ feedback.title }}</strong>
          <p>{{ feedback.desc }}</p>
        </div>
      </aside>
    </section>

    <LevelResultDialog
      v-model="showSuccess"
      tone="success"
      icon="📜"
      title="诊疗完成 / Diagnosis Complete"
      description="你已经清掉了最关键的简历硬伤。真正的简历不是把经历全塞进去，而是用规范格式、量化结果和相关证据快速建立可信度。"
      primary-text="保存诊疗结果 / Save CV Takeaway"
      secondary-text="继续查看 / Keep Reviewing"
      @secondary="showSuccess = false"
      @primary="completeLevel"
    />
  </GameLevelScaffold>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import LevelResultDialog from '@/components/LevelResultDialog.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y3', 3)

const bugDatabase = {
  filename: { title: 'Chaotic Filename / 文件名混乱', desc: '导师和招生官会同时处理大量文件，混乱命名会直接降低专业感。更好的格式是 Name_Program_CV.pdf。' },
  email: { title: 'Unprofessional Email / 邮箱不专业', desc: '学术申请非常看重基本礼仪。过于中二或随意的邮箱，会让人下意识怀疑你的正式度。' },
  gpa: { title: 'Vague GPA / 成绩表述太模糊', desc: '简历需要硬数据。请写具体 GPA 数值和分制，而不是“成绩很好”这种主观判断。' },
  vague: { title: 'No evidence / 空话没有证据', desc: '“做了一些分析、学到了很多”没有说服力。更好的写法是技术 + 动作 + 结果。' },
  hobby: { title: 'Irrelevant hobbies / 无关爱好', desc: '除非和申请方向强相关，否则无关爱好会挤占真正有价值的证据空间。' },
  font: { title: 'Unprofessional typography / 排版字体不专业', desc: '不正式的字体和混乱排版会破坏第一印象。CV 首先要做到可读、统一、可信。' },
  passive: { title: 'Passive verbs / 动词太被动', desc: 'CV 更适合用 Implemented、Optimized、Led 等主动动词，强调你做了什么。' },
  order: { title: 'Wrong order / 顺序不对', desc: '简历通常遵循倒序时间线，让最近、最 relevant 的内容先出现。' },
  score: { title: 'Self-rated skill / 自评分技能', desc: '“五星精通”很主观。更好的方式是用项目或结果来证明熟练度。' },
  hs: { title: 'Old irrelevant history / 过旧无关经历', desc: '除非是非常顶级的奖项，否则中学经历通常应该给大学阶段的内容让位。' },
}

const coreBugs = [
  { id: 'filename', label: 'Chaotic Filename / 文件名混乱' },
  { id: 'email', label: 'Unprofessional Email / 不专业邮箱' },
  { id: 'gpa', label: 'Vague GPA / 模糊成绩' },
  { id: 'vague', label: 'No quantified evidence / 空话无数据' },
  { id: 'hobby', label: 'Irrelevant hobbies / 无关爱好' },
  { id: 'font', label: 'Unprofessional typography / 字体排版不专业' },
]

const fixed = reactive({})
const feedback = ref(null)
const showSuccess = ref(false)

const coreFixedCount = computed(() => coreBugs.filter((bug) => fixed[bug.id]).length)

function isFixed(id) {
  return Boolean(fixed[id])
}

function findBug(id) {
  if (fixed[id]) return
  fixed[id] = true
  feedback.value = bugDatabase[id]

  if (coreFixedCount.value === coreBugs.length) {
    showSuccess.value = true
  }
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: '好简历不是堆砌经历，而是用规范格式、量化结果和相关证据快速证明价值。/ A strong CV is not a dump of experiences, but a concise proof document.',
    },
  })
}
</script>

<style scoped>
.workspace {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  align-items: start;
}

.cv-paper,
.diagnostic-panel {
  border-radius: 24px;
  overflow: hidden;
}

.cv-paper {
  background: linear-gradient(135deg, #fdf5e6, #ebd5ab);
  padding: 26px;
  color: #2c1e16;
  position: relative;
}

.cv-filename {
  display: inline-block;
  margin-bottom: 18px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #82b1ff;
  font-family: monospace;
}

.cv-body {
  font-family: Papyrus, "Courier New", serif;
}

.cv-header {
  text-align: center;
  border-bottom: 2px solid #5d4037;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.cv-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.cv-section {
  margin-bottom: 20px;
}

.cv-section h3 {
  margin: 0 0 10px;
  color: #5d4037;
  font-family: Georgia, serif;
}

.cv-section ul {
  margin: 8px 0 0 18px;
  display: grid;
  gap: 8px;
}

.right {
  float: right;
}

.small {
  font-size: 0.85rem;
}

.bug-text {
  cursor: pointer;
  border-bottom: 1px dotted rgba(200, 0, 0, 0.6);
}

.bug-text.inline {
  display: inline-block;
}

.bug-text.fixed {
  text-decoration: line-through;
  color: #c0392b;
  border-bottom: none;
  background: rgba(231, 76, 60, 0.12);
}

.diagnostic-panel {
  padding: 22px;
  background: rgba(30, 20, 25, 0.88);
  border: 1px solid rgba(141, 110, 99, 0.32);
  color: #f8fafc;
}

.diagnostic-panel h2 {
  margin: 0 0 16px;
  color: #f9d976;
  font-family: Georgia, serif;
}

.checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.checklist li {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.24);
  color: #a0aec0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.checklist li.completed {
  color: #fff;
  border: 1px solid rgba(46, 204, 113, 0.35);
  background: rgba(46, 204, 113, 0.14);
}

.feedback-box {
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  background: #2c1e16;
  border-left: 4px solid #f9d976;
}

.feedback-box strong {
  color: #f9d976;
}

.feedback-box p {
  margin: 8px 0 0;
  line-height: 1.7;
  color: #f3e8e2;
}

@media (max-width: 920px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
