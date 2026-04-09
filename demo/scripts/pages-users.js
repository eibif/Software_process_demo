function renderUsersPage(ctx) {
  const filteredUsers = filterUsers(ctx.visibleUsers, appState.userFilters);
  const isAdmin = ctx.role === "Admin";
  const roleOptions = isAdmin
    ? [
        { value: "all", label: "全部角色" },
        { value: "Student", label: "学生" },
        { value: "Teacher", label: "教师" },
        { value: "Admin", label: "管理员" },
      ]
    : [
        { value: "all", label: "全部范围" },
        { value: "Student", label: "学生" },
        { value: "Teacher", label: "本人" },
      ];

  return {
    kicker: isAdmin ? "管理员视图" : "教师视图",
    title: isAdmin ? "用户管理" : "我的学生",
    description: isAdmin ? "查看、筛选并维护全平台用户资料与角色。" : "查看本人及所属学生信息，不展示管理员或其他教师账号。",
    actions: `
      <a class="btn btn--primary" href="#/users/new">${isAdmin ? "新增用户" : "新增学生"}</a>
      <button class="btn btn--secondary" type="button" data-action="reset-filters">重置筛选</button>
    `,
    content: `
      <section class="card">
        <form id="user-filters-form" class="filter-bar">
          <div class="filter-control">
            <label class="field-label" for="filter-query">关键词搜索</label>
            <input id="filter-query" name="query" placeholder="姓名 / 登录名 / 邮箱 / 班级" value="${escapeHtml(appState.userFilters.query)}" />
          </div>
          <div class="filter-control">
            <label class="field-label" for="filter-role">角色</label>
            <select id="filter-role" name="role">
              ${renderSelectOptions(roleOptions, appState.userFilters.role)}
            </select>
          </div>
          <div class="filter-control">
            <label class="field-label" for="filter-status">状态</label>
            <select id="filter-status" name="status">
              ${renderSelectOptions(
                [
                  { value: "all", label: "全部状态" },
                  { value: "active", label: "正常" },
                  { value: "locked", label: "已锁定" },
                  { value: "disabled", label: "已冻结" },
                ],
                appState.userFilters.status
              )}
            </select>
          </div>
          <div class="form-actions">
            <button class="btn btn--primary" type="submit">应用筛选</button>
          </div>
        </form>
      </section>
      <section class="table-card">
        <div class="table-toolbar">
          <div class="badge-row">
            <span class="badge" data-tone="primary">结果 ${filteredUsers.length} 条</span>
            <span class="badge" data-tone="success">范围：${ctx.scopeLabel}</span>
          </div>
        </div>
        ${filteredUsers.length ? renderUsersTable(filteredUsers, ctx) : renderEmptyState("没有找到符合条件的用户", "请尝试调整关键词、角色或状态筛选条件。")}
      </section>
    `,
  };
}

