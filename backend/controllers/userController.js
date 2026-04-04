// 模拟数据存储（后续接入数据库）
let mockUserData = {
  'default': {
    y2: { coins: 60, currentNode: 1, nodes: { 1: 'unlocked', 2: 'locked', 3: 'locked', 4: 'locked', 5: 'locked', 6: 'locked', 7: 'locked' } },
    y3: { coins: 80, currentNode: 1, nodes: { 1: 'unlocked', 2: 'locked', 3: 'locked', 4: 'locked', 5: 'locked', 6: 'locked', 7: 'locked', 8: 'locked' } },
    redeemedPrizes: [],
    sandboxItems: []
  }
};

export const getUserData = (req, res) => {
  const userId = req.params.userId;
  const data = mockUserData[userId] || mockUserData['default'];
  res.json({ success: true, data });
};

export const updateUserProgress = (req, res) => {
  const { userId } = req.params;
  const { year, nodeId, action, rewardCoins } = req.body;
  // 业务逻辑：更新节点状态、增加金币
  res.json({ success: true });
};

export const syncGameState = (req, res) => {
  const { userId } = req.params;
  const { type, payload } = req.body;
  // 处理兑换、沙盘等同步
  res.json({ success: true });
};