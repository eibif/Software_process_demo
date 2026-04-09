function renderProfilePage(ctx) {
  return {
    kicker: "个人中心",
    title: "个人中心",
    description: "查看并维护个人资料与登录信息。",
    actions: `
      <a class="btn btn--primary" href="#/dashboard">返回首页</a>
    `,
    content: `
      <section class="profile-grid">
        <div class="card">
          <div class="profile-banner">
            <div class="avatar">${escapeHtml(getInitials(ctx.currentUser.name))}</div>
            <div>
              <div class="badge-row">${renderRoleBadges(ctx.currentUser.roles)}</div>
              <h3 style="margin-top:10px">${escapeHtml(ctx.currentUser.name)}</h3>
              <div class="muted">${escapeHtml(ctx.currentUser.loginName)} · ${escapeHtml(ctx.currentUser.email)}</div>
            </div>
          </div>
          <form id="profile-form" class="form-grid" style="margin-top:20px">
            <div class="form-row--double">
              <div class="form-row">
                <label for="profile-name">姓名</label>
                <input id="profile-name" name="name" value="${escapeHtml(ctx.currentUser.name)}" />
              </div>
              <div class="form-row">
                <label for="profile-email">邮箱</label>
                <input id="profile-email" name="email" type="email" value="${escapeHtml(ctx.currentUser.email)}" />
              </div>
            </div>
            <div class="form-row--double">
              <div class="form-row">
                <label for="profile-phone">手机号</label>
                <input id="profile-phone" name="phone" value="${escapeHtml(ctx.currentUser.phone)}" />
              </div>
              <div class="form-row">
                <label for="profile-classId">班级</label>
                <input id="profile-classId" name="classId" value="${escapeHtml(ctx.currentUser.classId)}" />
              </div>
            </div>
            <div class="form-row">
              <label for="profile-department">学院 / 部门</label>
              <input id="profile-department" name="department" value="${escapeHtml(ctx.currentUser.department)}" />
            </div>
            <div class="form-actions">
              <button class="btn btn--primary" type="submit">保存资料</button>
            </div>
          </form>
        </div>
        <div class="card">
          <h3>登录与角色信息</h3>
          <p>用于确认当前会话、角色与可见范围。</p>
          <div class="detail-list" style="margin-top:14px">
            ${renderInfoItem("当前角色", roleLabels[ctx.role])}
            ${renderInfoItem("可见范围", ctx.scopeLabel)}
            ${renderInfoItem("会话编号", escapeHtml(ctx.session.sessionId))}
            ${renderInfoItem("登录时间", formatDateTime(ctx.session.loginAt))}
            ${renderInfoItem("账号状态", statusLabels[ctx.currentUser.status])}
            ${renderInfoItem("最近登录", formatDateTime(ctx.currentUser.lastLoginAt))}
          </div>
          <div class="panel-note">
            菜单会随当前角色自动调整；若检测到异地登录，需要重新认证。
          </div>
          <div class="footer-note">
            ${
              ctx.currentUser.roles.length > 1
                ? "当前账号支持多角色切换。"
                : "当前账号为单角色视图。"
            }
          </div>
        </div>
      </section>
    `,
  };
}

function renderForbiddenPage(ctx, message, detail = "当前角色无法访问此页面。", backHref = "#/dashboard") {
  return {
    kicker: "访问控制",
    title: "无权访问",
    description: detail,
    actions: `
      <a class="btn btn--primary" href="${backHref}">返回上一页</a>
      <a class="btn btn--secondary" href="#/profile">查看个人中心</a>
    `,
    content: `
      <section class="forbidden-wrap">
        <div class="card forbidden-card">
          <div class="forbidden-code">403</div>
          <h3>${escapeHtml(message)}</h3>
          <p>当前角色为 <strong>${roleLabels[ctx.role]}</strong>，可见范围为 <strong>${ctx.scopeLabel}</strong>。</p>
        </div>
      </section>
    `,
  };
}

function renderNotFoundPage(ctx, description = "目标页面不存在或已经被移动。", detail = "当前地址没有对应内容。") {
  return {
    kicker: "页面状态",
    title: "页面不存在",
    description,
    actions: `
      <a class="btn btn--primary" href="#/dashboard">回到首页</a>
    `,
    content: `
      <section class="forbidden-wrap">
        <div class="card forbidden-card">
          <div class="forbidden-code">404</div>
          <h3>当前地址没有对应内容</h3>
          <p>${escapeHtml(detail)}</p>
        </div>
      </section>
    `,
  };
}
