<template>
  <div class="game-screen">
    <!-- 顶部状态栏：好感度 -->
    <div class="status-bar">
      <div><i class="fas fa-paw" style="color:#f5b342;"></i> 导师好感度</div>
      <div class="hearts">{{ currentNode.hearts }}</div>
    </div>

    <!-- 角色展示区：动态表情 + 动画 -->
    <div class="character-stage">
      <div 
        class="cat-avatar"
        :class="{
          'angry-shake': currentNode.mood === 'angry',
          'happy-bounce': currentNode.mood === 'happy'
        }"
      >
        {{ currentNode.emoji }}
      </div>
    </div>

    <!-- 对话框 -->
    <div class="dialogue-box">
      <div class="speaker-name">Professor Wildcat (Prof. 猫)</div>
      <!-- 渲染带HTML格式的剧情文本 -->
      <div class="text-content" v-html="currentNode.text"></div>
      <!-- 选项按钮区：循环渲染 -->
      <div class="choices-area">
        <button 
          class="choice-btn"
          v-for="choice in currentNode.choices"
          :key="choice.nextId"
          @click="renderNode(choice.nextId)"
        >
          {{ choice.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 核心剧情树（完全保留原逻辑，无修改）
const storyTree = {
  start: {
    text: "（你在办公室门口探头）<br>😼 喵？又是一个申请季的。找我有什么事？快说，我很忙的。",
    emoji: "😼",
    mood: "normal",
    hearts: "❤️❤️🤍🤍🤍",
    choices: [
      { text: "老师！我想让您帮我写封推荐信！（直奔主题，略显突兀）", nextId: "bad_start" },
      { text: "Prof. 猫您好，我是上过您《高阶毛线球抓取》的XXX，今天想向您咨询一下申请推荐信的事宜。", nextId: "good_start" }
    ]
  },
  bad_start: {
    text: "😾 喵嗷！一上来就下指令？连个自我介绍都没有，我教过那么多学生，我哪记得你是哪只老鼠！",
    emoji: "😾",
    mood: "angry",
    hearts: "❤️🤍🤍🤍🤍",
    choices: [
      { text: "啊抱歉抱歉！我是上学期坐第一排的那个...", nextId: "recover_start" },
      { text: "哎呀老师您别生气嘛，就随便帮我写两句就行了。", nextId: "game_over_rude" }
    ]
  },
  game_over_rude: {
    text: "💢 随便写两句？我的学术声誉是用来给你随便写的吗？出去！把门带上！<br><span style='color:#e74c3c'>【Game Over：导师彻底炸毛，你失去了这封推荐信】</span>",
    emoji: "🙀",
    mood: "angry",
    hearts: "🖤🖤🖤🖤🖤",
    choices: [
      { text: "🔄 读档重来：去学会基本的邮件礼仪", nextId: "start" }
    ]
  },
  recover_start: {
    text: "😼 哼，勉强有点印象。说吧，要申请哪里的项目？截止日期是什么时候？",
    emoji: "😼",
    mood: "normal",
    hearts: "❤️❤️🤍🤍🤍",
    choices: [
      { text: "呃... 具体学校还没定，反正您先帮我写一封备着吧。", nextId: "game_over_vague" },
      { text: "我想申请下个月底截止的XX大学CS项目，时间还算充裕。", nextId: "good_timing" }
    ]
  },
  good_start: {
    text: "😸 哦，是那个期末拿了 A 的小家伙啊。咕噜咕噜... 行吧，你想申请什么项目？什么时候要？",
    emoji: "😸",
    mood: "happy",
    hearts: "❤️❤️❤️🤍🤍",
    choices: [
      { text: "明天晚上网申就截止了！求老师救命！", nextId: "game_over_rush" },
      { text: "是下个月底截止的XX大学项目，我提前一个月来询问您的意向。", nextId: "good_timing" }
    ]
  },
  game_over_rush: {
    text: "😾 喵嗷！！明天截止你今天来找我？！你当我是自动打字机吗！我很忙的，不接急单！<br><span style='color:#e74c3c'>【Game Over：高风险操作！不要极限压榨教授的 DDL】</span>",
    emoji: "😾",
    mood: "angry",
    hearts: "🖤🖤🖤🖤🖤",
    choices: [{ text: "🔄 读档重来：牢记至少提前一个月联系教授", nextId: "start" }]
  },
  game_over_vague: {
    text: "😾 目标都没定，写给谁看？不同学校看重的特质完全不同。想清楚了再来找我！<br><span style='color:#e74c3c'>【Game Over：缺乏规划。推荐信需要针对具体项目】</span>",
    emoji: "😾",
    mood: "angry",
    hearts: "❤️🤍🤍🤍🤍",
    choices: [{ text: "🔄 读档重来：自己先做好功课", nextId: "start" }]
  },
  good_timing: {
    text: "😼 提前一个月，算你懂规矩。但我这学期很忙，你有什么材料能帮我快速回忆起你的亮点吗？",
    emoji: "😼",
    mood: "normal",
    hearts: "❤️❤️❤️🤍🤍",
    choices: [
      { text: "呃... 我的期末成绩单算吗？剩下的您凭印象自由发挥就好。", nextId: "game_over_lazy" },
      { text: "有的！我准备了【申请包裹】：包含我的最新CV、成绩单、我想申请的项目列表，以及我在您课上的大作业亮点总结。", nextId: "perfect_ending" }
    ]
  },
  game_over_lazy: {
    text: "😾 让我凭印象自由发挥？那我就写“该生除了上课没打呼噜外，毫无存在感”。连自己的材料都不整理，是在浪费我的时间！<br><span style='color:#e74c3c'>【Game Over：教授没有义务帮你回忆你的优秀，请准备好素材包】</span>",
    emoji: "😾",
    mood: "angry",
    hearts: "🤍🤍🤍🤍🤍",
    choices: [{ text: "🔄 读档重来：整理好信息包再敲门", nextId: "start" }]
  },
  perfect_ending: {
    text: "😻 咕噜咕噜咕噜... 材料居然这么整齐？连亮点总结都列好了。这封信写起来最多只花我十分钟。<br>行了，交给我吧，祝你申请顺利！<br><span style='color:#2ecc71'>【通关！你成功顺毛了傲娇小野猫，掌握了索要推荐信的完美模板！】</span>",
    emoji: "😻",
    mood: "happy",
    hearts: "❤️❤️❤️❤️❤️",
    choices: [
      { text: "🎁 领取通关奖励 (+50 金币) 并返回地图", nextId: "exit" }
    ]
  }
}

// 响应式状态：当前剧情节点ID
const currentNodeId = ref('start')

// 计算属性：自动获取当前节点数据（响应式驱动）
const currentNode = computed(() => {
  return storyTree[currentNodeId.value]
})

// 渲染节点核心方法（替代原生DOM操作）
const renderNode = (nodeId) => {
  if (nodeId === 'exit') {
    alert("已返回地图界面！(此处在总系统中将触发解锁下一关代码)")
    return
  }
  // 仅更新节点ID，Vue自动渲染所有内容
  currentNodeId.value = nodeId
}
</script>

<style>
/* 完全保留原CSS样式、动画、配色，无任何修改 */
* { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
body { 
    background: #2b2b2b; display: flex; justify-content: center; 
    align-items: center; min-height: 100vh; margin: 0; padding: 20px;
}

.game-screen {
    background: linear-gradient(to bottom, #4a6984, #2a3b4c);
    width: 100%; max-width: 800px; height: 600px;
    border-radius: 20px; border: 4px solid #f5b342;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
}

.status-bar {
    background: rgba(0,0,0,0.4); padding: 15px 20px;
    display: flex; justify-content: space-between; align-items: center;
    color: #fff; font-weight: bold; font-size: 1.2rem;
    border-bottom: 2px dashed rgba(255,255,255,0.2); z-index: 10;
}
.hearts { color: #e74c3c; letter-spacing: 5px; transition: 0.3s; }

.character-stage {
    flex: 1; display: flex; justify-content: center; align-items: center;
    position: relative;
}

.cat-avatar {
    font-size: 10rem; filter: drop-shadow(0 15px 15px rgba(0,0,0,0.4));
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-origin: bottom center;
}
.angry-shake { animation: shake 0.5s infinite; filter: drop-shadow(0 0 20px red); }
@keyframes shake { 0% { transform: translateX(0) scale(1.1); } 25% { transform: translateX(-10px) rotate(-5deg) scale(1.1); } 50% { transform: translateX(10px) rotate(5deg) scale(1.1); } 100% { transform: translateX(0) scale(1.1); } }
.happy-bounce { animation: bounce 2s infinite ease-in-out; filter: drop-shadow(0 0 20px #f1c40f); }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

.dialogue-box {
    background: rgba(20, 20, 20, 0.85); border-top: 3px solid #f5b342;
    height: 250px; display: flex; flex-direction: column; z-index: 10;
}

.speaker-name {
    background: #f5b342; color: #1e1e1e; font-weight: 900;
    padding: 5px 20px; border-radius: 0 15px 15px 0;
    display: inline-block; align-self: flex-start; margin-top: -15px;
    box-shadow: 2px 2px 0 #d48b2c; font-size: 1.1rem;
}

.text-content {
    color: #fff; padding: 20px 30px; font-size: 1.2rem; line-height: 1.6;
    flex: 1; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.choices-area {
    display: flex; flex-direction: column; gap: 10px;
    padding: 0 20px 20px 20px;
}

.choice-btn {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3);
    color: #fff; padding: 12px; border-radius: 8px; text-align: left;
    font-size: 1rem; cursor: pointer; transition: 0.2s;
    display: flex; align-items: center;
}
.choice-btn::before { content: '▶'; margin-right: 10px; color: #f5b342; opacity: 0; transition: 0.2s; }
.choice-btn:hover { background: rgba(245, 179, 66, 0.2); border-color: #f5b342; transform: translateX(5px); }
.choice-btn:hover::before { opacity: 1; }
</style>