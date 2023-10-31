'format cjs';

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var chalk = require('chalk');

var filter = function (array) {
    return array.filter(function (x) {
        return x;
    });
};

var headerLength = function (answers) {
    return (
        answers.type.length + 2 + (answers.scope ? answers.scope.length + 2 : 0) + (answers.jiraId ? answers.jiraId?.length + 3 : 0) + (answers.filesExceedRemark !== 'none' ? answers.filesExceedRemark?.length + 1 : 0)
    );
};

var maxSummaryLength = function (options, answers) {
    return options.maxHeaderWidth - headerLength(answers);
};

var filterSubject = function (subject, disableSubjectLowerCase) {
    subject = subject.trim();
    if (!disableSubjectLowerCase && subject.charAt(0).toLowerCase() !== subject.charAt(0)) {
        subject =
            subject.charAt(0).toLowerCase() + subject.slice(1, subject.length);
    }
    while (subject.endsWith('.')) {
        subject = subject.slice(0, subject.length - 1);
    }
    return subject;
};


module.exports = function (options) {
    var types = options.types;
    var FilesExceedRemarkTypes = options.FilesExceedRemarkTypes;

    var length = longest(Object.keys(types)).length + 1;
    var choices = map(types, function (type, key) {
        return {
            name: (key + ':').padEnd(length) + ' ' + type.description,
            value: key
        };
    });

    var filesExceedRemarkChoices = map(FilesExceedRemarkTypes, function (type, key) {
        return {
            name: (key + ':').padEnd(length) + ' ' + type.description,
            value: key
        };
    });



    return {
        prompter: function (cz, commit) {
            cz.prompt([
                {
                    type: 'list',
                    name: 'type',
                    message: "选择您正在提交的更改类型:",
                    choices: choices,
                    default: options.defaultType
                },
                {
                    type: 'input',
                    name: 'scope',
                    message:
                        '此更改的范围是什么（例如组件或文件名）：（按enter键跳过）',
                    default: options.defaultScope,
                    filter: function (value) {
                        return options.disableScopeLowerCase
                            ? value.trim()
                            : value.trim().toLowerCase();
                    }
                },
                {
                    type: 'input',
                    name: 'jiraId',
                    message:
                        '此更改关联的JIRAID是什么？（按enter键跳过）',
                    default: options.defaultJiraId,
                    filter: function (value) {
                        return options.disableScopeLowerCase
                            ? value.trim()
                            : value.trim().toLowerCase();
                    }
                },
                {
                    type: 'list',
                    name: 'filesExceedRemark',
                    message: "文件超出10个或超出1000行备注:",
                    choices: filesExceedRemarkChoices,
                    default: options.defaultFilesExceedRemark
                },
                {
                    type: 'input',
                    name: 'subject',
                    message: function (answers) {
                        return (
                            '写一个简短的变化描述 (最多 ' +
                            maxSummaryLength(options, answers) +
                            ' 字符):\n'
                        );
                    },
                    default: options.defaultSubject,
                    validate: function (subject, answers) {
                        var filteredSubject = filterSubject(subject, options.disableSubjectLowerCase);
                        return filteredSubject.length == 0
                            ? 'subject是必填项'
                            : filteredSubject.length <= maxSummaryLength(options, answers)
                                ? true
                                : 'Subject长度必须小于或等于 ' +
                                maxSummaryLength(options, answers) +
                                ' 字符。当前长度为 ' +
                                filteredSubject.length +
                                ' 字符';
                    },
                    transformer: function (subject, answers) {
                        var filteredSubject = filterSubject(subject, options.disableSubjectLowerCase);
                        var color =
                            filteredSubject.length <= maxSummaryLength(options, answers)
                                ? chalk.green
                                : chalk.red;
                        return color('(' + filteredSubject.length + ') ' + subject);
                    },
                    filter: function (subject) {
                        return filterSubject(subject, options.disableSubjectLowerCase);
                    }
                },

                {
                    type: 'input',
                    name: 'body',
                    message:
                        '提供更改的详细说明：（按enter键跳过）\n',
                    default: options.defaultBody
                },
                {
                    type: 'confirm',
                    name: 'isBreaking',
                    message: '有什么突破性的变化吗?',
                    default: false
                },
                {
                    type: 'input',
                    name: 'breakingBody',
                    default: '-',
                    message:
                        '突破性的变化的提交需要一个主体。请输入提交本身的较长描述：\n',
                    when: function (answers) {
                        return answers.isBreaking && !answers.body;
                    },
                    validate: function (breakingBody, answers) {
                        return (
                            breakingBody.trim().length > 0 ||
                            '突破性的变化的主体是必填的'
                        );
                    }
                },
                {
                    type: 'input',
                    name: 'breaking',
                    message: '描述突破性变化:\n',
                    when: function (answers) {
                        return answers.isBreaking;
                    }
                },
                {
                    type: 'confirm',
                    name: 'isIssueAffected',
                    message: '此更改是否影响任何未解决的issues?',
                    default: options.defaultIssues ? true : false
                },
                {
                    type: 'input',
                    name: 'issuesBody',
                    default: '-',
                    message:
                        '如果issues已解决，则提交需要一个主体。请输入提交本身的较长描述:\n',
                    when: function (answers) {
                        return (
                            answers.isIssueAffected && !answers.body && !answers.breakingBody
                        );
                    }
                },
                {
                    type: 'input',
                    name: 'issues',
                    message: '添加问题参考 (e.g. "fix #123", "re #123".):\n',
                    when: function (answers) {
                        return answers.isIssueAffected;
                    },
                    default: options.defaultIssues ? options.defaultIssues : undefined
                }
            ]).then(function (answers) {
                var wrapOptions = {
                    trim: true,
                    cut: false,
                    newline: '\n',
                    indent: '',
                    width: options.maxLineWidth
                };

                // parentheses are only needed when a scope is present
                var jiraId = answers.jiraId ? '[' + answers.jiraId + ']' : ' ';

                var scope = answers.scope ? '(' + answers.scope + ')' : '';
                var filesExceedRemark = answers.filesExceedRemark !== 'none' ? answers.filesExceedRemark + ' ' : '';

                var fixChar = ' ' + answers.type?.slice(0, 1)?.toUpperCase();

                // Hard limit this line in the validate
                var head = answers.type + scope + ': ' + jiraId + fixChar + answers.subject + filesExceedRemark;

                // Wrap these lines at options.maxLineWidth characters
                var body = answers.body ? wrap(answers.body, wrapOptions) : false;

                // Apply breaking change prefix, removing it if already present
                var breaking = answers.breaking ? answers.breaking.trim() : '';
                breaking = breaking
                    ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '')
                    : '';
                breaking = breaking ? wrap(breaking, wrapOptions) : false;

                var issues = answers.issues ? wrap(answers.issues, wrapOptions) : false;

                commit(filter([head, body, breaking, issues]).join('\n\n'));
            });
        }
    };
};
