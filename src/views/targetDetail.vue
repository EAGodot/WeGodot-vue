<template>
  <div class="task-detail-page">
    <div class="page-container" v-if="task">
      <div class="task-main">
        <div class="task-card">
          <div class="task-header">
            <h2>{{ task.title }}</h2>
            <el-tag :type="getStatusType(task.status)">{{ task.status_display }}</el-tag>
          </div>
          <div class="task-body">
            <div class="task-meta-row">
              <div class="meta-box">
                <div class="meta-label">任务金额</div>
                <div class="meta-value amount">¥{{ task.amount }}</div>
              </div>
              <div class="meta-box">
                <div class="meta-label">剩余余额</div>
                <div class="meta-value balance">¥{{ task.balance }}</div>
              </div>
              <div class="meta-box">
                <div class="meta-label">已完成人数</div>
                <div class="meta-value">{{ task.completed_count }} 人</div>
              </div>
            </div>
            <div class="task-description">
              <h4>任务描述</h4>
              <p>{{ task.description || '暂无描述' }}</p>
            </div>
            <div class="task-creator">
              <span>发布者：{{ task.creator_name }}</span>
              <span>发布时间：{{ formatDate(task.create_time) }}</span>
            </div>
          </div>
          <div class="task-actions" v-if="task.status === 0">
            <el-button type="primary" @click="joinTask" :disabled="hasJoined">参与任务</el-button>
            <el-button type="success" @click="showUploadDialog" :disabled="!hasJoined || hasUploadedProof">上传凭证</el-button>
          </div>
        </div>

        <div class="participants-card" v-if="isCreator">
          <h3>参与者列表</h3>
          <div v-if="participants.length === 0" class="empty">暂无参与者</div>
          <div v-for="item in participants" :key="item.id" class="participant-item">
            <div class="participant-info">
              <span class="username">{{ item.user_name || ('用户#' + item.user_id) }}</span>
              <el-tag size="small" :type="getParticipantStatusType(item.status_code)">{{ item.participant_status }}</el-tag>
            </div>
            <div class="participant-proof" v-if="item.proof">
              <el-image :src="item.proof" fit="cover" style="width: 80px; height: 80px; border-radius: 8px;"></el-image>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <el-button type="danger" @click="completeTask" :disabled="task.balance <= 0">完成任务，平分余额</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="上传凭证" :visible.sync="uploadDialogVisible" width="500px">
      <upload-picture
        :list-type="'picture'"
        :max-number="1"
        :max-size="5"
        @success="onProofUploadSuccess"
      ></upload-picture>
      <div slot="footer">
        <el-button @click="uploadDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import uploadPicture from '../views/common/uploadPicture.vue';

