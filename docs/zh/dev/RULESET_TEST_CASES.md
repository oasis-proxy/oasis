# AutoProxy 规则集 (RuleSet) 测试用例

本文档为测试 Oasis 中的 AutoProxy 规则集功能提供了测试用例和示例规则集 URL。

## 测试规则集文件

### 1. 基础 AutoProxy 格式

**文件**: `test-ruleset-basic.txt`

```
[AutoProxy 0.2.9]
! Title: Basic Test RuleSet
! Last Modified: 2026-01-30
! Homepage: https://github.com/example/test-ruleset

! Google domains
||google.com
||googleapis.com
||gstatic.com

! Social media
||facebook.com
||twitter.com
||instagram.com

! Video streaming
||youtube.com
||youtu.be
||vimeo.com
```

**预期行为**:

- 应解析出 9 条域名规则
- 所有规则都应转换为通配符模式
- 示例：`||google.com` → `*.google.com*`

---

### 2. 混合规则类型

**文件**: `test-ruleset-mixed.txt`

```
[AutoProxy 0.2.9]
! Title: Mixed Rule Types Test
! Description: Tests different AutoProxy rule formats

! Domain anchors
||example.com
||test.org

! URL anchors
|https://api.example.com/v1/

! Regex patterns
/^https?:\/\/.*\.cdn\.example\.com\//
/\.m3u8$/

! Wildcard patterns
*analytics*
*tracking*

! Keyword matches
ads
tracker
```

**预期行为**:

- 域名锚点 (Domain anchors) → 通配符模式
- URL 锚点 (URL anchors) → 正则表达式模式
- 正则表达式模式 → 保持为正则表达式
- 通配符模式 → 通配符类型
- 关键字 (Keywords) → 通配符模式

---

### 3. Base64 编码 (gfwlist 格式)

**文件**: `test-ruleset-base64.txt`

```
W0F1dG9Qcm94eSAwLjIuOV0KISBUaXRsZTogQmFzZTY0IFRlc3QgUnVsZVNldAohIExhc3QgTW9kaWZpZWQ6IDIwMjYtMDEtMzAKCnx8Z29vZ2xlLmNvbQp8fGZhY2Vib29rLmNvbQp8fHR3aXR0ZXIuY29tCnx8eW91dHViZS5jb20=
```

**解码内容**:

```
[AutoProxy 0.2.9]
! Title: Base64 Test RuleSet
! Last Modified: 2026-01-30

||google.com
||facebook.com
||twitter.com
||youtube.com
```

**预期行为**:

- 应自动检测 Base64 编码
- 应正确解码并解析
- 应显示 4 条域名规则

---

### 4. 白名单规则 (当前跳过)

**文件**: `test-ruleset-whitelist.txt`

```
[AutoProxy 0.2.9]
! Title: Whitelist Test

! Blacklist rules
||blocked.com
||restricted.org

! Whitelist rules (should be skipped)
@@||allowed.com
@@||exception.org
```

**预期行为**:

- 应解析出 2 条黑名单规则
- 应跳过 2 条白名单规则 (@@)
- PAC 中的总规则数：2

---

### 5. 注释和空行

**文件**: `test-ruleset-comments.txt`

```
[AutoProxy 0.2.9]
! Title: Comments Test
! This is a comment

||example.com

! Another comment
! Multiple comment lines

||test.com

! Empty lines below


||demo.org
```

**预期行为**:

- 应忽略所有注释行（以 ! 开头）
- 应忽略空行
- 应解析出 3 条域名规则

---

### 6. 大型规则集 (性能测试)

**文件**: `test-ruleset-large.txt`

包含 1000+ 条规则，用于性能测试。

**预期行为**:

- 应处理大文件而不会冻结 UI
- 获取期间应显示加载指示器
- 应正确解析所有规则
- 应生成有效的 PAC 脚本

---

## 测试场景

### 场景 1: 添加新的规则集规则

**步骤**:

1. 创建一个新的“正常规则”
2. 将类型更改为“规则集”
3. 输入测试规则集 URL
4. 使输入框失去焦点

