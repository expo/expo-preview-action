<div align="center">
  <h1>expo preview action</h1>
  <p></p>
  <p>Create a fast preview under each pull request to test changes in your <a href="https://github.com/expo/expo">Expo</a> app with Github Actions!</p>
  <sup>
    <a href="https://github.com/expo/expo-preview-action/releases">
      <img src="https://img.shields.io/github/release/expo/expo-preview-action/all.svg?style=flat-square" alt="releases" />
    </a>
    <a href="https://github.com/expo/expo-preview-action/actions">
      <img src="https://img.shields.io/github/workflow/status/expo/expo-preview-action/CI/main.svg?style=flat-square" alt="builds" />
    </a>
    <a href="https://github.com/expo/expo-preview-action/blob/main/LICENSE.md">
      <img src="https://img.shields.io/github/license/expo/expo-preview-action?style=flat-square" alt="license" />
    </a>
  </sup>
  <br />
  <p align="center">
    <a href="https://github.com/expo/expo-preview-action#-set-up"><b>Usage</b></a>
    &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
    <a href="https://github.com/expo/expo-preview-action#-example-workflows"><b>Examples</b></a>
    &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
    <a href="https://github.com/expo/expo-preview-action/blob/main/CHANGELOG.md"><b>Changelog</b></a>
  </p>
  <br />
</div>

## 📦 What's inside?

With this preview action, you can test changes made in pull requests via Expo Go or custom development client (created with [expo-dev-client](https://docs.expo.io/clients/introduction/)) just by scanning QR code.

## 🔧 Set up

This action requires `expo-cli` to be set up in your action environment. You can do it by yourself, but we encourage you to use [expo-github-action](https://github.com/expo/expo-github-action) to make this process as easy as possible.

> Note: You need to be login into `expo-cli`. [See (https://github.com/expo/expo-github-action#automatic-expo-login)].

> ⚠️ If you're using a custom development client, your native project needs to contain configured `expo-updates` to be able to open published applications.

## 🏃‍♂️ How it works

After adding this action to your workflow, it will publish your project using `expo-cli` and produce as an output two variables:

- `EXPO_MANIFEST_URL` - A URL pointing to the expo manifest of the published version.
- `EXPO_QR_CODE_URL` - A URL pointing to the generated QR code which can be scanned using Expo Go or custom development client.
- `EXPO_NEW_BUILD_IS_REQUIRED` - Whether a new build of your application is required to open generated preview.
- `EXPO_NEW_BUILD_IS_REQUIRED_MESSAGE` - If a new build of your application is required to open generated preview, it will contain a default warning message.

You can use those variables to do whatever you want. For example, you can chain this action with [unsplash/comment-on-pr](https://github.com/unsplash/comment-on-pr) to add a comment with QR code under pull request.

## ⚙️ Configuration options

This action is customizable through variables - they are defined in the [action.yml](action.yml). Here is a summary of all the variables that you can use and their purpose.

| variable                | required | description                                                                                                                                                                                                                            |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `channel`               | ✔️       | The name of the update channel where your application will be published. [Learn more](https://docs.expo.io/distribution/release-channels/).                                                                                            |
| `project-flavor`        | ❌       | The type of the project. Available options: 'development-client' or 'expo-go'. Defaults to 'development-client'.                                                                                                                       |
| `scheme`                | ❌       | The deep link scheme which will be used to open your project. This value isn't required, but we recommend setting it. Otherwise, action tries to guess the value. If you are using Expo Go to preview changes, this option is ignored. |
| `project-root`          | ❌       | The path to the folder where package.json lives. Defaults to main directory of the repository.                                                                                                                                         |
| `expo-cli-path`         | ❌       | The path to the `expo-cli`. If you're using the `expo-github-action` or `expo-cli` was installed in the `bin` folder, you should ignore this option.                                                                                   |
| `android-manifest-path` | ❌       | The path to the `AndroidManifest.xml`. If `scheme` was provided or you're using the managed workflow, this option is ignored.                                                                                                          |
| `ios-info-plist-path`   | ❌       | The path to the `Info.plist`. If `scheme` was provided or you're using the managed workflow, this option is ignored.                                                                                                                   |

## 📝 Example workflows

Before you dive into the workflow examples, you should know the basics of GitHub Actions.
You can read more about this in the [GitHub Actions documentation][link-actions].

- [Create a QR code under pull request](#create-a-qr-code-under-pull-request)
- [Create a preview only if app files were changed](#create-a-preview-only-if-app-files-were-changed)

### Create a QR code under pull request

Below you can see the example configuration to create a QR code on each pull request.
The workflow listens to the `pull_request` event and sets up Node 14 using the [Setup Node Action](https://help.github.com/en/categories/automating-your-workflow-with-github-actions).
It also auto-authenticates when the `token` is provided.

```yml
---
name: Create preview
on: [pull_request]
jobs:
  preview:
    name: Create preview
    runs-on: ubuntu-latest
    steps:
      - name: Set up repository
        uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v1
        with:
          node-version: 14.x
      - name: Set up Expo
        uses: expo/expo-github-action@v5
        with:
          expo-cache: true
          expo-version: 4.x
          expo-token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: yarn install
      - name: Publish to Expo & create a QR code
        uses: expo/expo-preview-action@v1
        with:
          channel: pr-${{ github.event.number }}
        id: preview
      - name: Comment deployment link
        uses: unsplash/comment-on-pr@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          msg: >
            Awesome! You can [preview the PR here](${{ steps.preview.outputs.EXPO_QR_CODE_URL }}).<br><br>
            <a href="${{ steps.publish.outputs.EXPO_QR_CODE_URL }}"><img src="${{ steps.preview.outputs.EXPO_QR_CODE_URL }}" height="512px" width="512px"></a>
            <br><br>
            ${{ steps.publish.outputs.EXPO_NEW_BUILD_IS_REQUIRED_MESSAGE }}
```

### Create a preview only if app files were changed

Below you can see the example configuration to create a QR code on each pull request, but only if app files were changed. The workflow listens to the pull_request event and sets up Node 14 using the [Setup Node Action](https://help.github.com/en/categories/automating-your-workflow-with-github-actions). It also auto-authenticates when the token is provided.

```yml
---
name: Create preview
on:
  pull_request:
    paths:
      - 'package.json'
      - 'app.json'
      - '**/*.js'
      - '**/*.ts'
jobs:
  preview:
    name: Create preview
    runs-on: ubuntu-latest
    steps:
      - name: Set up repository
        uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v1
        with:
          node-version: 14.x
      - name: Set up Expo
        uses: expo/expo-github-action@v5
        with:
          expo-cache: true
          expo-version: 4.x
          expo-token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: yarn install
      - name: Publish to Expo & create a QR code
        uses: expo/expo-preview-action@v1
        with:
          channel: pr-${{ github.event.number }}
        id: preview
      - name: Comment deployment link
        uses: unsplash/comment-on-pr@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          msg: >
            Awesome! You can [preview the PR here](${{ steps.preview.outputs.EXPO_QR_CODE_URL }}).<br><br>
            <a href="${{ steps.publish.outputs.EXPO_QR_CODE_URL }}"><img src="${{ steps.preview.outputs.EXPO_QR_CODE_URL }}" height="512px" width="512px"></a>
            <br><br>
            ${{ steps.publish.outputs.EXPO_NEW_BUILD_IS_REQUIRED_MESSAGE }}
```
