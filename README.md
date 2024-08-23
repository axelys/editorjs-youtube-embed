![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Video Embed Tool

An [Editor.js](https://editorjs.io) plugin to embed videos from YouTube, RuTube, and VKontakte.
Simply copy and paste the video URL to embed.

![](assets/demo.gif)

## Installation

### Install via NPM

Get the package

```shell
npm i editorjs-video-embed
```

Include module in your application

```javascript
const VideoEmbed = require('editorjs-video-embed');
```

### Download to your project's source dir

1. Download folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...
  
  tools: {
    ...
    videoEmbed: VideoEmbed,
  }
  
  ...
});
```

## Config Params

This tool has no config params

## Features

- Embed videos from YouTube, RuTube, and VKontakte
- Add captions to embedded videos
- Internationalization (i18n) support

## Output data

| Field   | Type     | Description                |
|---------|----------|----------------------------|
| url     | `string` | video url                  |
| caption | `string` | caption text (can be HTML) |

```json
{
    "type" : "videoEmbed",
    "data" : {
        "url" : "https://www.youtube.com/watch?v=L229QDxDakU",
        "caption" : "This is a caption for the video"
    }
}
```

## Internationalization

To enable proper localization, pass translation strings when initializing Editor.js:

```javascript
var editor = EditorJS({
  ...
  i18n: {
    messages: {
      tools: {
        video: {
          'Paste a YouTube, RuTube, or VKontakte video URL': 'Вставьте URL видео YouTube, RuTube или ВКонтакте',
          'Invalid video URL': 'Недействительный URL видео',
          'Enter a caption': 'Введите подпись'
        }
      }
    }
  }
  ...
});
```

## Development

To modify or extend this plugin, follow these steps:

1. Clone the repository
2. Install dependencies: `npm install`
3. Make your changes in the `src` directory
4. Build the plugin: `npm run build`
5. Test your changes using the provided demo page

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