**预期**:

- 加载图标立即出现
- 内容从 URL 获取
- 加载图标变回眼睛图标
- 点击眼睛图标查看内容
- 内容显示在模态框中

---

### 场景 2: 类型更改触发

**步骤**:

1. 创建一个类型为“通配符”的新“正常规则”
2. 在模式字段中输入规则集 URL
3. 将类型从“通配符”更改为“规则集”

**预期**:

- 加载图标立即出现
- 自动获取内容
- 无需使输入框失去焦点

---

### 场景 3: 手动更新

**步骤**:

1. 打开规则集内容模态框（眼睛图标）
2. 点击“手动更新”按钮

**预期**:

- 按钮上出现加载转圈
- 内容被重新获取
- 上次更新时间戳被刷新
- 模态框中的内容已更新

---

### 场景 4: PAC 导出

**步骤**:

1. 添加多个规则集规则
2. 从下拉菜单导出 PAC 脚本
3. 打开导出的 PAC 文件

**预期**:

- 规则集规则被展开为单独的 PAC 条件
- 规则集中的每条规则都有自己的 `if` 语句
- 代理分配与规则的 proxyId 匹配
- PAC 脚本是有效的 JavaScript

---

### 场景 5: 错误处理

**步骤**:

1. 输入无效 URL（例如：`http://invalid-domain-12345.com/rules.txt`）
2. 使输入框失去焦点

**预期**:

- 出现加载图标
- 超时后，加载图标消失
- 错误存储在 `rule.ruleSet.fetchError` 中
- 用户仍然可以点击眼睛图标查看之前的内容（如果有）

---

## 示例测试 URL

### 公共规则集 URL（用于测试）

```
# gfwlist (Base64 编码)
https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt

# 纯文本格式
https://raw.githubusercontent.com/example/rules/main/proxy-rules.txt
```

### 本地测试服务器

进行本地测试时，您可以创建一个简单的 HTTP 服务器：

```bash
# 创建测试文件
cat > test-ruleset.txt << 'EOF'
[AutoProxy 0.2.9]
! Test RuleSet
||google.com
||facebook.com
||twitter.com
EOF

# 启动 HTTP 服务器 (Python 3)
python3 -m http.server 8000

# 在 Oasis 中使用的 URL
http://localhost:8000/test-ruleset.txt
```

---

## 验证清单 (Checklist)

### UI 验证

- [ ] 加载图标旋转顺滑
- [ ] 失去焦点时出现加载图标
- [ ] 类型更改时出现加载图标
- [ ] 加载期间眼睛图标可点击
- [ ] 加载后眼睛图标可点击
- [ ] 模态框显示正确内容
- [ ] 显示上次更新时间戳
- [ ] 手动更新按钮生效

### 数据验证

- [ ] Base64 内容已解码
- [ ] 纯文本内容已解析
- [ ] 忽略注释
- [ ] 忽略空行
- [ ] 跳过白名单规则
- [ ] 域名锚点转换正确
- [ ] 保留正则表达式模式
- [ ] URL 锚点转换为正则表达式

### PAC 生成

- [ ] 规则集规则已展开
- [ ] 每条规则生成一个 PAC 条件
- [ ] 代理分配正确
- [ ] PAC 脚本是有效 JavaScript
- [ ] PAC 脚本在浏览器中运行正常

### 错误处理

- [ ] 无效 URL 显示错误
- [ ] 处理网络错误
- [ ] 处理超时错误
- [ ] 存储错误信息
- [ ] 出错时清除加载状态

---

## 已知问题

1. **白名单规则**: 目前跳过，未实现
2. **AutoProxy 中的 IPv6**: 可能需要额外测试
3. **特殊字符**: 模式中的某些特殊字符可能需要转义

---

## 未来计划

1. 支持白名单规则 (@@)
2. 规则冲突检测
3. 自动更新调度
4. 模态框中的规则统计
5. 规则集内容模态框中的搜索/过滤
