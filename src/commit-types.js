const conventionalCommitTypes = {
    "types": {
        "feat": {
            "description": "新增功能（feature）",
            "title": "Features"
        },
        "fix": {
            "description": "修补bug",
            "title": "Bug Fixes"
        },
        "docs": {
            "description": "仅仅修改了文档，比如 README, CHANGELOG, CONTRIBUTE等等",
            "title": "Documentation"
        },
        "style": {
            "description": "仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑",
            "title": "Styles"
        },
        "refactor": {
            "description": "重构（即不是新增功能，也不是修改bug的代码变动）",
            "title": "Code Refactoring"
        },
        "perf": {
            "description": "优化相关，比如提升性能、体验",
            "title": "Performance Improvements"
        },
        "test": {
            "description": "增加测试，包括单元测试、集成测试等",
            "title": "Tests"
        },
        "build": {
            "description": "打包文件修改",
            "title": "Builds"
        },
        "ci": {
            "description": "自动化流程配置修改",
            "title": "Continuous Integrations"
        },
        "chore": {
            "description": "其他不修改src或测试文件的更改",
            "title": "Chores"
        },
        "revert": {
            "description": "回滚到之前一个版本",
            "title": "Reverts"
        }
    }
}

module.exports = conventionalCommitTypes