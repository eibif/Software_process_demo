function renderInlineBanner(flash) {
  if (!flash || !flash.message) {
    return "";
  }

  return `
    <div class="inline-banner" data-tone="${flash.tone}">
      <div><strong>${escapeHtml(flash.message)}</strong></div>
    </div>
  `;
}

function renderStatCard(label, value, trendText) {
  return `
    <div class="card stat-card">
      <div class="stat-card__label">${label}</div>
      <div class="stat-card__value">${value}</div>
      <div class="stat-card__trend">${trendText}</div>
    </div>
  `;
}

function renderQuickCard(icon, title, description) {
  return `
    <div class="quick-card">
      <span class="icon-badge">${icon}</span>
      <h4>${title}</h4>
      <p>${description}</p>
    </div>
  `;
}

function renderRoleBadges(roles) {
  return roles
    .map((role) => `<span class="badge" data-tone="primary">${roleLabels[role]}</span>`)
    .join("");
}

function renderStatusBadge(status) {
  return `<span class="badge" data-tone="${statusTones[status]}">${statusLabels[status]}</span>`;
}

function renderTableUser(user) {
  return `
    <div class="table-user">
      <div class="avatar">${escapeHtml(getInitials(user.name))}</div>
      <div class="table-user__meta">
        <div class="table-user__name">${escapeHtml(user.name)}</div>
        <div class="table-user__sub">${escapeHtml(user.loginName)} · ${escapeHtml(user.email)}</div>
      </div>
    </div>
  `;
}

function renderSelectOptions(options, selectedValue) {
  return options
    .map((option) => `<option value="${option.value}" ${option.value === selectedValue ? "selected" : ""}>${option.label}</option>`)
    .join("");
}

function renderRoleCheckbox(role, checked, helpText) {
  return `
    <label class="checkbox-card">
      <input type="checkbox" name="roles" value="${role}" ${checked ? "checked" : ""} />
      <span class="checkbox-label__text">
        <strong>${roleLabels[role]}</strong>
        <small>${helpText}</small>
      </span>
    </label>
  `;
}

function renderInfoItem(label, value) {
  return `
    <div class="info-item">
      <div class="info-item__label">${label}</div>
      <div class="info-item__value">${value}</div>
    </div>
  `;
}

function renderEmptyState(title, description) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">搜</div>
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
  `;
}

function renderSafetyNotices(count) {
  return `
    <div class="support-list">
      <div class="support-item">
        <span class="icon-badge">安</span>
        <div>
          <strong>账号状态巡检</strong>
          <div class="muted">当前共有 ${count} 个异常状态账号，建议优先复核。</div>
        </div>
      </div>
      <div class="support-item">
        <span class="icon-badge">角</span>
        <div>
          <strong>角色边界清晰</strong>
          <div class="muted">教师管理所属学生，管理员负责全平台角色与账号。</div>
        </div>
      </div>
      <div class="support-item">
        <span class="icon-badge">记</span>
        <div>
          <strong>关键操作留痕</strong>
          <div class="muted">登录、资料修改、角色切换与密码重置均会记录。</div>
        </div>
      </div>
    </div>
  `;
}
