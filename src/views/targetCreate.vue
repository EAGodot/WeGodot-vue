<template>
  <div class="target-create-page">
    <div class="create-container">
      <div class="create-header">
        <button class="btn-back" @click="handleBack">
          <i class="el-icon-arrow-left"></i> 返回
        </button>
        <h1 class="create-title">发布目标任务</h1>
        <div class="header-actions">
          <el-button @click="handleBack">取消</el-button>
          <el-button type="primary" :disabled="!isFormValid || publishing" @click="handlePublish">
            {{ publishing ? '发布中...' : '立即发布' }}
          </el-button>
        </div>
      </div>

      <div class="create-main">
        <div class="editor-panel">
          <div class="form-section">
            <label class="form-label">任务标题 *</label>
            <input
              v-model="form.title"
              type="text"
              class="form-input title-input"
              placeholder="请输入任务标题，例如：分享一篇技术博客"
              maxlength="100"
            />
            <div class="char-count">{{ form.title.length }}/100</div>
          </div>

          <div class="form-section">
            <label class="form-label">任务描述</label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              rows="8"
              placeholder="请详细描述任务要求、完成标准、注意事项等..."
            ></textarea>
          </div>

          <div class="form-section">
            <label class="form-label">任务金额 (¥) *</label>
            <el-input-number
              v-model="form.amount"
              :min="0.01"
              :step="0.01"
              :precision="2"
              controls-position="right"
              style="width: 240px;"
            ></el-input-number>
            <div class="form-hint">设置完成任务后可分配的总金额，完成后将平分给所有完成者</div>
          </div>

          <div class="form-section">
            <label class="form-label">参与人数上限</label>
            <el-input-number
              v-model="form.max_participants"
              :min="0"
              :step="1"
              controls-position="right"
              style="width: 240px;"
            ></el-input-number>
            <div class="form-hint">0 表示不限制参与人数</div>
          </div>
        </div>

        <div class="sidebar-panel">
          <div class="sidebar-card">
            <h3 class="sidebar-title">发布须知</h3>
            <ul class="notice-list">
              <li>请确保任务内容合法合规</li>
              <li>任务金额一旦发布不可更改</li>
              <li>完成任务后余额将平分给所有完成者</li>
              <li>请勿发布虚假或欺诈性任务</li>
            </ul>
          </div>
          <div class="sidebar-card">
            <h3 class="sidebar-title">任务状态</h3>
            <div class="status-info">
              <div class="status-item">
                <span class="status-label">当前状态</span>
                <el-tag type="success">进行中</el-tag>
              </div>
              <div class="status-item">
                <span class="status-label">参与方式</span>
                <span class="status-text">注册用户均可参与</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TargetCreate',
  data() {
    return {
      publishing: false,
      form: {
        title: '',
        description: '',
        amount: 0,
        max_participants: 0,
      },
    };
  },
  computed: {
    isFormValid() {
      return this.form.title && this.form.title.trim().length > 0 && this.form.amount > 0;
    },
  },
  methods: {
    handleBack() {
      this.$router.push({ path: '/target' });
    },
    handlePublish() {
      if (!this.isFormValid) return;
      const user = this.$store.state.currentUser;
      if (!user || !user.id) {
        this.$notify({
          type: 'error',
          title: '请先登录',
          position: 'top-left',
          offset: 50,
        });
        return;
      }
      this.publishing = true;
      const params = {
        title: this.form.title.trim(),
        description: this.form.description.trim(),
        amount: parseFloat(this.form.amount),
        max_participants: parseInt(this.form.max_participants) || 0,
        creator_id: user.id,
      };
      this.$http
        .post(this.$constant.baseURL + '/task/create/', params)
        .then((res) => {
          if (res.result && !this.$common.isEmpty(res.result[0]) && res.result[0].code === 200) {
            this.$notify({
              type: 'success',
              title: '发布成功',
              message: '目标任务已发布',
              position: 'top-left',
              offset: 50,
            });
            this.$router.push({ path: '/target' });
          } else {
            this.$notify({
              type: 'error',
              title: '发布失败',
              message: (res.result && res.result[0] && res.result[0].message) || '未知错误',
              position: 'top-left',
              offset: 50,
            });
          }
        })
        .catch((error) => {
          this.$notify({
            type: 'error',
            title: '发布失败',
            message: error.message,
            position: 'top-left',
            offset: 50,
          });
        })
        .finally(() => {
          this.publishing = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.target-create-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.create-container {
  background: var(--card-background);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  .btn-back {
    background: none;
    border: none;
    color: var(--fontColor);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.2s;
    &:hover {
      background: var(--background);
    }
  }
  .create-title {
    font-size: 18px;
    color: var(--fontColor);
    margin: 0;
    font-weight: 600;
  }
  .header-actions {
    display: flex;
    gap: 10px;
  }
}
.create-main {
  display: flex;
  gap: 20px;
  padding: 24px;
}
.editor-panel {
  flex: 1;
  .form-section {
    margin-bottom: 24px;
    .form-label {
      display: block;
      color: var(--fontColor);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background);
      color: var(--fontColor);
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
      &:focus {
        border-color: var(--blue);
        box-shadow: 0 0 0 3px rgba(66, 90, 239, 0.1);
      }
    }
    .title-input {
      font-size: 16px;
      font-weight: 500;
    }
    .char-count {
      text-align: right;
      color: var(--text-muted);
      font-size: 12px;
      margin-top: 6px;
    }
    .form-textarea {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--background);
      color: var(--fontColor);
      font-size: 14px;
      line-height: 1.8;
      outline: none;
      resize: vertical;
      min-height: 160px;
      box-sizing: border-box;
      transition: all 0.2s;
      &:focus {
        border-color: var(--blue);
        box-shadow: 0 0 0 3px rgba(66, 90, 239, 0.1);
      }
    }
    .form-hint {
      color: var(--text-muted);
      font-size: 12px;
      margin-top: 8px;
      line-height: 1.5;
    }
  }
}
.sidebar-panel {
  width: 280px;
  flex-shrink: 0;
  .sidebar-card {
    background: var(--background);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid var(--border-color);
    .sidebar-title {
      font-size: 14px;
      color: var(--fontColor);
      margin: 0 0 12px;
      font-weight: 600;
    }
    .notice-list {
      margin: 0;
      padding-left: 18px;
      color: var(--text-muted);
      font-size: 13px;
      line-height: 1.8;
    }
    .status-info {
      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        .status-label {
          color: var(--text-muted);
          font-size: 13px;
        }
        .status-text {
          color: var(--fontColor);
          font-size: 13px;
        }
      }
    }
  }
}
@media screen and (max-width: 900px) {
  .create-main {
    flex-direction: column;
  }
  .sidebar-panel {
    width: 100%;
  }
}
</style>
