<template>
  <div class="quant-page">
    <div class="page-header">
      <h2>📈 量化交易</h2>
      <p>量化信号 · 策略跟踪 · 数据分析</p>
    </div>

    <div class="signal-container">
      <div class="signal-card">
        <div class="signal-header">
          <h3>信号看板</h3>
          <el-tag type="info" effect="dark">实时更新</el-tag>
        </div>
        <div class="signal-body">
          <div class="signal-image-wrapper">
            <img
              :src="signalImageUrl"
              class="signal-image"
              @error="handleImageError"
            />
          </div>
          <div class="signal-meta">
            <div class="meta-item">
              <i class="fa fa-clock-o"></i>
              <span>更新时间：{{ updateTime }}</span>
            </div>
            <div class="meta-item">
              <i class="fa fa-refresh"></i>
              <el-button type="primary" size="small" @click="loadSignalImage">刷新</el-button>
            </div>
          </div>

          <div class="log-container">
            <div class="log-header">
              <h4>📄 run_manage.log</h4>
              <el-button type="primary" size="small" @click="loadLogContent" :loading="logLoading">刷新日志</el-button>
            </div>
            <div class="log-body">
              <pre v-if="logContent" class="log-content">{{ logContent }}</pre>
              <div v-else-if="logLoading" class="log-loading">加载中...</div>
              <div v-else-if="logError" class="log-error">{{ logError }}</div>
              <div v-else class="log-empty">暂无日志内容</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Quant',
  data() {
    return {
      signalImageUrl: '',
      updateTime: '',
      logContent: '',
      logLoading: false,
      logError: null,
    };
  },
  created() {
    this.loadSignalImage();
    this.loadLogContent();
  },
  methods: {
    loadSignalImage() {
      const timestamp = Date.now();
      this.signalImageUrl = `${this.$constant.webURL}/media/signal_table.png?v=${timestamp}`;
      this.updateTime = new Date().toLocaleString('zh-CN');
    },
    handleImageError() {
      this.signalImageUrl = '';
      this.$notify({
        type: 'warning',
        title: '提示',
        message: '信号图片加载失败，请稍后重试',
        position: 'top-left',
        offset: 50,
      });
    },
    loadLogContent() {
      this.logLoading = true;
      this.logError = null;
      const timestamp = Date.now();
      fetch(`${this.$constant.baseURL}/api/quant/log/?v=${timestamp}`)
        .then(res => res.json())
        .then(data => {
          this.logLoading = false;
          if (data.success) {
            this.logContent = data.data.content || '暂无日志内容';
            this.logLastModified = data.data.last_modified || '';
          } else {
            this.logError = data.error || '加载日志失败';
            this.logContent = data.data?.content || this.logError;
          }
        })
        .catch(err => {
          this.logLoading = false;
          this.logError = '请求日志失败';
          this.logContent = '加载日志失败，请稍后重试';
          console.error('加载日志失败:', err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.quant-page {
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
.signal-container {
  display: flex;
  justify-content: center;
}
.signal-card {
  width: 100%;
  max-width: 900px;
  background: var(--card-background);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
  .signal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h3 {
      margin: 0;
      color: var(--fontColor);
      font-size: 20px;
    }
  }
  .signal-body {
    .signal-image-wrapper {
      width: 100%;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      background: var(--background);
      .signal-image {
        width: 100%;
        height: auto;
        display: block;
      }
    }
    .signal-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      color: var(--text-muted);
      font-size: 13px;
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        i {
          color: var(--orange);
        }
      }
    }
    .log-container {
      margin-top: 24px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      background: var(--background);
      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--card-background);
        border-bottom: 1px solid var(--border-color);
        h4 {
          margin: 0;
          color: var(--fontColor);
          font-size: 16px;
        }
      }
      .log-body {
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
        .log-content {
          margin: 0;
          padding: 12px;
          background: #1e1e1e;
          color: #d4d4d4;
          border-radius: 8px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-all;
          overflow-x: auto;
        }
        .log-loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }
        .log-error {
          text-align: center;
          padding: 40px;
          color: #dc3545;
        }
        .log-empty {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }
      }
    }
  }
}
</style>
