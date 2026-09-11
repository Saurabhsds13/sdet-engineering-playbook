---
title: Jenkins Pipelines for Test Automation
navTitle: Jenkins
slug: jenkins
category: devops
difficulty: intermediate
order: 20
status: published
tags:
  - devops
  - jenkins
  - ci
  - pipeline
related:
  - title: Maven
    url: /devops/maven/
  - title: GitHub Actions
    url: /devops/github-actions/
---

## Why this matters

Jenkins is still the most widely deployed CI server in enterprises. As an SDET
you'll be expected to run suites on it, read failures, publish reports, and
schedule regression runs. Knowing declarative pipelines makes you self-sufficient
instead of dependent on a DevOps team.

## Declarative pipeline basics

A `Jenkinsfile` lives in the repo and describes the build as code.

```groovy
pipeline {
    agent any
    parameters {
        choice(name: 'BROWSER', choices: ['chrome', 'firefox'], description: 'Browser')
        booleanParam(name: 'HEADLESS', defaultValue: true)
    }
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Test') {
            steps {
                sh "mvn clean test -Dbrowser=${params.BROWSER} -Dheadless=${params.HEADLESS}"
            }
        }
    }
    post {
        always {
            junit '**/target/surefire-reports/*.xml'
            archiveArtifacts artifacts: 'target/screenshots/**', allowEmptyArchive: true
        }
    }
}
```

## Parameters and environment

Parameters let a user pick browser/environment at run time. Environment
variables (and credentials) inject secrets without hardcoding them.

```groovy
environment {
    GRID_URL = credentials('grid-url')   // pulled from Jenkins credentials store
}
```

<div class="callout callout--warning">
<p class="callout__title">Never hardcode secrets</p>
<p>Use the Jenkins credentials store and the <code>credentials()</code> helper.
Secrets in a Jenkinsfile end up in version control and build logs.</p>
</div>

## Reports and artifacts

The `post` block publishes results even when the build fails:

- `junit` parses TestNG/JUnit XML for the trend graph.
- `archiveArtifacts` keeps screenshots and logs for debugging.
- Plugins like Allure or HTML Publisher render rich reports.

## Scheduling and parallel jobs

- **Cron triggers** run nightly regression: `triggers { cron('H 2 * * *') }`.
- **Parallel stages** split a big suite across agents to cut wall-clock time.

```groovy
stage('Cross-browser') {
    parallel {
        stage('Chrome')  { steps { sh 'mvn test -Dbrowser=chrome' } }
        stage('Firefox') { steps { sh 'mvn test -Dbrowser=firefox' } }
    }
}
```

## Debugging failed builds

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>When a Jenkins build fails: read the console log top-down for the first real
error (not the last), check whether it's an environment issue (browser/driver
mismatch, Grid down) or a genuine test failure, then open the archived
screenshots. Most "CI-only" failures are environment or timing differences, not
the test logic.</p>
</div>

## Common mistakes

- Putting cleanup in a stage instead of `post { always { } }`, so it's skipped
  on failure.
- Hardcoding secrets in the Jenkinsfile.
- Not publishing JUnit XML, so there's no failure trend.
- Blaming the test when the driver/browser versions differ from local.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Describe a declarative pipeline with checkout/test stages, parameters for
browser/env, secrets via the credentials store, JUnit + artifact publishing in
post, and cron-scheduled nightly regression. Then explain your process for
triaging a failed build.</p>
</div>

## Practice

Write a Jenkinsfile that parameterizes the browser, runs the suite headless,
publishes the TestNG XML, and archives screenshots on failure.
