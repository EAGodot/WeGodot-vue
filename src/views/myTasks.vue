<template>
  <div class="my-tasks-page">
    <div class="page-header">
      <h2>📋 我的任务</h2>
      <p>管理你发布和参与的任务</p>
    </div>

    <div class="tabs-wrap">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="我发布的" name="published">
          <div class="task-list">
            <div v-if="publishedLoading" class="loading">加载中...</div>
            <div v-else-if="publishedTasks.length === 0" class="empty-state">暂无发布的任务</div>
            <div
              v-for="task in publishedTasks"
              :key="task.id"
              class="task-card"
              @click="goToDetail(task.id)"
            >
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <el-tag :type="getStatusType(task.status)">{{ task.status_display }}</el-tag>
              </div>
              <div class="task-body">
                <p class="task-desc">{{ task.description }}</p>
                <div class="task-meta">
                  <div class="meta-item">
                    <i class="fa fa-money"></i>
                    <span class="amount">¥{{ task.amount }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fa fa-balance-scale"></i>
                    <span>剩余: ¥{{ task.balance }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fa fa-users"></i>
                    <span>完成: {{ task.completed_count }}人</span>
                  </div>
                </div>
              </div>
              <div class="task-footer">
                <el-button type="primary" size="small" @click.stop="goToDetail(task.id)">查看详情</el-button>
                <el-button v-if="isTaskCreator(task)" type="success" size="small" @click.stop="completeTask(task)" :disabled="task.status !== 0 || task.balance <= 0">完成任务</el-button>
                <el-button v-if="isTaskCreator(task)" type="warning" size="small" @click.stop="showEditAmountDialog(task)">修改金额</el-button>
                <el-button v-if="isTaskCreator(task)" type="danger" size="small" @click.stop="showDeleteDialog(task)">删除任务</el-button>
              </div>
            </div>
          </div>
          <div class="pagination-wrap" v-if="publishedTotal > 0">
            <el-pagination
              @current-change="handlePublishedPageChange"
              :current-page="publishedPage"
              :page-size="pageSize"
              layout="prev, pager, next"
              :total="publishedTotal">
            </el-pagination>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我参与的" name="joined">
          <div class="task-list">
            <div v-if="joinedLoading" class="loading">加载中...</div>
            <div v-else-if="joinedTasks.length === 0" class="empty-state">暂无参与的任务</div>
            <div
              v-for="task in joinedTasks"
              :key="task.id"
              class="task-card"
              @click="goToDetail(task.id)"
            >
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <el-tag :type="getStatusType(task.status)">{{ task.status_display }}</el-tag>
              </div>
              <div class="task-body">
                <p class="task-desc">{{ task.description }}</p>
                <div class="task-meta">
                  <div class="meta-item">
                    <i class="fa fa-money"></i>
                    <span class="amount">¥{{ task.amount }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fa fa-balance-scale"></i>
                    <span>剩余: ¥{{ task.balance }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fa fa-users"></i>
                    <span>完成: {{ task.completed_count }}人</span>
                  </div>
                </div>
                <div class="participant-status" v-if="task.participant_status">
                  <el-tag :type="getParticipantStatusType(task.participant_status_code)" size="small">
                    我的状态：{{ task.participant_status }}
                  </el-tag>
                </div>
              </div>
              <div class="task-footer">
                <el-button type="primary" size="small" @click.stop="goToDetail(task.id)">查看详情</el-button>
              </div>
            </div>
          </div>
          <div class="pagination-wrap" v-if="joinedTotal > 0">
            <el-pagination
              @current-change="handleJoinedPageChange"
              :current-page="joinedPage"
              :page-size="pageSize"
              layout="prev, pager, next"
              :total="joinedTotal">
            </el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="确认删除" :visible.sync="deleteDialogVisible" width="400px">
      <p>确定要删除这个任务吗？此操作不可撤销。</p>
      <div slot="footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">删除</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改金额" :visible.sync="editAmountDialogVisible" width="400px">
      <div>
        <p>请输入新的任务金额：</p>
        <el-input v-model="editAmountValue" placeholder="请输入金额" type="number" step="0.01" min="0"></el-input>
      </div>
      <div slot="footer">
        <el-button @click="editAmountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditAmount">确认修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyTasks',
  data() {
    return {
      activeTab: 'published',
      publishedLoading: false,
      publishedTasks: [],
      publishedPage: 1,
      joinedLoading: false,
      joinedTasks: [],
      joinedPage: 1,
      pageSize: 10,
      publishedTotal: 0,
      joinedTotal: 0,
      deleteDialogVisible: false,
      deleteTaskId: null,
      editAmountDialogVisible: false,
      editAmountTaskId: null,
      editAmountValue: '',
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser || {};
    },
  },
  created() {
    this.loadPublishedTasks();
    this.loadJoinedTasks();
  },
  methods: {
    loadPublishedTasks() {
      this.publishedLoading = true;
      const user = this.$store.state.currentUser;
      if (!user || !user.id) {
        this.publishedLoading = false;
        return;
      }
      this.$http
        .post(this.$constant.baseURL + '/task/creator/', {
          user_id: user.id,
          current: this.publishedPage,
          size: this.pageSize,
        })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0])) {
            this.publishedTasks = res.result[0].data || [];
            this.publishedTotal = res.result[0].total || 0;
          } else {
            this.publishedTasks = [];
            this.publishedTotal = 0;
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '加载失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        })
        .finally(() => {
          this.publishedLoading = false;
        });
    },
    loadJoinedTasks() {
      this.joinedLoading = true;
      const user = this.$store.state.currentUser;
      if (!user || !user.id) {
        this.joinedLoading = false;
        return;
      }
      this.$http
        .post(this.$constant.baseURL + '/task/my/', {
          user_id: user.id,
          current: this.joinedPage,
          size: this.pageSize,
        })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0])) {
            this.joinedTasks = res.result[0].data || [];
            this.joinedTotal = res.result[0].total || 0;
          } else {
            this.joinedTasks = [];
            this.joinedTotal = 0;
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '加载失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        })
        .finally(() => {
          this.joinedLoading = false;
        });
    },
    handleTabClick(tab) {
      if (tab.name === 'published') {
        this.loadPublishedTasks();
      } else {
        this.loadJoinedTasks();
      }
    },
    handlePublishedPageChange(page) {
      this.publishedPage = page;
      this.loadPublishedTasks();
    },
    handleJoinedPageChange(page) {
      this.joinedPage = page;
      this.loadJoinedTasks();
    },
    goToDetail(taskId) {
      this.$router.push({ path: '/targetDetail', query: { taskId } });
    },
    getStatusType(status) {
      const map = { 0: 'success', 1: 'info', 2: 'danger' };
      return map[status] || 'info';
    },
    getParticipantStatusType(statusCode) {
      const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' };
      return map[statusCode] || 'info';
    },
    isTaskCreator(task) {
      return this.currentUser && this.currentUser.id && task.creator_user_id === this.currentUser.id;
    },
    completeTask(task) {
      this.$http
        .post(this.$constant.baseURL + '/task/complete/', {
          task_id: task.id,
          user_id: this.currentUser.id,
        })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0]) && res.result[0].code === 200) {
            const data = res.result[0].data || {};
            this.$notify({
              type: 'success',
              title: '任务已完成',
              message: `共${data.total_participants}人，每人奖励 ¥${data.reward_per_person || 0}`,
              position: 'top-left',
              offset: 50,
              duration: 4000,
            });
            this.loadPublishedTasks();
          } else {
            this.$notify({
              type: 'error',
              title: '操作失败',
              message: (res.result && res.result[0] && res.result[0].message) || '未知错误',
              position: 'top-left',
              offset: 50,
            });
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        });
    },
    showDeleteDialog(task) {
      this.deleteTaskId = task.id;
      this.deleteDialogVisible = true;
    },
    confirmDelete() {
      if (!this.deleteTaskId) return;
      this.$http
        .post(this.$constant.baseURL + '/task/delete/', {
          task_id: this.deleteTaskId,
          user_id: this.currentUser.id,
        })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0]) && res.result[0].code === 200) {
            this.$notify({
              type: 'success',
              title: '删除成功',
              position: 'top-left',
              offset: 50,
            });
            this.loadPublishedTasks();
          } else {
            this.$notify({
              type: 'error',
              title: '删除失败',
              message: (res.result && res.result[0] && res.result[0].message) || '未知错误',
              position: 'top-left',
              offset: 50,
            });
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '删除失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        })
        .finally(() => {
          this.deleteDialogVisible = false;
          this.deleteTaskId = null;
        });
    },
    showEditAmountDialog(task) {
      this.editAmountTaskId = task.id;
      this.editAmountValue = String(task.amount);
      this.editAmountDialogVisible = true;
    },
    confirmEditAmount() {
      if (!this.editAmountTaskId || this.editAmountValue === '') return;
      this.$http
        .post(this.$constant.baseURL + '/task/updateAmount/', {
          task_id: this.editAmountTaskId,
          user_id: this.currentUser.id,
          amount: this.editAmountValue,
        })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0]) && res.result[0].code === 200) {
            this.$notify({
              type: 'success',
              title: '修改成功',
              position: 'top-left',
              offset: 50,
            });
            this.loadPublishedTasks();
          } else {
            this.$notify({
              type: 'error',
              title: '修改失败',
              message: (res.result && res.result[0] && res.result[0].message) || '未知错误',
              position: 'top-left',
              offset: 50,
            });
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '修改失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        })
        .finally(() => {
          this.editAmountDialogVisible = false;
          this.editAmountTaskId = null;
          this.editAmountValue = '';
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.my-tasks-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.page-header {
  text-align: center;
  margin-bottom: 40px;
  h2 {
    color: var(--fontColor);
    margin: 0 0 10px;
    font-size: 32px;
  }
  p {
    color: var(--text-muted);
    margin: 0;
    font-size: 16px;
  }
}
.tabs-wrap {
  background: var(--card-background);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}
.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.task-card {
  background: var(--background);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: var(--blue);
  }
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .task-title {
      color: var(--fontColor);
      font-size: 18px;
      margin: 0;
      font-weight: 600;
    }
  }
  .task-body {
    .task-desc {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .task-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
        font-size: 13px;
        i {
          color: var(--orange);
        }
        .amount {
          color: var(--red);
          font-weight: bold;
          font-size: 16px;
        }
      }
    }
    .participant-status {
      margin-top: 12px;
    }
  }
  .task-footer {
    margin-top: 16px;
    text-align: right;
  }
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  grid-column: 1 / -1;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  grid-column: 1 / -1;
}
</style>