function renderUsersTable(users, ctx) {
  return `
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>用户</th>
            <th>角色</th>
            <th>班级 / 部门</th>
            <th>状态</th>
            <th>最近登录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${users
            .map((user) => {
              const canManage = canManageUserByScope(ctx.role, ctx.currentUser, user);
              const canEdit = canManage && hasPermission(ctx, "user:update");
              const canFreeze = canManage && hasPermission(ctx, "user:freeze");
              const canReset = canManage;

              return `
                <tr>
                  <td>${renderTableUser(user)}</td>
                  <td><div class="badge-row">${renderRoleBadges(user.roles)}</div></td>
                  <td>${escapeHtml(user.classId || user.department || "未设置")}</td>
                  <td>${renderStatusBadge(user.status)}</td>
                  <td>${formatDateTime(user.lastLoginAt)}</td>
                  <td>
                    <div class="table-actions">
                      <a class="btn btn--secondary" href="#/users/${user.id}">详情</a>
                      ${canEdit ? `<a class="btn btn--soft" href="#/users/${user.id}/edit">编辑</a>` : ""}
                      ${canFreeze ? renderStatusActionButton(user) : ""}
                      ${canReset ? `<button class="btn btn--warning-soft" type="button" data-action="reset-password" data-user-id="${user.id}">重置密码</button>` : ""}
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderStatusActionButton(user) {
  if (user.status === "active") {
    return `<button class="btn btn--danger-soft" type="button" data-action="toggle-user-status" data-next-status="disabled" data-user-id="${user.id}">冻结</button>`;
  }

  return `<button class="btn btn--success-soft" type="button" data-action="toggle-user-status" data-next-status="active" data-user-id="${user.id}">恢复</button>`;
}

function renderUserDetailPage(ctx, user) {
  if (!user) {
    return renderNotFoundPage(ctx, "没有找到对应的用户详情。", "当前请求的用户不存在或已被移除。");
  }

  const relatedLogs = ctx.auditLogs
    .filter((log) => log.targetId === user.id || log.userId === user.id)
    .slice(0, 6);
  const canManage = canManageUserByScope(ctx.role, ctx.currentUser, user);

  return {
    kicker: "用户详情",
    title: `${escapeHtml(user.name)} 的账号详情`,
    description: "查看用户资料、状态信息与最近操作。",
    actions: `
      ${canManage ? `<a class="btn btn--soft" href="#/users/${user.id}/edit">编辑用户</a>` : ""}
      <a class="btn btn--secondary" href="#/users">返回列表</a>
    `,
    content: `
      <section class="detail-grid">
        <div class="card">
          <div class="profile-banner">
            <div class="avatar">${escapeHtml(getInitials(user.name))}</div>
            <div>
              <div class="badge-row">${renderRoleBadges(user.roles)}</div>
              <h3 style="margin-top:10px">${escapeHtml(user.name)}</h3>
              <p>${escapeHtml(user.loginName)} · ${escapeHtml(user.email)}</p>
            </div>
          </div>
          <div class="detail-list" style="margin-top:18px">
            ${renderInfoItem("账号状态", renderStatusBadge(user.status))}
            ${renderInfoItem("角色", roleLabels[user.primaryRole])}
            ${renderInfoItem("班级", escapeHtml(user.classId || "未设置"))}
            ${renderInfoItem("部门", escapeHtml(user.department || "未设置"))}
            ${user.primaryRole === "Student" ? renderInfoItem("负责教师", escapeHtml(getAdvisorName(user.advisorId, ctx.users))) : ""}
            ${renderInfoItem("手机号", escapeHtml(user.phone || "未设置"))}
            ${renderInfoItem("创建时间", formatDateTime(user.createdAt))}
            ${renderInfoItem("最近登录", formatDateTime(user.lastLoginAt))}
          </div>
          <div class="panel-note">
            ${ctx.role === "Admin" ? "管理员可查看并维护全平台账号详情。" : "教师端仅查看本人及所属学生详情。"}
          </div>
        </div>
        <div class="card">
          <h3>最近操作</h3>
          <p>记录近期关键操作，便于回溯。</p>
          <div class="log-list" style="margin-top:14px">
            ${
              relatedLogs.length
                ? relatedLogs
                    .map((log) => `
                      <div class="log-item">
                        <div class="log-item__title">${escapeHtml(getActionLabel(log.action))}</div>
                        <div class="log-item__meta">${formatDateTime(log.timestamp)}</div>
                        <div class="log-item__meta">${escapeHtml(log.detail)}</div>
                      </div>
                    `)
                    .join("")
                : `<div class="muted">当前没有更多可展示的操作记录。</div>`
            }
          </div>
        </div>
      </section>
    `,
  };
}

function renderUserFormPage(ctx, user) {
  const editing = Boolean(user);
  const isAdmin = ctx.role === "Admin";
  const teacherOptions = getTeacherOptions(ctx.users);
  const resolvedUser =
    user ||
    ({
      name: "",
      loginName: "",
      email: "",
      phone: "",
      classId: "",
      department: isAdmin ? "" : ctx.currentUser.department,
      advisorId: isAdmin ? "" : ctx.currentUser.id,
      status: "active",
      roles: ["Student"],
      primaryRole: "Student",
      password: "",
    });

  const roleOptions = getAssignableRoles(ctx.role);
  const resolvedRole = resolvedUser.primaryRole || resolvedUser.roles?.[0] || roleOptions[0] || "Student";
  const advisorOptions = [{ value: "", label: "未分配" }].concat(
    teacherOptions.map((teacher) => ({ value: teacher.id, label: `${teacher.name} · ${teacher.loginName}` }))
  );

  return {
    kicker: editing ? "编辑用户" : isAdmin ? "新增用户" : "新增学生",
    title: editing ? `编辑 ${escapeHtml(resolvedUser.name)}` : isAdmin ? "新增用户" : "新增学生",
    description: isAdmin ? "维护基础资料、角色、归属教师与账号状态。" : "教师端仅创建和维护所属学生账号。",
    actions: `
      <a class="btn btn--secondary" href="${editing ? `#/users/${resolvedUser.id}` : "#/users"}">取消</a>
    `,
    content: `
      <section class="card">
        ${!isAdmin ? `<div class="panel-note">教师端创建的学生会自动归属到当前教师名下。</div>` : ""}
        <form id="user-form" data-user-id="${editing ? resolvedUser.id : ""}" class="form-grid">
          <div class="form-row--double">
            <div class="form-row">
              <label for="user-name">姓名</label>
              <input id="user-name" name="name" value="${escapeHtml(resolvedUser.name)}" placeholder="请输入姓名" />
            </div>
            <div class="form-row">
              <label for="user-loginName">登录名</label>
              <input id="user-loginName" name="loginName" value="${escapeHtml(resolvedUser.loginName)}" placeholder="学号 / 工号 / 账号" />
            </div>
          </div>
          <div class="form-row--double">
            <div class="form-row">
              <label for="user-email">邮箱</label>
              <input id="user-email" name="email" type="email" value="${escapeHtml(resolvedUser.email)}" placeholder="用于通知与找回密码" />
            </div>
            <div class="form-row">
              <label for="user-phone">手机号</label>
              <input id="user-phone" name="phone" value="${escapeHtml(resolvedUser.phone)}" placeholder="请输入手机号" />
            </div>
          </div>
          ${
            isAdmin
              ? `
                <div class="form-row">
                  <span class="field-label">角色分配</span>
                  <div class="role-picker">
                    ${renderRoleOption("Student", resolvedRole === "Student", "适用于学生个人工作台与考试入口")}
                    ${renderRoleOption("Teacher", resolvedRole === "Teacher", "适用于教师管理工作台")}
                    ${renderRoleOption("Admin", resolvedRole === "Admin", "适用于全平台用户与角色管理")}
                  </div>
                  <div class="hint-text">每个账号在当前版本中只分配一个角色。</div>
                </div>
                <div class="form-row">
                  <label for="user-status">账号状态</label>
                  <select id="user-status" name="status">
                    ${renderSelectOptions(
                      [
                        { value: "active", label: "正常" },
                        { value: "locked", label: "已锁定" },
                        { value: "disabled", label: "已冻结" },
                      ],
                      resolvedUser.status
                    )}
                  </select>
                </div>
              `
              : ""
          }
          <div class="form-row--double">
            <div class="form-row">
              <label for="user-classId">班级</label>
              <input id="user-classId" name="classId" value="${escapeHtml(resolvedUser.classId)}" placeholder="请输入班级或培养层次" />
            </div>
            <div class="form-row">
              <label for="user-department">学院 / 部门</label>
              <input id="user-department" name="department" value="${escapeHtml(resolvedUser.department)}" placeholder="请输入学院、专业或部门" />
            </div>
          </div>
          ${
            isAdmin
              ? `
                <div class="form-row">
                  <label for="user-advisorId">负责教师</label>
                  <select id="user-advisorId" name="advisorId">
                    ${renderSelectOptions(advisorOptions, resolvedUser.advisorId || "")}
                  </select>
                  <div class="hint-text">学生账号可指定负责教师；教师和管理员账号可留空。</div>
                </div>
              `
              : ""
          }
          <div class="form-row">
            <label for="user-password">${editing ? "更新密码（可选）" : "初始密码"}</label>
            <input id="user-password" name="password" type="password" placeholder="${editing ? "如不修改可留空" : "至少 8 位，包含字母和数字"}" />
            <div class="hint-text">
              ${editing ? "如填写新密码，将在保存后立即生效。" : "新建账号时需要设置一个符合规则的初始密码。"}
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn--primary" type="submit">${editing ? "保存修改" : isAdmin ? "创建用户" : "创建学生"}</button>
            <a class="btn btn--secondary" href="${editing ? `#/users/${resolvedUser.id}` : "#/users"}">取消</a>
          </div>
        </form>
      </section>
    `,
  };
}