export default {
  name: 'TargetDetail',
  components: { uploadPicture },
  data() {
    return {
      taskId: null,
      task: null,
      participants: [],
      hasJoined: false,
      hasUploadedProof: false,
      isCreator: false,
      uploadDialogVisible: false,
      currentUser: {},
    };
  },
  created() {
    this.taskId = this.$route.query.taskId;
    this.currentUser = this.$store.state.currentUser || {};
    if (this.taskId) {
      this.loadTask();
      this.loadParticipants();
    }
  },
  methods: {
    loadTask() {
      this.$http
        .post(this.$constant.baseURL + '/task/detail/', { task_id: this.taskId })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0])) {
            const data = res.result[0];
            if (data.code === 200 && data.data) {
              this.task = data.data;
              this.isCreator = this.currentUser.id && this.currentUser.id === this.task.creator_id;
              this.checkJoinStatus();
            }
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
        });
    },
    loadParticipants() {
      if (!this.isCreator) return;
      this.$http
        .post(this.$constant.baseURL + '/task/detail/', { task_id: this.taskId })
        .then(() => {
          this.$http
            .post(this.$constant.baseURL + '/task/participants/', { task_id: this.taskId })
            .then((res) => {
              if (res.result && !this.$common.isEmpty(res.result[0])) {
                this.participants = res.result[0].data || [];
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    },
    checkJoinStatus() {
      if (!this.currentUser.id || !this.task) return;
      const joined = this.task.participants || [];
      this.hasJoined = joined.some((p) => p.user_id === this.currentUser.id);
    },
    joinTask() {
      if (!this.currentUser.id) {
        this.$notify({
          type: 'error',
          title: '请先登录',
          position: 'top-left',
          offset: 50,
        });
        return;
      }
      this.$http
        .post(this.$constant.baseURL + '/task/join/', {
          task_id: this.taskId,
          user_id: this.currentUser.id,
        })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0]) && res.result[0].code === 200) {
            this.$notify({
              type: 'success',
              title: '参与成功',
              message: '请上传凭证完成任务',
              position: 'top-left',
              offset: 50,
            });
            this.hasJoined = true;
          } else {
            this.$notify({
              type: 'error',
              title: '参与失败',
              message: (res.result && res.result[0] && res.result[0].message) || '未知错误',
              position: 'top-left',
              offset: 50,
            });
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '参与失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        });
    },
    showUploadDialog() {
      this.uploadDialogVisible = true;
    },
    onProofUploadSuccess(response) {
      const imageUrl = response && response.data ? response.data.url : '';
      if (!imageUrl) {
        this.$notify({
          type: 'error',
          title: '上传失败',
          position: 'top-left',
          offset: 50,
        });
        return;
      }
      this.$http
        .post(this.$constant.baseURL + '/task/uploadProof/', {
          task_id: this.taskId,
          user_id: this.currentUser.id,
          image: imageUrl,
        })
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0]) && res.result[0].code === 200) {
            this.$notify({
              type: 'success',
              title: '凭证上传成功',
              position: 'top-left',
              offset: 50,
            });
            this.hasUploadedProof = true;
            this.uploadDialogVisible = false;
          } else {
            this.$notify({
              type: 'error',
              title: '上传失败',
              message: (res.result && res.result[0] && res.result[0].message) || '未知错误',
              position: 'top-left',
              offset: 50,
            });
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '上传失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        });
    },
    completeTask() {
      this.$http
        .post(this.$constant.baseURL + '/task/complete/', {
          task_id: this.taskId,
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
            this.task.status = 1;
            this.task.balance = 0;
            this.loadTask();
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
    getStatusType(status) {
      const map = { 0: 'success', 1: 'info', 2: 'danger' };
      return map[status] || 'info';
    },
    getParticipantStatusType(statusCode) {
      const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' };
      return map[statusCode] || 'info';
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    },
  },
};
</script>

<style lang="scss" scoped>
.task-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  .page-container {
    display: flex;
    gap: 20px;
  }
  .task-main {
    flex: 1;
  }
  .task-card {
    background: var(--card-background);
    border-radius: 12px;
    padding: 24px;
    border: 1px solid var(--border-color);
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      h2 {
        margin: 0;
        color: var(--fontColor);
        font-size: 24px;
      }
    }
    .task-meta-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      .meta-box {
        flex: 1;
        background: var(--background);
        border-radius: 10px;
        padding: 16px;
        text-align: center;
        .meta-label {
          color: var(--text-muted);
          font-size: 13px;
          margin-bottom: 8px;
        }
        .meta-value {
          color: var(--fontColor);
          font-size: 20px;
          font-weight: bold;
          &.amount {
            color: var(--red);
          }
          &.balance {
            color: var(--green);
          }
        }
      }
    }
    .task-description {
      margin-bottom: 20px;
      h4 {
        margin: 0 0 10px;
        color: var(--fontColor);
      }
      p {
        color: var(--text-muted);
        line-height: 1.8;
        margin: 0;
        white-space: pre-wrap;
      }
    }
    .task-creator {
      display: flex;
      justify-content: space-between;
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 20px;
    }
    .task-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
  }
  .participants-card {
    margin-top: 20px;
    background: var(--card-background);
    border-radius: 12px;
    padding: 24px;
    border: 1px solid var(--border-color);
    h3 {
      margin: 0 0 16px;
      color: var(--fontColor);
    }
    .participant-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
      &:last-child {
        border-bottom: none;
      }
      .participant-info {
        display: flex;
        align-items: center;
        gap: 10px;
        .username {
          color: var(--fontColor);
          font-size: 14px;
        }
      }
    }
    .empty {
      text-align: center;
      color: var(--text-muted);
      padding: 20px;
    }
  }
}
</style>
