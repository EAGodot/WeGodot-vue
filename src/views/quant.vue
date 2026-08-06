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
    };
  },
  created() {
    this.loadSignalImage();
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
  }
}
</style>
