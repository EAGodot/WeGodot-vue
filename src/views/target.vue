<template>
  <div class="target-page">
    <div class="page-header">
      <h2>🎯 Target 任务中心</h2>
      <p>完成任务，平分奖金</p>
    </div>

    <div class="toolbar">
      <el-input
        v-model="searchKey"
        placeholder="搜索任务..."
        prefix-icon="el-icon-search"
        clearable
        style="width: 300px; margin-right: 10px"
        @keyup.enter.native="searchTask"
      ></el-input>
      <el-button type="primary" @click="searchTask">搜索</el-button>
      <el-button type="success" icon="el-icon-plus" @click="$router.push({ path: '/targetCreate' })" v-if="canCreateTask">发布任务</el-button>
      <el-button type="warning" icon="el-icon-document" @click="$router.push({ path: '/myTasks' })">我的任务</el-button>
    </div>

    <div class="task-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="tasks.length === 0" class="empty-state">暂无任务</div>
      <div
        v-for="task in tasks"
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
            <div class="meta-item">
              <i class="fa fa-user"></i>
              <span>发布者: {{ task.creator_name }}</span>
            </div>
          </div>
        </div>
        <div class="task-footer">
          <el-button type="primary" size="small" @click.stop="goToDetail(task.id)">查看详情</el-button>
        </div>
      </div>
    </div>

    <div class="pagination-wrap" v-if="total > 0">
      <el-pagination
        @current-change="handlePageChange"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Target',
  data() {
    return {
      loading: false,
      tasks: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchKey: '',
    };
  },
  computed: {
    canCreateTask() {
      const user = this.$store.state.currentUser;
      return user && user.id;
    },
  },
  created() {
    this.loadTasks();
  },
  methods: {
    loadTasks() {
      this.loading = true;
      const params = {
        current: this.currentPage,
        size: this.pageSize,
        searchKey: this.searchKey,
        status: 0,
      };
      this.$http
        .post(this.$constant.baseURL + '/task/list/', params)
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0])) {
            this.tasks = res.result[0].data || [];
            this.total = res.result[0].total || 0;
          } else {
            this.tasks = [];
            this.total = 0;
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
          this.loading = false;
        });
    },
    searchTask() {
      this.currentPage = 1;
      this.loadTasks();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.loadTasks();
    },
    goToDetail(taskId) {
      this.$router.push({ path: '/targetDetail', query: { taskId } });
    },
    getStatusType(status) {
      const map = { 0: 'success', 1: 'info', 2: 'danger' };
      return map[status] || 'info';
    },
  },
};
</script>

<style lang="scss" scoped>
.target-page {
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
.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}
.task-card {
  background: var(--card-background);
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
