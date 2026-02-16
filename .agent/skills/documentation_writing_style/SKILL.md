---
name: Documentation Writing Style
description: Guidelines for writing technical documentation in the Oasis project, focusing on objectivity and concise language.
---

# Documentation Writing Style

This skill outlines the mandatory writing style for all Oasis project documentation. The goal is to maintain a professional, objective, and technical tone.

## 1. Core Principles

### 1.1 Objective & Technical (客观与技术性)

- **Describe the system, not the user.** Focus on what the software does, how features work, or what happens when an action is taken.
- **Avoid conversational fillers.** content should be concise and information-dense.

### 1.2 No Personal Pronouns (禁止第二人称)

- **Forbidden**: "You", "Your", "We", "I", "Us".
  - Chinese: "您", "你", "请".
- **Preferred**: Use imperative mood for instructions, or passive/neutral voice for descriptions.

#### Examples (Chinese)

| ❌ Bad (Incorrect)                                    | ✅ Good (Correct)                                                   |
| :---------------------------------------------------- | :------------------------------------------------------------------ |
| 请点击保存按钮。 (Please click the save button.)      | 点击 **保存** 按钮。 (Click the Save button.)                       |
| 这允许您修改规则。 (This allows you to modify rules.) | 此功能允许修改规则。 (This functionality allows rule modification.) |
| 您的配置已保存。 (Your configuration is saved.)       | 配置已保存。 (Configuration saved.)                                 |
| 如果您想要添加规则... (If you want to add a rule...)  | 若需添加规则... / 要添加规则... (To add a rule...)                  |

#### Examples (English)

| ❌ Bad (Incorrect)           | ✅ Good (Correct)       |
| :--------------------------- | :---------------------- |
| You should click the button. | Click the button.       |
| This lets you see the logs.  | This displays the logs. |
| Verify your settings.        | Verify the settings.    |

## 2. Formatting Standards

- **Bold UI Elements**: Always bold button names, menu items, and input labels. (e.g., Click **Save**).
- **Code Blocks**: Use backticks for strict technical terms, paths, values, and code snippets.
- **Lists**: Use bullet points for steps or features to improve readability.

## 3. Localization (Chinese Specific)

- **Spacing**: Add a space between Chinese characters and English words/Numbers (e.g., "使用 AutoProxy 格式" not "使用AutoProxy格式").
- **Punctuation**: Use full-width punctuation (，。：) in Chinese sentences, but half-width for code or technical contexts where appropriate.

## 4. Usage

Verify all documentation changes against these rules. If a user request introduces "You" or polite phrasing, refactor it to be objective.
