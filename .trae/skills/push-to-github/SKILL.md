---
name: push-to-github
description: 将本项目提交 commit 并推送到 GitHub 仓库 lsy422。当用户要求把本项目提交到 github、推送到远程仓库、同步代码到 GitHub 时使用。不使用于其他项目或其他仓库。
---

# 提交到 GitHub

将本项目 `d:\联想\高级网页设计` 的更改提交 commit 并 push 到 GitHub 仓库 lsy422。

## 仓库信息

- SSH 地址（使用此地址）：`git@github.com:LSY0423190/lsy422.git`
- HTTPS 地址（仅参考，不使用）：`https://github.com/LSY0423190/lsy422.git`
- 认证方式：SSH 公钥认证，私钥为 `~/.ssh/id_ed25519`（默认文件名，ssh 自动加载，无需额外配置）

## 执行步骤

1. 所有命令在 `d:\联想\高级网页设计` 下执行。若尚未是 git 仓库，运行 `git init`。
2. 检查远程：`git remote -v`。
   - 无 origin：`git remote add origin git@github.com:LSY0423190/lsy422.git`
   - origin 为 HTTPS 地址：`git remote set-url origin git@github.com:LSY0423190/lsy422.git`
3. 运行 `git status` 与 `git diff` 查看改动，确认要提交的内容；参照仓库已有提交风格拟定简洁的 commit message（首行不超过 70 字）。
4. 按文件名暂存具体文件；不要用 `git add -A` / `git add .`，避免带入 `.env`、密钥、`node_modules` 等敏感或大体积文件。必要时先补充 `.gitignore`。
5. 使用 HEREDOC 形式提交：`git commit -m "..."`。不要 amend 已有提交，不要跳过 hooks。
6. 推送：
   - 首次推送：若本地分支为 master，先 `git branch -M main`，再 `git push -u origin main`
   - 后续推送：`git push`
   - 若远程已有提交导致冲突，先 `git pull --rebase origin main` 再推送，不要强推
7. 推送后运行 `git status` 确认工作区干净、本地与远程同步。

## 故障排查

- 认证失败（Permission denied）：运行 `ssh -T git@github.com` 验证公钥是否已添加到 GitHub 账户；确认 `~/.ssh/id_ed25519.pub` 存在。
- 远程仓库不存在或无权访问：提示用户在 GitHub 上确认仓库 `LSY0423190/lsy422` 已创建且有写权限。
